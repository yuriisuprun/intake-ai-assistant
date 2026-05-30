"""
Admin notes management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notes")


class NoteCreate(BaseModel):
    """Note creation request."""
    session_id: str
    content: str
    note_type: str = "general"


class NoteUpdate(BaseModel):
    """Note update request."""
    content: str


@router.post("", response_model=APIResponse)
async def create_note(
    request: NoteCreate, user_id: str = Depends(get_current_user)
):
    """Create a note for a session (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Create note
        note = await db.create_note(
            {
                "session_id": request.session_id,
                "content": request.content,
                "note_type": request.note_type,
                "created_by": user_id,
            }
        )

        if not note:
            raise HTTPException(status_code=500, detail="Failed to create note")

        return APIResponse(
            success=True,
            data=note,
            message="Note created successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating note: {e}")
        raise HTTPException(status_code=500, detail="Failed to create note")


@router.get("/{session_id}", response_model=APIResponse)
async def get_notes(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Get all notes for a session (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get notes
        notes = await db.get_notes(session_id)
        
        if not notes:
            notes = []

        return APIResponse(
            success=True,
            data={
                "notes": notes,
                "total": len(notes),
            },
        )

    except Exception as e:
        logger.error(f"Error getting notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notes")


@router.put("/{note_id}", response_model=APIResponse)
async def update_note(
    note_id: str, request: NoteUpdate, user_id: str = Depends(get_current_user)
):
    """Update a note (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Update note
        note = await db.update_note(note_id, {"content": request.content})

        if not note:
            raise HTTPException(status_code=500, detail="Failed to update note")

        return APIResponse(
            success=True,
            data=note,
            message="Note updated successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating note: {e}")
        raise HTTPException(status_code=500, detail="Failed to update note")


@router.delete("/{note_id}", response_model=APIResponse)
async def delete_note(
    note_id: str, user_id: str = Depends(get_current_user)
):
    """Delete a note (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Delete note
        success = await db.delete_note(note_id)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete note")

        return APIResponse(
            success=True,
            message="Note deleted successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting note: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete note")
