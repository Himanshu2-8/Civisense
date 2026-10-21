from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    filename: str


class DocumentUploadResponse(BaseModel):
    document_id: UUID
    filename: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentResponse(BaseModel):
    document_id: UUID
    filename: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentDeleteResponse(BaseModel):
    document_id: UUID
    filename: str
