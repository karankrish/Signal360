from fastapi import APIRouter
from app.repositories.feedback_repo import feedback_repo
from app.services import event_detection

router = APIRouter()


@router.get("/events")
def get_events():
    """Detected event spikes with dominant issues and affected products."""
    records = feedback_repo.get_all()
    alerts = event_detection.detect_spikes(records)
    return {
        "alert_count": len(alerts),
        "alerts": [a.model_dump() for a in alerts],
    }
