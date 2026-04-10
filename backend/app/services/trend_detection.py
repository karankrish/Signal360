from collections import Counter, defaultdict
from app.models.feedback import FeedbackRecord


def get_top_issues(records: list[FeedbackRecord], top_n: int = 10) -> list[dict]:
    """Count issue_tags frequency across all records."""
    counter: Counter = Counter()
    for r in records:
        counter.update(r.issue_tags)
    return [{"issue": tag, "count": count} for tag, count in counter.most_common(top_n)]


def get_issue_trend_over_time(records: list[FeedbackRecord]) -> list[dict]:
    """Weekly rolling count per issue_tag for charting."""
    # Group by week + issue
    weekly: dict[str, Counter] = defaultdict(Counter)
    for r in records:
        week = r.timestamp.strftime("%Y-W%W")
        for tag in r.issue_tags:
            weekly[week][tag] += 1

    # Collect all unique tags across weeks
    all_tags: set[str] = set()
    for counter in weekly.values():
        all_tags.update(counter.keys())

    result = []
    for week in sorted(weekly.keys()):
        entry = {"week": week}
        for tag in sorted(all_tags):
            entry[tag] = weekly[week].get(tag, 0)
        result.append(entry)
    return result


def get_topic_by_channel(records: list[FeedbackRecord]) -> list[dict]:
    """Issue distribution broken down by channel."""
    channel_issues: dict[str, Counter] = defaultdict(Counter)
    for r in records:
        for tag in r.issue_tags:
            channel_issues[r.channel][tag] += 1

    result = []
    for channel, counter in channel_issues.items():
        for tag, count in counter.most_common(5):
            result.append({"channel": channel, "issue": tag, "count": count})
    return result


def get_product_sentiment(records: list[FeedbackRecord]) -> list[dict]:
    """Average sentiment score per product_name."""
    product_scores: dict[str, list[float]] = defaultdict(list)
    for r in records:
        if r.sentiment_score is not None:
            product_scores[r.product_name].append(r.sentiment_score)

    result = []
    for product, scores in product_scores.items():
        avg = round(sum(scores) / len(scores), 4)
        result.append({
            "product": product,
            "avg_sentiment": avg,
            "review_count": len(scores),
        })
    return sorted(result, key=lambda x: x["avg_sentiment"])
