from fastapi import APIRouter, Query
from app.repositories.feedback_repo import feedback_repo
from app.services import trend_detection

router = APIRouter()


@router.get("/trends")
def get_trends(top_n: int = Query(default=10, ge=1, le=30)):
    """Top issues, weekly issue trends, channel breakdown, and product sentiment."""
    records = feedback_repo.get_all()
    return {
        "top_issues": trend_detection.get_top_issues(records, top_n=top_n),
        "issue_trend_over_time": trend_detection.get_issue_trend_over_time(records),
        "topic_by_channel": trend_detection.get_topic_by_channel(records),
        "product_sentiment": trend_detection.get_product_sentiment(records),
    }
