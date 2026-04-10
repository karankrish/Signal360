from collections import Counter, defaultdict
from statistics import mean, stdev
from app.models.feedback import FeedbackRecord, EventAlert


def detect_spikes(records: list[FeedbackRecord]) -> list[EventAlert]:
    """Detect days with anomalous negative feedback using z-score (> 2σ)."""
    # Group negative records by day
    daily_neg: dict[str, list[FeedbackRecord]] = defaultdict(list)
    for r in records:
        if r.sentiment_label == "negative" or r.rating <= 2:
            day = r.timestamp.date().isoformat()
            daily_neg[day].append(r)

    if len(daily_neg) < 3:
        return []

    days = sorted(daily_neg.keys())
    counts = [len(daily_neg[d]) for d in days]

    avg = mean(counts)
    try:
        std = stdev(counts)
    except Exception:
        std = 1.0

    threshold = avg + 2 * std
    alerts: list[EventAlert] = []

    for day, count in zip(days, counts):
        if count > threshold and std > 0:
            z_score = (count - avg) / std
            neg_records = daily_neg[day]

            # Identify dominant issues
            issue_counter: Counter = Counter()
            for r in neg_records:
                issue_counter.update(r.issue_tags)
            dominant_issues = [tag for tag, _ in issue_counter.most_common(3)]

            # Identify affected products
            affected_products = list({r.product_name for r in neg_records})[:3]

            description = _generate_description(day, dominant_issues, count, z_score)

            alerts.append(EventAlert(
                date=day,
                spike_magnitude=round(z_score, 2),
                dominant_issues=dominant_issues,
                affected_products=affected_products,
                description=description,
            ))

    return sorted(alerts, key=lambda a: a.spike_magnitude, reverse=True)


def _generate_description(
    day: str, issues: list[str], count: int, z_score: float
) -> str:
    if not issues:
        return f"Unusual spike of {count} negative signals on {day} (z={z_score:.1f}σ)."
    issue_str = ", ".join(issues[:2])
    return (
        f"Spike detected on {day}: {count} negative signals ({z_score:.1f}σ above baseline). "
        f"Dominant issues: {issue_str}."
    )
