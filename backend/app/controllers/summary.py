from fastapi import APIRouter
from app.repositories.feedback_repo import feedback_repo
from app.services import sentiment as sentiment_svc, trend_detection, event_detection

router = APIRouter()


@router.get("/summary")
def get_summary():
    """Dashboard KPI summary: total records, avg sentiment, top issue, alert count."""
    records = feedback_repo.get_all()
    if not records:
        return {"status": "empty", "message": "No data loaded."}

    stats = sentiment_svc.get_overall_stats(records)
    top_issues = trend_detection.get_top_issues(records, top_n=1)
    alerts = event_detection.detect_spikes(records)

    return {
        "total_records": stats.get("total_records", 0),
        "avg_sentiment": stats.get("avg_sentiment", 0),
        "avg_rating": stats.get("avg_rating", 0),
        "positive_pct": stats.get("positive_pct", 0),
        "neutral_pct": stats.get("neutral_pct", 0),
        "negative_pct": stats.get("negative_pct", 0),
        "top_issue": top_issues[0]["issue"] if top_issues else "N/A",
        "alert_count": len(alerts),
        "channels": list({r.channel for r in records}),
        "segments": list({r.customer_segment for r in records}),
    }
