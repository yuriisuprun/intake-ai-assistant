"""
Admin intake management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/intake")


@router.get("", response_model=APIResponse)
async def list_all_intakes(
    skip: int = 0, limit: int = 20, user_id: str = Depends(get_current_user)
):
    """List all intake sessions (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get all intake sessions
        sessions, total = await db.list_all_intake_sessions(skip, limit)

        return APIResponse(
            success=True,
            data={
                "sessions": sessions,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error listing intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to list intakes")


@router.get("/{session_id}", response_model=APIResponse)
async def get_intake_details(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Get detailed intake session information (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get session details
        session = await db.get_intake_session_admin(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return APIResponse(
            success=True,
            data=session,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intake details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get intake details")


@router.get("/{session_id}/responses", response_model=APIResponse)
async def get_intake_responses(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Get all responses for an intake session (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get session responses
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
