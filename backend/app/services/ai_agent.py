import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool

from app.models.feedback import FeedbackRecord
from app.services import sentiment as sentiment_svc
from app.services import trend_detection, event_detection, prediction, persona

# Load .env so OPENAI_API_KEY is available when running via uvicorn
load_dotenv()


def build_agent(records: list[FeedbackRecord]) -> AgentExecutor:
    """Build a LangChain tool-calling agent pre-loaded with data context."""

    # Pre-compute summaries once for tool closures
    stats = sentiment_svc.get_overall_stats(records)
    top_issues = trend_detection.get_top_issues(records, top_n=5)
    events = event_detection.detect_spikes(records)
    risks = prediction.get_risk_scores(records)
    personas = persona.get_persona_insights(records)

    @tool
    def get_sentiment_summary() -> str:
        """Returns current overall sentiment statistics for the Nike feedback dataset."""
        return (
            f"Total records: {stats.get('total_records', 0)}\n"
            f"Average sentiment score: {stats.get('avg_sentiment', 0)}\n"
            f"Positive: {stats.get('positive_pct', 0)}% | "
            f"Neutral: {stats.get('neutral_pct', 0)}% | "
            f"Negative: {stats.get('negative_pct', 0)}%\n"
            f"Average rating: {stats.get('avg_rating', 0)}/5"
        )

    @tool
    def get_top_issues() -> str:
        """Returns the top 5 most frequent customer issues from feedback."""
        lines = [f"{i+1}. {item['issue']} ({item['count']} occurrences)"
                 for i, item in enumerate(top_issues)]
        return "\n".join(lines) if lines else "No issues found."

    @tool
    def get_event_alerts() -> str:
        """Returns detected event spikes (anomalous negative feedback surges)."""
        if not events:
            return "No significant event spikes detected."
        lines = [f"- {e.date}: {e.description} Issues: {', '.join(e.dominant_issues)}"
                 for e in events[:3]]
        return "\n".join(lines)

    @tool
    def get_risk_assessment() -> str:
        """Returns current risk scores for stock-out, app failures, and customer churn."""
        lines = [f"- {r.risk_type}: {r.level.upper()} ({r.score:.0%}) — {r.description}"
                 for r in risks]
        return "\n".join(lines) if lines else "No risk data available."

    @tool
    def get_persona_breakdown() -> str:
        """Returns sentiment breakdown by customer segment (Sneakerhead, Gen Z, Athlete, etc.)."""
        lines = [
            f"- {p.segment}: sentiment={p.avg_sentiment}, rating={p.avg_rating}/5, "
            f"top issues: {', '.join(p.top_issues[:2]) or 'none'}"
            for p in personas
        ]
        return "\n".join(lines) if lines else "No persona data available."

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=os.environ.get("OPENAI_API_KEY"),
        max_tokens=2048,
        temperature=0.3,
    )

    tools = [
        get_sentiment_summary,
        get_top_issues,
        get_event_alerts,
        get_risk_assessment,
        get_persona_breakdown,
    ]

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            (
                "You are Signal360's retail intelligence AI for Nike. "
                "You analyze omni-channel customer feedback and produce actionable business intelligence. "
                "Use ALL available tools to gather data before writing your report.\n\n"
                "Structure your report with these sections:\n\n"
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
    """Run the AI agent and return a structured markdown intelligence report."""
    if not records:
        return "No data available to analyze."
    executor = build_agent(records)
    result = executor.invoke({
        "input": (
            "Analyze the Nike customer feedback dataset. "
            "Use all available tools to gather data, then produce the full Signal360 intelligence report."
        )
    })
    return result.get("output", "Report generation failed.")
