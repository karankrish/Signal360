from fastapi import APIRouter
from app.repositories.feedback_repo import feedback_repo
from app.services import sentiment as sentiment_svc

router = APIRouter()


@router.get("/sentiment")
def get_sentiment():
    """Daily sentiment timeline and overall statistics."""
    records = feedback_repo.get_all()
    return {
        "timeline": [p.model_dump() for p in sentiment_svc.get_sentiment_timeline(records)],
        "overall": sentiment_svc.get_overall_stats(records),
    }
