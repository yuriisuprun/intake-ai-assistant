"""
Admin intake management API routes.
Consolidated admin routes for managing all intakes (both registered and unregistered).
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import Optional, List
import logging
from datetime import datetime

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.middleware.auth import require_admin
from app.db.admin_operations import AdminOperations

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/intakes")


@router.get("", response_model=APIResponse)
async def list_all_intakes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status: submitted, reviewed, assigned, archived"),
    search: Optional[str] = Query(None, description="Search by client name or email"),
    user_id: str = Depends(require_admin())
):
    """List all intake submissions with filtering (admin only)."""
    try:
        intakes, total = await db.list_all_intakes(skip, limit)

        # Apply filters
        if search:
            search_lower = search.lower()
            intakes = [
                i for i in intakes
                if search_lower in i.get("client_name", "").lower()
                or search_lower in i.get("client_email", "").lower()
            ]
        
        if status:
            intakes = [i for i in intakes if i.get("status") == status]

        return APIResponse(
            success=True,
            data={
                "intakes": intakes,
                "total": total,
                "skip": skip,
                "limit": limit,
                "filtered_count": len(intakes),
            },
        )

    except Exception as e:
        logger.error(f"Error listing intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to list intakes")


@router.get("/{intake_id}", response_model=APIResponse)
async def get_intake_details(
    intake_id: str, user_id: str = Depends(require_admin())
):
    """Get detailed intake information with full history (admin only)."""
    try:
        intake = await db.get_intake(intake_id)
        
        if not intake:
            raise HTTPException(status_code=404, detail="Intake not found")

        # Get associated session
        session_response = (
            db.client.table("intakes")
            .select("*")
            .eq("id", intake["session_id"])
            .single()
            .execute()
        )
        session = session_response.data if session_response.data else None
        
        # Get messages/responses
        messages = await db.get_messages(intake["session_id"])
        
        # Get notes
        notes = await AdminOperations.get_notes(intake["session_id"])

        return APIResponse(
            success=True,
            data={
                "intake": intake,
                "session": session,
                "responses": messages,
                "notes": notes,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intake details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get intake details")


@router.patch("/{intake_id}", response_model=APIResponse)
async def update_intake(
    intake_id: str,
    status: Optional[str] = None,
    admin_notes: Optional[str] = None,
    assigned_to: Optional[str] = None,
    user_id: str = Depends(require_admin())
):
    """Update intake status, notes, and assignment (admin only)."""
    try:
        update_data = {}
        
        if status:
            valid_statuses = ["submitted", "reviewed", "assigned", "archived"]
            if status not in valid_statuses:
                raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
            update_data["status"] = status
            if status == "reviewed":
                update_data["reviewed_at"] = datetime.utcnow().isoformat()
        
        if admin_notes is not None:
            update_data["admin_notes"] = admin_notes
        
        if assigned_to:
            update_data["assigned_to"] = assigned_to

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        intake = await db.update_intake(intake_id, update_data)

        if not intake:
            raise HTTPException(status_code=404, detail="Intake not found")

        # Log audit trail
        await AdminOperations.create_audit_log(
            user_id=user_id,
            action="UPDATE_INTAKE",
            resource_type="intake",
            resource_id=intake_id,
            changes=update_data
        )

        return APIResponse(
            success=True,
            data=intake,
            message="Intake updated successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating intake: {e}")
        raise HTTPException(status_code=500, detail="Failed to update intake")


@router.get("/search/by-email", response_model=APIResponse)
async def search_intakes_by_email(
    email: str, user_id: str = Depends(require_admin())
):
    """Search intakes by email (admin only)."""
    try:
        if not email or len(email.strip()) < 3:
            raise HTTPException(status_code=400, detail="Email must be at least 3 characters")

        response = (
            db.client.table("intakes")
            .select("*")
            .ilike("client_email", f"%{email}%")
            .order("created_at", desc=True)
            .execute()
        )

        intakes = response.data or []

        return APIResponse(
            success=True,
            data={
                "intakes": intakes,
                "total": len(intakes),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to search intakes")


@router.post("/{intake_id}/notes", response_model=APIResponse)
async def add_intake_note(
    intake_id: str,
    note_text: str,
    note_type: Optional[str] = "general",
    user_id: str = Depends(require_admin())
):
    """Add a note to an intake (admin only)."""
    try:
        # Verify intake exists
        intake = await db.get_intake(intake_id)
        if not intake:
            raise HTTPException(status_code=404, detail="Intake not found")

        if not note_text or not note_text.strip():
            raise HTTPException(status_code=400, detail="Note text cannot be empty")

        note = await AdminOperations.create_note(
            session_id=intake["session_id"],
            admin_id=user_id,
            note_text=note_text,
            note_type=note_type
        )

        if not note:
            raise HTTPException(status_code=500, detail="Failed to create note")

        return APIResponse(
            success=True,
            data=note,
            message="Note added successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding note: {e}")
        raise HTTPException(status_code=500, detail="Failed to add note")


@router.get("/{intake_id}/notes", response_model=APIResponse)
async def get_intake_notes(
    intake_id: str, user_id: str = Depends(require_admin())
):
    """Get all notes for an intake (admin only)."""
    try:
        # Verify intake exists
        intake = await db.get_intake(intake_id)
        if not intake:
            raise HTTPException(status_code=404, detail="Intake not found")

        notes = await AdminOperations.get_notes(intake["session_id"])
        
        return APIResponse(
            success=True,
            data={
                "notes": notes,
                "total": len(notes),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notes")
