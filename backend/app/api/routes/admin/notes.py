"""
Admin notes management API routes.
Simplified to work with the notes column in the intakes table.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import UUID
import logging

from app.models.schemas import APIResponse
from app.db.admin_operations import AdminOperations
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notes")


class NoteCreate(BaseModel):
    """Note creation request."""
    session_id: str
    content: str


class NotesUpdate(BaseModel):
    """Notes update request - replaces all notes."""
    session_id: str
    content: str


@router.post("", response_model=APIResponse)
async def add_note(
    request: NoteCreate, user_id: str = Depends(get_current_user)
):
    """Add a note to a session (appends to existing notes)."""
    try:
        # Add note
        result = await AdminOperations.add_note(
            session_id=UUID(request.session_id),
            note_text=request.content,
        )

        if not result:
            raise HTTPException(status_code=500, detail="Failed to add note")

        return APIResponse(
            success=True,
            data=result,
            message="Note added successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding note: {e}")
        raise HTTPException(status_code=500, detail="Failed to add note")


@router.get("/{session_id}", response_model=APIResponse)
async def get_notes(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Get notes for a session."""
    try:
        notes = await AdminOperations.get_notes(UUID(session_id))

        return APIResponse(
            success=True,
            data={
                "session_id": session_id,
                "notes": notes or "",
            },
        )

    except Exception as e:
        logger.error(f"Error getting notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notes")


@router.put("/{session_id}", response_model=APIResponse)
async def update_notes(
    session_id: str, request: NotesUpdate, user_id: str = Depends(get_current_user)
):
    """Update (replace) all notes for a session."""
    try:
        result = await AdminOperations.update_notes(
            session_id=UUID(session_id),
            note_text=request.content,
        )

        if not result:
            raise HTTPException(status_code=500, detail="Failed to update notes")

        return APIResponse(
            success=True,
            data=result,
            message="Notes updated successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to update notes")


@router.delete("/{session_id}", response_model=APIResponse)
async def clear_notes(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Clear all notes for a session."""
    try:
        success = await AdminOperations.clear_notes(UUID(session_id))

        if not success:
            raise HTTPException(status_code=500, detail="Failed to clear notes")

        return APIResponse(
            success=True,
            message="Notes cleared successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear notes")
