from datetime import datetime
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document


class PDFService:
    @staticmethod
    async def upload_pdf(file: UploadFile, db: Session) -> Document:
        if file.content_type != "application/pdf" and not (file.filename and file.filename.lower().endswith(".pdf")):
            raise HTTPException(status_code=400, detail="Only PDF format is allowed")

        unique_name = f"{uuid4()}.pdf"
        filepath = settings.UPLOAD_DIR / unique_name

        try:
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail="Uploaded file is empty")

            with open(filepath, "wb") as f:
                f.write(content)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

        document = Document(
            filename=unique_name,
            original_filename=file.filename or "consultation.pdf",
            file_path=str(filepath),
            uploaded_at=datetime.utcnow(),
        )

        try:
            db.add(document)
            db.commit()
            db.refresh(document)
            return document
        except Exception as e:
            db.rollback()
            if filepath.exists():
                filepath.unlink()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    @staticmethod
    def get_all_documents(db: Session) -> list[dict]:
        documents = db.query(Document).order_by(Document.uploaded_at.desc()).all()
        return [
            {
                "document_id": document.id,
                "filename": document.original_filename,
                "stored_filename": document.filename,
                "uploaded_at": document.uploaded_at,
            }
            for document in documents
        ]

    @staticmethod
    async def get_document(document_id: UUID, db: Session) -> dict:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return {
            "document_id": document.id,
            "filename": document.original_filename,
            "stored_filename": document.filename,
            "uploaded_at": document.uploaded_at,
        }

    @staticmethod
    async def delete_document(document_id: UUID, db: Session) -> dict:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        file_path = Path(document.file_path)
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception:
                pass

        original_name = document.original_filename
        stmt = delete(Document).where(Document.id == document_id)
        db.execute(stmt)
        db.commit()
        return {"document_id": document_id, "filename": original_name}
