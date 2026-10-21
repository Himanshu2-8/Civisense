from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.comment import Comment


class CommentService:
    @staticmethod
    def create_comment(data: dict, document_id: UUID, db: Session) -> Comment:
        comment = Comment(
            document_id=document_id,
            stakeholder_type=data.get("stakeholder_type") or "Unknown",
            content=data.get("content") or "",
            topic=data.get("topic"),
            raw_issue=data.get("raw_issue"),
            canonical_issue=data.get("canonical_issue"),
            clause=data.get("clause"),
            sentiment=data.get("sentiment") or "neutral",
            sentiment_score=data.get("sentiment_score"),
            recommendation=data.get("recommendation"),
        )

        db.add(comment)
        db.flush()
        return comment

    @staticmethod
    def create_comments(items: List[dict], document_id: UUID, db: Session) -> List[Comment]:
        created = []
        for it in items:
            created.append(CommentService.create_comment(it, document_id, db))

        try:
            db.commit()
        except Exception:
            db.rollback()
            raise

        for c in created:
            db.refresh(c)

        return created

    @staticmethod
    def get_comments(document_id: UUID, db: Session) -> List[Comment]:
        return (
            db.query(Comment)
            .filter(Comment.document_id == document_id)
            .order_by(Comment.created_at.asc())
            .all()
        )
