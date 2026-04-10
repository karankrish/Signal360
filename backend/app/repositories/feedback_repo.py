from datetime import datetime
from typing import Optional
from app.models.feedback import FeedbackRecord


class FeedbackRepository:
    """Singleton in-memory store for feedback records."""

    def __init__(self):
        self._records: list[FeedbackRecord] = []

    def load(self, records: list[FeedbackRecord]) -> None:
        self._records = records

    def get_all(self) -> list[FeedbackRecord]:
        return self._records

    def get_by_channel(self, channel: str) -> list[FeedbackRecord]:
        return [r for r in self._records if r.channel == channel]

    def get_by_segment(self, segment: str) -> list[FeedbackRecord]:
        return [r for r in self._records if r.customer_segment == segment]

    def get_by_source(self, source: str) -> list[FeedbackRecord]:
        return [r for r in self._records if r.source == source]

    def get_by_date_range(
        self, start: datetime, end: datetime
    ) -> list[FeedbackRecord]:
        return [r for r in self._records if start <= r.timestamp <= end]

    def get_by_issue_tag(self, tag: str) -> list[FeedbackRecord]:
        return [r for r in self._records if tag in r.issue_tags]

    def count(self) -> int:
        return len(self._records)

    def is_empty(self) -> bool:
        return len(self._records) == 0


# Singleton instance used across the application
feedback_repo = FeedbackRepository()
