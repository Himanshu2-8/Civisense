from fastapi import APIRouter, UploadFile, File, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.services.pdf_service import PDFService
from app.db.session import get_db
from app.schemas.document import DocumentUploadResponse, DocumentResponse, DocumentDeleteResponse

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    document = await PDFService.upload_pdf(file=file, db=db)
    return {
        "document_id": document.id,
        "filename": document.original_filename,
        "uploaded_at": document.uploaded_at,
    }


@router.get("/", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    return PDFService.get_all_documents(db=db)


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: UUID, db: Session = Depends(get_db)):
    return await PDFService.get_document(document_id=document_id, db=db)


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
async def delete_document(document_id: UUID, db: Session = Depends(get_db)):
    return await PDFService.delete_document(document_id=document_id, db=db)
