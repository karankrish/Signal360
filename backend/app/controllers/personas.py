from fastapi import APIRouter
from app.repositories.feedback_repo import feedback_repo
from app.services import persona

router = APIRouter()


@router.get("/personas")
def get_personas():
    """Sentiment and issue breakdown by customer segment."""
    records = feedback_repo.get_all()
    insights = persona.get_persona_insights(records)
    return {"personas": [p.model_dump() for p in insights]}
