"""
backend/routes/report.py
POST /api/report — handles file uploads and OCR
"""

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from services.ocr import extract_text_from_bytes

router = APIRouter()

class ReportResponse(BaseModel):
    text: str
    filename: str

@router.post("/report", response_model=ReportResponse)
async def upload_report(file: UploadFile = File(...)):
    contents = await file.read()
    text = extract_text_from_bytes(contents, file.content_type)
    return ReportResponse(text=text, filename=file.filename)
