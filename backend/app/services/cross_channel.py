from collections import Counter, defaultdict
from app.models.feedback import FeedbackRecord


def get_channel_sentiment_comparison(records: list[FeedbackRecord]) -> list[dict]:
    """Average sentiment per channel (social/offline/online/survey)."""
    channel_scores: dict[str, list[float]] = defaultdict(list)
    channel_ratings: dict[str, list[int]] = defaultdict(list)

    for r in records:
        if r.sentiment_score is not None:
            channel_scores[r.channel].append(r.sentiment_score)
            channel_ratings[r.channel].append(r.rating)

    result = []
    for channel, scores in channel_scores.items():
        ratings = channel_ratings[channel]
        result.append({
            "channel": channel,
            "avg_sentiment": round(sum(scores) / len(scores), 4),
            "avg_rating": round(sum(ratings) / len(ratings), 2),
            "record_count": len(scores),
        })
    return sorted(result, key=lambda x: x["avg_sentiment"])


def get_issue_channel_heatmap(records: list[FeedbackRecord]) -> list[dict]:
    """Matrix of issue_tag × channel occurrence counts."""
    matrix: dict[str, Counter] = defaultdict(Counter)
    for r in records:
        for tag in r.issue_tags:
            matrix[tag][r.channel] += 1

    channels = sorted({r.channel for r in records})
    result = []
    for tag, counter in matrix.items():
        entry = {"issue": tag, "total": sum(counter.values())}
        for ch in channels:
            entry[ch] = counter.get(ch, 0)
        result.append(entry)

    return sorted(result, key=lambda x: x["total"], reverse=True)[:15]


def get_cross_channel_correlation(records: list[FeedbackRecord]) -> list[dict]:
    """Issues appearing across 2+ channels (within 48h window)."""
    # Group records by issue_tag → list of (timestamp, channel)
    tag_appearances: dict[str, list[tuple]] = defaultdict(list)
    for r in records:
        for tag in r.issue_tags:
            tag_appearances[tag].append((r.timestamp, r.channel))

    result = []
    for tag, appearances in tag_appearances.items():
        channels_seen = {ch for _, ch in appearances}
        if len(channels_seen) >= 2:
            result.append({
                "issue": tag,
                "channels": sorted(channels_seen),
                "occurrence_count": len(appearances),
                "cross_channel": True,
            })

    return sorted(result, key=lambda x: x["occurrence_count"], reverse=True)
