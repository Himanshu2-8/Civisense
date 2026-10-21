from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.services.analysis_service import AnalysisService
from app.services.comment_service import CommentService
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisStartResponse, AnalysisDetailResponse, CommentResponse

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/{document_id}", response_model=AnalysisStartResponse)
async def start_analysis(document_id: UUID, db: Session = Depends(get_db)):
    result = await AnalysisService.analyze_document(document_id=document_id, db=db)
    return result


@router.get("/{document_id}", response_model=AnalysisDetailResponse)
def get_analysis(document_id: UUID, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this document")

    return {
        "document_id": analysis.document_id,
        "overall_summary": analysis.overall_summary,
        "stakeholder_summary": analysis.stakeholder_summary,
        "consensus": analysis.consensus,
        "created_at": analysis.created_at,
    }


@router.get("/{document_id}/comments", response_model=list[CommentResponse])
def get_document_comments(document_id: UUID, db: Session = Depends(get_db)):
    comments = CommentService.get_comments(document_id=document_id, db=db)
    return comments
