from fastapi import APIRouter
from app.repositories.feedback_repo import feedback_repo
from app.services import cross_channel

router = APIRouter()


@router.get("/channels")
def get_channels():
    """Cross-channel sentiment comparison, issue heatmap, and correlations."""
    records = feedback_repo.get_all()
    return {
        "sentiment_by_channel": cross_channel.get_channel_sentiment_comparison(records),
        "issue_channel_heatmap": cross_channel.get_issue_channel_heatmap(records),
        "cross_channel_correlations": cross_channel.get_cross_channel_correlation(records),
    }
