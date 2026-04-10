import traceback
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
        return {"report": report}
    except Exception as e:
        detail = f"{type(e).__name__}: {str(e)}"
        print(f"[Signal360] /api/insights error:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=detail)
