from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document
from app.schemas.dashboard import (
    ClauseStat,
    DashboardResponse,
    SentimentBreakdown,
    StakeholderBreakdown,
    TopicBreakdown,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Modern FastAPI Annotated dependencies
DatabaseSession = Annotated[Session, Depends(get_db)]
AutoAnalyzeParam = Annotated[
    bool,
    Query(description="Automatically run analysis if not yet analyzed"),
]


def _resolve_document_id(doc_identifier: str, db: Session) -> UUID:
    """Helper to resolve a document UUID or the keyword 'latest'."""
    if doc_identifier.lower() == "latest":
        latest_doc = db.query(Document).order_by(Document.uploaded_at.desc()).first()
        if not latest_doc:
            raise HTTPException(
                status_code=404,
                detail="No consultation documents found. Please upload a PDF first.",
            )
        return latest_doc.id

    try:
        return UUID(doc_identifier)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document UUID format: '{doc_identifier}'",
        )


@router.get("", response_model=DashboardResponse)
@router.get("/", response_model=DashboardResponse)
@router.get("/latest", response_model=DashboardResponse)
async def get_latest_dashboard(
    db: DatabaseSession,
    auto_analyze: AutoAnalyzeParam = True,
):
    """Retrieve dashboard data for the most recently uploaded consultation document."""
    latest_doc = db.query(Document).order_by(Document.uploaded_at.desc()).first()
    if not latest_doc:
        raise HTTPException(
            status_code=404,
            detail="No consultation documents found. Please upload a PDF first.",
        )
    return await DashboardService.get_dashboard_data(
        document_id=latest_doc.id,
        db=db,
        auto_analyze=auto_analyze,
    )


@router.get("/{document_id}", response_model=DashboardResponse)
async def get_dashboard_data(
    document_id: str,
    db: DatabaseSession,
    auto_analyze: AutoAnalyzeParam = True,
):
    """Retrieve full dashboard analytics for a specific consultation document (or 'latest')."""
    resolved_id = _resolve_document_id(document_id, db)
    return await DashboardService.get_dashboard_data(
        document_id=resolved_id,
        db=db,
        auto_analyze=auto_analyze,
    )


@router.get("/{document_id}/sentiment", response_model=SentimentBreakdown)
async def get_dashboard_sentiment(
    document_id: str,
    db: DatabaseSession,
):
    """Retrieve sentiment breakdown metrics for a consultation document."""
    resolved_id = _resolve_document_id(document_id, db)
    dashboard = await DashboardService.get_dashboard_data(document_id=resolved_id, db=db)
    return dashboard.sentiment_overview


@router.get("/{document_id}/clauses", response_model=list[ClauseStat])
async def get_dashboard_clauses(
    document_id: str,
    db: DatabaseSession,
):
    """Retrieve clause-level intelligence metrics for a consultation document."""
    resolved_id = _resolve_document_id(document_id, db)
    dashboard = await DashboardService.get_dashboard_data(document_id=resolved_id, db=db)
    return dashboard.clauses


@router.get("/{document_id}/stakeholders", response_model=list[StakeholderBreakdown])
async def get_dashboard_stakeholders(
    document_id: str,
    db: DatabaseSession,
):
    """Retrieve stakeholder perspectives and summaries for a consultation document."""
    resolved_id = _resolve_document_id(document_id, db)
    dashboard = await DashboardService.get_dashboard_data(document_id=resolved_id, db=db)
    return dashboard.stakeholders


@router.get("/{document_id}/topics", response_model=list[TopicBreakdown])
async def get_dashboard_topics(
    document_id: str,
    db: DatabaseSession,
):
    """Retrieve high-frequency topic clusters for a consultation document."""
    resolved_id = _resolve_document_id(document_id, db)
    dashboard = await DashboardService.get_dashboard_data(document_id=resolved_id, db=db)
    return dashboard.topics
