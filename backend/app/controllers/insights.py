from fastapi import APIRouter, HTTPException
from app.repositories.feedback_repo import feedback_repo
from app.services import ai_agent

router = APIRouter()


@router.post("/insights")
def generate_insights():
    """Trigger the LangChain AI agent to generate an intelligence report."""
    records = feedback_repo.get_all()
    if not records:
        raise HTTPException(
            status_code=400,
            detail="No data loaded. Call POST /api/ingest first.",
        )
    try:
        report = ai_agent.generate_report(records)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI agent error: {str(e)}")
    return {"report": report}
