"""
backend/services/ocr.py
Extract text from uploaded files.
Works with raw bytes (for FastAPI).
"""

import io


def extract_text_from_bytes(file_bytes: bytes, content_type: str) -> str:
    if content_type == "application/pdf":
        return _pdf(file_bytes)
    elif content_type in ["image/jpeg", "image/jpg", "image/png"]:
        return _image(file_bytes)
    return ""


def _pdf(file_bytes: bytes) -> str:
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "\n".join(page.get_text() for page in doc).strip()
    except Exception as e:
        print(f"PDF OCR error: {e}")
        return ""


def _image(file_bytes: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
        image = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(image).strip()
    except Exception as e:
        print(f"Image OCR error: {e}")
        return ""
