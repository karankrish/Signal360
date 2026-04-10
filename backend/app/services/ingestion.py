import json
from datetime import datetime, timezone
from app.models.feedback import FeedbackRecord


def load_and_preprocess(file_path: str) -> list[FeedbackRecord]:
    """Load JSON feedback file and normalize all records."""
    with open(file_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    records = []
    for item in raw:
        # Normalize timestamp to UTC-aware datetime
        ts_str = item.get("timestamp", "")
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        except Exception:
            ts = datetime.now(timezone.utc)

        # Normalize issue_tags: strip whitespace, lowercase, filter empties
        raw_tags = item.get("issue_tags", [])
        if isinstance(raw_tags, str):
            raw_tags = [raw_tags]
        issue_tags = [
            t.strip().lower() for t in raw_tags
            if t and t.strip().lower() not in ("n/a", "none", "")
        ]

        record = FeedbackRecord(
            feedback_id=item.get("feedback_id", ""),
            timestamp=ts,
            source=item.get("source", "").strip().lower(),
            channel=item.get("channel", "").strip().lower(),
            location=item.get("location", "").strip(),
            product_name=item.get("product_name", "").strip(),
            category=item.get("category", "").strip(),
            customer_segment=item.get("customer_segment", "").strip(),
            text=item.get("text", "").strip(),
            rating=int(item.get("rating", 3)),
            issue_tags=issue_tags,
        )
        records.append(record)

    return records
