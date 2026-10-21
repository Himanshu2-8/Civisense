from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Text, func, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

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
        unique=True,
    )

    overall_summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    stakeholder_summary: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    consensus: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now(),
        nullable=False,
    )

    document = relationship(
        "Document",
        back_populates="analysis",
    )