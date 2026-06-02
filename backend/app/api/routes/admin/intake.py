"""
Admin intake management API routes.
Enhanced with comprehensive management features following best practices.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
import logging
from datetime import datetime

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.middleware.auth import require_admin
from app.db.admin_operations import AdminOperations

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/intake")


@router.get("", response_model=APIResponse)
async def list_all_intakes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status: in_progress, completed, archived"),
    urgency: Optional[str] = Query(None, description="Filter by urgency: low, medium, high"),
    category: Optional[str] = Query(None, description="Filter by legal category"),
    search: Optional[str] = Query(None, description="Search by client name or email"),
    user_id: str = Depends(require_admin())
):
    """List all intake sessions with advanced filtering (admin only)."""
    try:
        # Get all intake sessions
        sessions, total = await db.list_all_intake_sessions(skip, limit)

        # Transform sessions to include client_name field
        transformed_sessions = []
        for session in sessions:
            is_anonymous = session.get("is_anonymous", False)
            
            # Get client name from different sources
            if is_anonymous:
                anonymous_info = session.get("anonymous_client_info", {})
                if isinstance(anonymous_info, dict):
                    client_name = anonymous_info.get("name", "Anonymous Client")
                    client_email = anonymous_info.get("email", "")
                else:
                    client_name = "Anonymous Client"
                    client_email = ""
            else:
                clients = session.get("clients")
                if isinstance(clients, dict):
                    client_name = clients.get("full_name", "Unknown")
                    client_email = clients.get("email", "")
                else:
                    client_name = "Unknown"
                    client_email = ""
            
            transformed = {
                "id": session.get("id"),
                "client_name": client_name,
                "client_email": client_email,
                "status": session.get("status"),
                "legal_category": session.get("legal_category", "General"),
                "urgency": session.get("urgency", "low"),
                "created_at": session.get("created_at"),
                "updated_at": session.get("updated_at"),
                "is_anonymous": is_anonymous,
                "current_step": session.get("current_step", 0),
            }
            transformed_sessions.append(transformed)

        # Apply client-side filtering
        if search:
            search_lower = search.lower()
            transformed_sessions = [
                s for s in transformed_sessions
                if search_lower in s.get("client_name", "").lower()
                or search_lower in s.get("client_email", "").lower()
            ]
        
        if status:
            transformed_sessions = [s for s in transformed_sessions if s.get("status") == status]
        
        if urgency:
            transformed_sessions = [s for s in transformed_sessions if s.get("urgency") == urgency]
        
        if category:
            transformed_sessions = [s for s in transformed_sessions if s.get("legal_category") == category]

        return APIResponse(
            success=True,
            data={
                "sessions": transformed_sessions,
                "total": total,
                "skip": skip,
                "limit": limit,
                "filtered_count": len(transformed_sessions),
            },
        )

    except Exception as e:
        logger.error(f"Error listing intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to list intakes")


@router.get("/{session_id}", response_model=APIResponse)
async def get_intake_details(
    session_id: str, user_id: str = Depends(require_admin())
):
    """Get detailed intake session information with notes and assignments (admin only)."""
    try:
        session = await db.get_intake_session_admin(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Get admin notes
        notes = await AdminOperations.get_notes(session_id)
        
        # Get assignment info
        assignment_response = (
            db.client.table("team_assignments")
            .select("*")
            .eq("session_id", session_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        assignment = assignment_response.data[0] if assignment_response.data else None

        return APIResponse(
            success=True,
            data={
                "session": session,
                "notes": notes,
                "assignment": assignment,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intake details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get intake details")


@router.get("/{session_id}/responses", response_model=APIResponse)
async def get_intake_responses(
    session_id: str, user_id: str = Depends(require_admin())
):
    """Get all responses for an intake session (admin only)."""
    try:
        responses = await db.get_intake_responses(session_id)
        
        if not responses:
            responses = []

        return APIResponse(
            success=True,
            data={
                "responses": responses,
                "total": len(responses),
            },
        )

    except Exception as e:
        logger.error(f"Error getting intake responses: {e}")
        raise HTTPException(status_code=500, detail="Failed to get intake responses")


@router.patch("/{session_id}/status", response_model=APIResponse)
async def update_intake_status(
    session_id: str,
    status: str,
    user_id: str = Depends(require_admin())
):
    """Update intake session status (admin only)."""
    try:
        valid_statuses = ["in_progress", "completed", "archived"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

        update_data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        if status == "completed":
            update_data["completed_at"] = datetime.utcnow().isoformat()

        response = (
            db.client.table("intake_sessions")
            .update(update_data)
            .eq("id", session_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Session not found")

        # Log audit trail
        await AdminOperations.create_audit_log(
            user_id=user_id,
            action="UPDATE_STATUS",
            resource_type="intake_session",
            resource_id=session_id,
            changes={"status": status}
        )

        return APIResponse(
            success=True,
            data=response.data[0],
            message=f"Status updated to {status}"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating intake status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")


@router.patch("/{session_id}/notes", response_model=APIResponse)
async def add_intake_note(
    session_id: str,
    note_text: str,
    note_type: Optional[str] = "general",
    user_id: str = Depends(require_admin())
):
    """Add a note to an intake session (admin only)."""
    try:
        if not note_text or not note_text.strip():
            raise HTTPException(status_code=400, detail="Note text cannot be empty")

        note = await AdminOperations.create_note(
            session_id=session_id,
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


@router.patch("/{session_id}/assign", response_model=APIResponse)
async def assign_intake(
    session_id: str,
    assigned_to_user_id: str,
    user_id: str = Depends(require_admin())
):
    """Assign intake session to a team member (admin only)."""
    try:
        assignment = await AdminOperations.assign_session(
            session_id=session_id,
            assigned_to_user_id=assigned_to_user_id,
            assigned_by_user_id=user_id
        )

        if not assignment:
            raise HTTPException(status_code=500, detail="Failed to assign session")

        # Log audit trail
        await AdminOperations.create_audit_log(
            user_id=user_id,
            action="ASSIGN_SESSION",
            resource_type="intake_session",
            resource_id=session_id,
            changes={"assigned_to": assigned_to_user_id}
        )

        return APIResponse(
            success=True,
            data=assignment,
            message="Session assigned successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning session: {e}")
        raise HTTPException(status_code=500, detail="Failed to assign session")


@router.get("/{session_id}/notes", response_model=APIResponse)
async def get_intake_notes(
    session_id: str, user_id: str = Depends(require_admin())
):
    """Get all notes for an intake session (admin only)."""
    try:
        notes = await AdminOperations.get_notes(session_id)
        
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
