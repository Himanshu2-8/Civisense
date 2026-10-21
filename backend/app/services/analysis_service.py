from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.comment import Comment
from app.models.document import Document
from app.services.extraction_service import ExtractionService
from app.services.llm_service import LLMService
from app.services.sentiment_service import SentimentService
from app.services.clustering_service import ClusteringService
from app.services.comment_service import CommentService


class AnalysisService:
    @staticmethod
    async def analyze_document(document_id: UUID, db: Session) -> dict:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # 1. Extract text and split into manageable chunks
        chunks = await ExtractionService.extract_text(document.file_path)

        # 2. Extract structured consultation comments
        raw_comments = await LLMService.extract_comments(chunks)

        if not raw_comments:
            raise HTTPException(status_code=400, detail="Could not extract consultation comments from document")

        # 3. Canonicalize issues and cluster topics
        clustered_comments = ClusteringService.cluster_and_canonicalize(raw_comments)

        # 4. Perform Sentiment Analysis and score confidence
        sentiment_results = await SentimentService.analyze_batch(
            [c.get("content", "") for c in clustered_comments]
        )
        for comment, s_res in zip(clustered_comments, sentiment_results):
            comment["sentiment"] = s_res["sentiment"]
            comment["sentiment_score"] = s_res["score"]

        # 5. Clean up any existing prior comments and analysis for this document (idempotent re-run)
        db.execute(delete(Comment).where(Comment.document_id == document_id))
        db.execute(delete(Analysis).where(Analysis.document_id == document_id))
        db.commit()

        # 6. Persist structured comments
        created_comments = CommentService.create_comments(clustered_comments, document.id, db)

        # 7. Generate High-Level Analysis summaries and consensus
        overall = await LLMService.generate_summary(clustered_comments)
        stakeholder_summary = await LLMService.generate_stakeholder_summary(clustered_comments)
        consensus = await LLMService.generate_consensus(clustered_comments)

        # 8. Save Analysis record
        analysis = Analysis(
            document_id=document.id,
            overall_summary=overall or "",
            stakeholder_summary=stakeholder_summary or {},
            consensus=consensus or {},
        )

        try:
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to save analysis: {str(e)}")

        return {
            "document_id": document.id,
            "status": "analysis_completed",
            "comments_extracted": len(created_comments),
        }
