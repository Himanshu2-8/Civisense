from datetime import datetime
from uuid import UUID
from typing import Any
from pydantic import BaseModel, ConfigDict


class CommentResponse(BaseModel):
    id: UUID
    document_id: UUID
    stakeholder_type: str
    content: str
    topic: str | None = None
    raw_issue: str | None = None
    canonical_issue: str | None = None
    clause: str | None = None
    sentiment: str | None = "neutral"
    sentiment_score: float | None = None
    recommendation: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConsensusData(BaseModel):
    agreements: list[str] = []
    disagreements: list[str] = []
    recommendations: list[str] = []


class AnalysisStartResponse(BaseModel):
    document_id: UUID
    status: str
    comments_extracted: int = 0


class AnalysisDetailResponse(BaseModel):
    document_id: UUID
    overall_summary: str
    stakeholder_summary: dict[str, Any]
    consensus: dict[str, Any]
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
