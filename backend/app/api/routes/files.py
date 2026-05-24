"""
File upload and retrieval API routes.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Optional
import logging
import os

from app.models.schemas import FileUploadResponse, FileListResponse, APIResponse
from app.db.supabase import db
from app.services.pdf_service import pdf_service
from app.core.config import settings
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/files")


@router.post("/upload", response_model=APIResponse)
async def upload_file(
    session_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Upload a file to a session."""
    try:
        # Verify session belongs to user
        session = await db.get_intake_session(session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")

        # Check file size
        file_content = await file.read()
        file_size = len(file_content)

        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB",
            )

        # Check file type
        file_ext = os.path.splitext(file.filename)[1].lstrip(".").lower()
        if file_ext not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}",
            )

        # Upload to Supabase Storage
        try:
            file_path = f"{session_id}/{file.filename}"
            response = db.client.storage.from_(settings.UPLOAD_BUCKET).upload(
                file_path, file_content
            )
            file_url = db.client.storage.from_(settings.UPLOAD_BUCKET).get_public_url(
                file_path
            )
        except Exception as e:
            logger.error(f"Error uploading to storage: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload file")

        # Extract text if PDF
        extracted_text = ""
        document_type = "other"

        if file_ext == "pdf":
            try:
                extracted_text = pdf_service.extract_text(file_content, max_pages=10)
                document_type = pdf_service.detect_document_type(
                    extracted_text, file.filename
                )
            except Exception as e:
                logger.warning(f"Error extracting PDF text: {e}")

        # Create file record in database
        file_record = await db.create_file_record(
            {
                "session_id": session_id,
                "file_name": file.filename,
                "file_type": file_ext,
                "file_size": file_size,
                "file_url": file_url,
                "extracted_text": extracted_text if extracted_text else None,
                "document_type": document_type,
            }
        )

        if not file_record:
            raise HTTPException(status_code=500, detail="Failed to create file record")

        # Create message for file upload
        await db.create_message(
            {
                "session_id": session_id,
                "role": "system",
                "content": f"Document uploaded: {file.filename}",
                "message_type": "document_reference",
                "metadata": {
                    "file_id": file_record["id"],
                    "file_name": file.filename,
                    "document_type": document_type,
                },
            }
        )

        return APIResponse(
            success=True,
            data=FileUploadResponse(**file_record),
            message="File uploaded successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")


@router.get("/{session_id}", response_model=APIResponse)
async def get_files(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Get files for a session."""
    try:
        # Verify session belongs to user
        session = await db.get_intake_session(session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Get files
        files = await db.get_files(session_id)

        return APIResponse(
            success=True,
            data={
                "files": [FileUploadResponse(**f) for f in files],
                "total": len(files),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting files: {e}")
        raise HTTPException(status_code=500, detail="Failed to get files")


@router.get("/file/{file_id}", response_model=APIResponse)
async def get_file(
    file_id: str, user_id: str = Depends(get_current_user)
):
    """Get a specific file."""
    try:
        # Get file
        file = await db.get_file(file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")

        # Verify session belongs to user
        session = await db.get_intake_session(file["session_id"], user_id)
        if not session:
            raise HTTPException(status_code=403, detail="Access denied")

        return APIResponse(
            success=True,
            data=FileUploadResponse(**file),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting file: {e}")
        raise HTTPException(status_code=500, detail="Failed to get file")
