"""
Admin summary generation and management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from app.models.schemas import APIResponse
from app.services.summary_service import summary_service
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/summary")


@router.post("/{session_id}/generate", response_model=APIResponse)
async def generate_summary(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Generate AI summary for an intake session (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Generate summary
        summary_data = await summary_service.generate_summary(session_id, user_id)

        if not summary_data:
            raise HTTPException(status_code=500, detail="Failed to generate summary")

        return APIResponse(
            success=True,
            data=summary_data,
            message="Summary generated successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")


@router.get("/{session_id}", response_model=APIResponse)
async def get_summary(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Get AI summary for a session (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get session
        session = await db.get_intake_session_admin(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Get summary
        ai_summary = session.get("ai_summary")
        if not ai_summary:
            raise HTTPException(status_code=404, detail="Summary not found")

        return APIResponse(
            success=True,
            data=ai_summary,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get summary")


@router.get("", response_model=APIResponse)
async def list_summaries(
    skip: int = 0, limit: int = 20, user_id: str = Depends(get_current_user)
):
    """List all generated summaries (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get all summaries
        summaries, total = await db.list_all_summaries(skip, limit)
        
        if not summaries:
            summaries = []

        return APIResponse(
            success=True,
            data={
                "summaries": summaries,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error listing summaries: {e}")
        raise HTTPException(status_code=500, detail="Failed to list summaries")
