from datetime import datetime
from uuid import UUID
from typing import Any
from pydantic import BaseModel, ConfigDict
from app.schemas.analysis import CommentResponse


class SentimentBreakdown(BaseModel):
    positive: int = 0
    negative: int = 0
    neutral: int = 0
    total: int = 0
    positive_pct: float = 0.0
    negative_pct: float = 0.0
    neutral_pct: float = 0.0
    avg_score: float = 0.0


class ClauseStat(BaseModel):
    clause: str
    mention_count: int
    positive: int
    negative: int
    neutral: int
    dominant_sentiment: str


class StakeholderBreakdown(BaseModel):
    stakeholder_type: str
    count: int
    positive: int
    negative: int
    neutral: int
    summary: str | None = None


class TopicBreakdown(BaseModel):
    topic: str
    count: int
    percentage: float


class DashboardResponse(BaseModel):
    document_id: UUID
    filename: str
    uploaded_at: datetime
    total_comments: int
    overall_summary: str
    sentiment_overview: SentimentBreakdown
    clauses: list[ClauseStat]
    stakeholders: list[StakeholderBreakdown]
    topics: list[TopicBreakdown]
    consensus: dict[str, Any]
    comments: list[CommentResponse]

    model_config = ConfigDict(from_attributes=True)
