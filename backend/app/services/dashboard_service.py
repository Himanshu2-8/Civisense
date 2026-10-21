from collections import defaultdict
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.comment import Comment
from app.models.analysis import Analysis
from app.schemas.dashboard import (
    DashboardResponse,
    SentimentBreakdown,
    ClauseStat,
    StakeholderBreakdown,
    TopicBreakdown,
)
from app.schemas.analysis import CommentResponse


class DashboardService:
    @staticmethod
    async def get_dashboard_data(
        document_id: UUID,
        db: Session,
        auto_analyze: bool = True,
    ) -> DashboardResponse:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
        if not analysis:
            if auto_analyze:
                # Automatically run analysis pipeline if not yet analyzed
                from app.services.analysis_service import AnalysisService
                await AnalysisService.analyze_document(document_id=document_id, db=db)
                analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
            
            if not analysis:
                raise HTTPException(
                    status_code=404,
                    detail="Analysis not found for this document. Please run analysis first.",
                )

        comments = (
            db.query(Comment)
            .filter(Comment.document_id == document_id)
            .order_by(Comment.created_at.asc())
            .all()
        )

        total_comments = len(comments)

        # 1. Sentiment breakdown
        pos_count = sum(1 for c in comments if c.sentiment == "positive")
        neg_count = sum(1 for c in comments if c.sentiment == "negative")
        neu_count = sum(1 for c in comments if c.sentiment == "neutral" or not c.sentiment)

        scores = [c.sentiment_score for c in comments if c.sentiment_score is not None]
        avg_score = round(sum(scores) / len(scores), 2) if scores else 0.75

        sentiment_overview = SentimentBreakdown(
            positive=pos_count,
            negative=neg_count,
            neutral=neu_count,
            total=total_comments,
            positive_pct=round((pos_count / total_comments * 100), 1) if total_comments else 0.0,
            negative_pct=round((neg_count / total_comments * 100), 1) if total_comments else 0.0,
            neutral_pct=round((neu_count / total_comments * 100), 1) if total_comments else 0.0,
            avg_score=avg_score,
        )

        # 2. Clause intelligence
        clause_map = defaultdict(lambda: {"pos": 0, "neg": 0, "neu": 0, "total": 0})
        for c in comments:
            clause_name = c.clause or "General Provisions"
            clause_map[clause_name]["total"] += 1
            if c.sentiment == "positive":
                clause_map[clause_name]["pos"] += 1
            elif c.sentiment == "negative":
                clause_map[clause_name]["neg"] += 1
            else:
                clause_map[clause_name]["neu"] += 1

        clauses: list[ClauseStat] = []
        for clause_name, counts in sorted(clause_map.items(), key=lambda x: x[1]["total"], reverse=True):
            dominant = "neutral"
            if counts["neg"] > counts["pos"] and counts["neg"] >= counts["neu"]:
                dominant = "negative"
            elif counts["pos"] > counts["neg"] and counts["pos"] >= counts["neu"]:
                dominant = "positive"

            clauses.append(ClauseStat(
                clause=clause_name,
                mention_count=counts["total"],
                positive=counts["pos"],
                negative=counts["neg"],
                neutral=counts["neu"],
                dominant_sentiment=dominant,
            ))

        # 3. Stakeholder overview
        st_map = defaultdict(lambda: {"pos": 0, "neg": 0, "neu": 0, "total": 0})
        for c in comments:
            st_type = c.stakeholder_type or "Citizens"
            st_map[st_type]["total"] += 1
            if c.sentiment == "positive":
                st_map[st_type]["pos"] += 1
            elif c.sentiment == "negative":
                st_map[st_type]["neg"] += 1
            else:
                st_map[st_type]["neu"] += 1

        stakeholders: list[StakeholderBreakdown] = []
        st_summaries = analysis.stakeholder_summary or {}
        for st_type, counts in sorted(st_map.items(), key=lambda x: x[1]["total"], reverse=True):
            stakeholders.append(StakeholderBreakdown(
                stakeholder_type=st_type,
                count=counts["total"],
                positive=counts["pos"],
                negative=counts["neg"],
                neutral=counts["neu"],
                summary=st_summaries.get(st_type),
            ))

        # 4. Topic distribution
        topic_counts = defaultdict(int)
        for c in comments:
            t = c.topic or "General Policy"
            topic_counts[t] += 1

        topics: list[TopicBreakdown] = []
        for t, count in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True):
            topics.append(TopicBreakdown(
                topic=t,
                count=count,
                percentage=round((count / total_comments * 100), 1) if total_comments else 0.0,
            ))

        # 5. Comment response objects
        serialized_comments = [
            CommentResponse.model_validate(c) for c in comments
        ]

        return DashboardResponse(
            document_id=document.id,
            filename=document.original_filename,
            uploaded_at=document.uploaded_at,
            total_comments=total_comments,
            overall_summary=analysis.overall_summary,
            sentiment_overview=sentiment_overview,
            clauses=clauses,
            stakeholders=stakeholders,
            topics=topics,
            consensus=analysis.consensus or {},
            comments=serialized_comments,
        )
