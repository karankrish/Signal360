from collections import defaultdict
from datetime import date
from textblob import TextBlob
from app.models.feedback import FeedbackRecord, SentimentPoint


def _textblob_polarity(text: str) -> float:
    """Return TextBlob polarity in range [-1, 1]."""
    try:
        return TextBlob(text).sentiment.polarity
    except Exception:
        return 0.0


def _normalize_rating(rating: int) -> float:
    """Map 1-5 star rating to [-1, 1] scale."""
    return (rating - 3) / 2.0


def _score_to_label(score: float) -> str:
    if score > 0.1:
        return "positive"
    elif score < -0.1:
        return "negative"
    return "neutral"


def analyze_batch(records: list[FeedbackRecord]) -> list[FeedbackRecord]:
    """Enrich each record with computed sentiment_score and sentiment_label.

    Combined score: 70% TextBlob polarity + 30% normalized rating.
    Sentiment is computed — not pre-labeled.
    """
    for record in records:
        nlp_score = _textblob_polarity(record.text)
        rating_score = _normalize_rating(record.rating)
        combined = 0.7 * nlp_score + 0.3 * rating_score
        record.sentiment_score = round(combined, 4)
        record.sentiment_label = _score_to_label(combined)
    return records


def get_sentiment_timeline(records: list[FeedbackRecord]) -> list[SentimentPoint]:
    """Aggregate sentiment scores by calendar day."""
    daily: dict[str, list[float]] = defaultdict(list)
    daily_labels: dict[str, list[str]] = defaultdict(list)

    for r in records:
        if r.sentiment_score is None:
            continue
        day = r.timestamp.date().isoformat()
        daily[day].append(r.sentiment_score)
        daily_labels[day].append(r.sentiment_label or "neutral")

    points = []
    for day in sorted(daily.keys()):
        scores = daily[day]
        labels = daily_labels[day]
        points.append(SentimentPoint(
            date=day,
            avg_sentiment=round(sum(scores) / len(scores), 4),
            positive_count=labels.count("positive"),
            neutral_count=labels.count("neutral"),
            negative_count=labels.count("negative"),
            total_count=len(scores),
        ))
    return points


def get_overall_stats(records: list[FeedbackRecord]) -> dict:
    """Return overall sentiment statistics."""
    scored = [r for r in records if r.sentiment_score is not None]
    if not scored:
        return {}
    scores = [r.sentiment_score for r in scored]
    labels = [r.sentiment_label for r in scored]
    return {
        "total_records": len(scored),
        "avg_sentiment": round(sum(scores) / len(scores), 4),
        "positive_pct": round(labels.count("positive") / len(labels) * 100, 1),
        "neutral_pct": round(labels.count("neutral") / len(labels) * 100, 1),
        "negative_pct": round(labels.count("negative") / len(labels) * 100, 1),
        "avg_rating": round(sum(r.rating for r in scored) / len(scored), 2),
    }
