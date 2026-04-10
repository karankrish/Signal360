from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from app.models.feedback import FeedbackRecord, RiskScore


def _get_recent_records(records: list[FeedbackRecord], days: int = 7) -> list[FeedbackRecord]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    # If all data is synthetic/historical, use last N days relative to latest timestamp
    if records:
        max_ts = max(r.timestamp for r in records)
        cutoff = max_ts - timedelta(days=days)
    return [r for r in records if r.timestamp >= cutoff]


def get_risk_scores(records: list[FeedbackRecord]) -> list[RiskScore]:
    """Rule-based risk scoring for stock-out, app failure, and churn."""
    recent = _get_recent_records(records, days=7)
    total = max(len(recent), 1)

    issue_counter: Counter = Counter()
    for r in recent:
        issue_counter.update(r.issue_tags)

    # Stock-out risk
    stock_out_count = issue_counter.get("stock_out", 0) + issue_counter.get("bots", 0)
    stock_out_score = min(stock_out_count / total, 1.0)
    stock_out_level = _score_level(stock_out_score)

    # App failure risk
    app_fail_count = issue_counter.get("app_crash", 0) + issue_counter.get("app_glitch", 0) + \
                     issue_counter.get("checkout_error", 0) + issue_counter.get("payment_failure", 0)
    app_fail_score = min(app_fail_count / total, 1.0)
    app_fail_level = _score_level(app_fail_score)

    # Churn risk: segments with very low avg sentiment
    segment_scores: dict[str, list[float]] = defaultdict(list)
    for r in recent:
        if r.sentiment_score is not None:
            segment_scores[r.customer_segment].append(r.sentiment_score)
    churn_score = 0.0
    if segment_scores:
        avg_scores = [sum(v) / len(v) for v in segment_scores.values()]
        worst = min(avg_scores)
        # Normalize: -1 → score=1.0, +1 → score=0.0
        churn_score = max(0.0, min((-worst + 1) / 2, 1.0))
    churn_level = _score_level(churn_score)

    return [
        RiskScore(
            risk_type="Stock-out / Bot Activity",
            score=round(stock_out_score, 3),
            level=stock_out_level,
            description=f"{stock_out_count} stock-out/bot signals in last 7 days",
        ),
        RiskScore(
            risk_type="App / Platform Failure",
            score=round(app_fail_score, 3),
            level=app_fail_level,
            description=f"{app_fail_count} app crash/checkout failure signals in last 7 days",
        ),
        RiskScore(
            risk_type="Customer Churn",
            score=round(churn_score, 3),
            level=churn_level,
            description="Based on worst-performing customer segment sentiment",
        ),
    ]


def forecast_sentiment(records: list[FeedbackRecord], days_ahead: int = 7) -> list[dict]:
    """Simple linear trend extrapolation on daily sentiment scores."""
    # Aggregate by day
    daily: dict[str, list[float]] = defaultdict(list)
    for r in records:
        if r.sentiment_score is not None:
            daily[r.timestamp.date().isoformat()].append(r.sentiment_score)

    days = sorted(daily.keys())
    if len(days) < 2:
        return []

    # Build (x, y) pairs: x = day index, y = avg sentiment
    xs = list(range(len(days)))
    ys = [sum(daily[d]) / len(daily[d]) for d in days]

    # Linear regression (least squares)
    n = len(xs)
    sum_x = sum(xs)
    sum_y = sum(ys)
    sum_xy = sum(x * y for x, y in zip(xs, ys))
    sum_xx = sum(x * x for x in xs)
    denom = n * sum_xx - sum_x ** 2
    slope = (n * sum_xy - sum_x * sum_y) / denom if denom != 0 else 0
    intercept = (sum_y - slope * sum_x) / n

    # Generate forecast points
    from datetime import date, timedelta
    last_date = date.fromisoformat(days[-1])
    result = []
    for i in range(1, days_ahead + 1):
        future_x = len(days) - 1 + i
        predicted = intercept + slope * future_x
        predicted = max(-1.0, min(1.0, predicted))  # clamp to valid range
        future_date = (last_date + timedelta(days=i)).isoformat()
        result.append({"date": future_date, "predicted_sentiment": round(predicted, 4), "is_forecast": True})

    return result


def _score_level(score: float) -> str:
    if score >= 0.6:
        return "critical"
    elif score >= 0.4:
        return "high"
    elif score >= 0.2:
        return "medium"
    return "low"
