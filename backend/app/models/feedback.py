from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class FeedbackRecord(BaseModel):
    feedback_id: str
    timestamp: datetime
    source: str
    channel: str
    location: str
    product_name: str
    category: str
    customer_segment: str
    text: str
    rating: int
    issue_tags: list[str]
    sentiment_score: Optional[float] = None   # computed by NLP, not pre-labeled
    sentiment_label: Optional[str] = None     # "positive" | "neutral" | "negative"


class EventAlert(BaseModel):
    date: str
    spike_magnitude: float
    dominant_issues: list[str]
    affected_products: list[str]
    description: str


class RiskScore(BaseModel):
    risk_type: str
    score: float          # 0.0 to 1.0
    level: str            # "low" | "medium" | "high" | "critical"
    description: str


class PersonaInsight(BaseModel):
    segment: str
    avg_sentiment: float
    avg_rating: float
    record_count: int
    top_issues: list[str]
    most_complained_product: str


class SentimentPoint(BaseModel):
    date: str
    avg_sentiment: float
    positive_count: int
    neutral_count: int
    negative_count: int
    total_count: int
