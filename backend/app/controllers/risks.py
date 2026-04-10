from fastapi import APIRouter, Query
from app.repositories.feedback_repo import feedback_repo
from app.services import prediction

router = APIRouter()


@router.get("/risks")
def get_risks(days_ahead: int = Query(default=7, ge=1, le=30)):
    """Risk scores and 7-day sentiment forecast."""
    records = feedback_repo.get_all()
    return {
        "risk_scores": [r.model_dump() for r in prediction.get_risk_scores(records)],
        "sentiment_forecast": prediction.forecast_sentiment(records, days_ahead=days_ahead),
    }
