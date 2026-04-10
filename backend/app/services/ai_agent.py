import os
import traceback
from pathlib import Path
from dotenv import load_dotenv

# Explicitly point to backend/.env regardless of cwd
_ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import StructuredTool

from app.models.feedback import FeedbackRecord
from app.services import sentiment as sentiment_svc
from app.services import trend_detection, event_detection, prediction, persona


def _build_tools(stats: dict, top_issues: list, events: list, risks: list, personas: list) -> list:
    """Build LangChain tools from pre-computed data. Uses StructuredTool for closure safety."""

    def sentiment_summary_fn() -> str:
        return (
            f"Total records: {stats.get('total_records', 0)}\n"
            f"Average sentiment score: {stats.get('avg_sentiment', 0)}\n"
            f"Positive: {stats.get('positive_pct', 0)}% | "
            f"Neutral: {stats.get('neutral_pct', 0)}% | "
            f"Negative: {stats.get('negative_pct', 0)}%\n"
            f"Average rating: {stats.get('avg_rating', 0)}/5"
        )

    def top_issues_fn() -> str:
        lines = [f"{i+1}. {item['issue']} ({item['count']} occurrences)"
                 for i, item in enumerate(top_issues)]
        return "\n".join(lines) if lines else "No issues found."

    def event_alerts_fn() -> str:
        if not events:
            return "No significant event spikes detected."
        lines = [f"- {e.date}: {e.description} Issues: {', '.join(e.dominant_issues)}"
                 for e in events[:3]]
        return "\n".join(lines)

    def risk_assessment_fn() -> str:
        lines = [f"- {r.risk_type}: {r.level.upper()} ({r.score:.0%}) — {r.description}"
                 for r in risks]
        return "\n".join(lines) if lines else "No risk data available."

    def persona_breakdown_fn() -> str:
        lines = [
            f"- {p.segment}: sentiment={p.avg_sentiment}, rating={p.avg_rating}/5, "
            f"top issues: {', '.join(p.top_issues[:2]) or 'none'}"
            for p in personas
        ]
        return "\n".join(lines) if lines else "No persona data available."

    return [
        StructuredTool.from_function(
            func=sentiment_summary_fn,
            name="get_sentiment_summary",
            description="Returns overall sentiment statistics: total records, avg score, positive/neutral/negative breakdown, avg rating.",
        ),
        StructuredTool.from_function(
            func=top_issues_fn,
            name="get_top_issues",
            description="Returns the top 5 most frequent customer issues from feedback with occurrence counts.",
        ),
        StructuredTool.from_function(
            func=event_alerts_fn,
            name="get_event_alerts",
            description="Returns detected event spikes — days with anomalous negative feedback surges.",
        ),
        StructuredTool.from_function(
            func=risk_assessment_fn,
            name="get_risk_assessment",
            description="Returns current risk scores for stock-out, app failures, and customer churn.",
        ),
        StructuredTool.from_function(
            func=persona_breakdown_fn,
            name="get_persona_breakdown",
            description="Returns sentiment breakdown by customer segment: Sneakerhead, Gen Z, Athlete, Casual, etc.",
        ),
    ]


def _fallback_report(stats: dict, top_issues: list, events: list, risks: list) -> str:
    """Template-based report when LLM is unavailable."""
    top_issue = top_issues[0]["issue"] if top_issues else "N/A"
    top_event = events[0].description if events else "No critical events detected."
    top_risk = f"{risks[0].risk_type}: {risks[0].level}" if risks else "N/A"

    return f"""## Executive Summary

Signal360 analyzed **{stats.get('total_records', 0)} feedback records** across Nike's omni-channel touchpoints.
Overall sentiment score is **{stats.get('avg_sentiment', 0):.3f}** with
{stats.get('positive_pct', 0)}% positive, {stats.get('neutral_pct', 0)}% neutral,
and {stats.get('negative_pct', 0)}% negative responses. Average rating: {stats.get('avg_rating', 0):.1f}/5.

## Top 3 Critical Issues

1. **{top_issues[0]["issue"] if len(top_issues) > 0 else "N/A"}** — {top_issues[0]["count"] if len(top_issues) > 0 else 0} occurrences
2. **{top_issues[1]["issue"] if len(top_issues) > 1 else "N/A"}** — {top_issues[1]["count"] if len(top_issues) > 1 else 0} occurrences
3. **{top_issues[2]["issue"] if len(top_issues) > 2 else "N/A"}** — {top_issues[2]["count"] if len(top_issues) > 2 else 0} occurrences

## Recommended Actions

1. Address **{top_issue}** immediately — highest volume issue impacting customer satisfaction
2. Investigate event spikes: {top_event}
3. Monitor risk: {top_risk}
4. Engage lowest-sentiment customer segments with targeted outreach
5. Implement real-time alerting for issue tag spikes exceeding 2σ baseline

## Risk Outlook

{"  ".join([f"**{r.risk_type}**: {r.level.upper()} ({r.score:.0%})" for r in risks])}
"""


def build_agent(records: list[FeedbackRecord]) -> AgentExecutor:
    stats = sentiment_svc.get_overall_stats(records)
    top_issues = trend_detection.get_top_issues(records, top_n=5)
    events = event_detection.detect_spikes(records)
    risks = prediction.get_risk_scores(records)
    personas = persona.get_persona_insights(records)

    tools = _build_tools(stats, top_issues, events, risks, personas)

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=os.environ.get("OPENAI_API_KEY"),
        max_tokens=2048,
        temperature=0.3,
    )

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            (
                "You are Signal360's retail intelligence AI for Nike. "
                "You analyze omni-channel customer feedback and produce actionable business intelligence. "
                "Use ALL available tools to gather data before writing your report.\n\n"
                "Structure your report with these exact sections:\n\n"
                "## Executive Summary\n"
                "## Top 3 Critical Issues (with root cause analysis)\n"
                "## Recommended Actions (prioritized, with expected impact)\n"
                "## Risk Outlook\n\n"
                "Be concise, data-driven, and specific to Nike operations. "
                "Always cite numbers from the tools (e.g. exact counts, percentages, scores)."
            ),
        ),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=False, max_iterations=8)


def generate_report(records: list[FeedbackRecord]) -> str:
    """Run the AI agent. Falls back to template report if LLM fails."""
    if not records:
        return "No data available to analyze."

    # Pre-compute for potential fallback
    stats = sentiment_svc.get_overall_stats(records)
    top_issues = trend_detection.get_top_issues(records, top_n=5)
    events = event_detection.detect_spikes(records)
    risks = prediction.get_risk_scores(records)

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        print("[Signal360] OPENAI_API_KEY not set — using fallback report.")
        return _fallback_report(stats, top_issues, events, risks)

    try:
        executor = build_agent(records)
        result = executor.invoke({
            "input": (
                "Analyze the Nike customer feedback dataset. "
                "Use all available tools to gather data, then produce the full Signal360 intelligence report."
            )
        })
        return result.get("output", "Report generation failed.")
    except Exception as e:
        print(f"[Signal360] AI agent error: {e}\n{traceback.format_exc()}")
        return _fallback_report(stats, top_issues, events, risks)
