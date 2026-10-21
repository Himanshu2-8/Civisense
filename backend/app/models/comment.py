from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    document_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "documents.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    stakeholder_type: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Unknown",
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    topic: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    raw_issue: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    canonical_issue: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    clause: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    sentiment: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        default="neutral",
    )

    sentiment_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    recommendation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now(),
        nullable=False,
    )

    document = relationship(
        "Document",
        back_populates="comments",
    )