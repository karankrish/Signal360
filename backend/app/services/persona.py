from collections import Counter, defaultdict
from app.models.feedback import FeedbackRecord, PersonaInsight


def get_persona_insights(records: list[FeedbackRecord]) -> list[PersonaInsight]:
    """Group records by customer_segment and compute per-segment metrics."""
    segments: dict[str, list[FeedbackRecord]] = defaultdict(list)
    for r in records:
        segments[r.customer_segment].append(r)

    insights = []
    for segment, seg_records in segments.items():
        scores = [r.sentiment_score for r in seg_records if r.sentiment_score is not None]
        ratings = [r.rating for r in seg_records]

        avg_sentiment = round(sum(scores) / len(scores), 4) if scores else 0.0
        avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0

        # Top issues
        issue_counter: Counter = Counter()
        for r in seg_records:
            issue_counter.update(r.issue_tags)
        top_issues = [tag for tag, _ in issue_counter.most_common(5)]

        # Most complained product (by negative records)
        product_neg: Counter = Counter()
        for r in seg_records:
            if r.sentiment_label == "negative" or r.rating <= 2:
                product_neg[r.product_name] += 1
        most_complained = product_neg.most_common(1)[0][0] if product_neg else "N/A"

        insights.append(PersonaInsight(
            segment=segment,
            avg_sentiment=avg_sentiment,
            avg_rating=avg_rating,
            record_count=len(seg_records),
            top_issues=top_issues,
            most_complained_product=most_complained,
        ))

    return sorted(insights, key=lambda x: x.avg_sentiment)
