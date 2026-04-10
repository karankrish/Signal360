import os
import json
import tempfile
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from app.repositories.feedback_repo import feedback_repo
from app.services.ingestion import load_and_preprocess
from app.services import sentiment as sentiment_svc

router = APIRouter()

DATA_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "data")
)


@router.post("/ingest")
def ingest_data(filename: str = Query(default="data.json")):
    """Load a data file from /data/ directory and run sentiment analysis."""
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")
    records = load_and_preprocess(file_path)
    records = sentiment_svc.analyze_batch(records)
    feedback_repo.load(records)
    return {"status": "ok", "records_loaded": len(records), "file": filename}


@router.post("/ingest/upload")
async def upload_and_ingest(file: UploadFile = File(...)):
    """Accept a JSON file upload, process it, and load into memory."""
    if not file.filename or not file.filename.lower().endswith((".json", ".txt")):
        raise HTTPException(
            status_code=400,
            detail="Only .json or .txt files are accepted.",
        )

    contents = await file.read()

    # Validate JSON
    try:
        data = json.loads(contents)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Invalid JSON: {str(e)}")

    if not isinstance(data, list):
        raise HTTPException(
            status_code=422,
            detail="JSON must be an array of feedback objects.",
        )

    # Write to temp file and process through the ingestion pipeline
    with tempfile.NamedTemporaryFile(
        mode="wb", suffix=".json", delete=False
    ) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        records = load_and_preprocess(tmp_path)
        records = sentiment_svc.analyze_batch(records)
        feedback_repo.load(records)
    finally:
        os.unlink(tmp_path)

    return {
        "status": "ok",
        "records_loaded": len(records),
        "file": file.filename,
    }


@router.get("/feedback")
def get_feedback(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, le=200),
    channel: str = Query(default=None),
    segment: str = Query(default=None),
):
    """Return paginated feedback records with computed sentiment."""
    records = feedback_repo.get_all()
    if channel:
        records = [r for r in records if r.channel == channel]
    if segment:
        records = [r for r in records if r.customer_segment == segment]
    total = len(records)
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "records": [r.model_dump() for r in records[start:end]],
    }
