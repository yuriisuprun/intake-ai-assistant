"""
AI Summary generation API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from app.models.schemas import AISummaryRequest, AISummaryResponse, APIResponse
from app.services.summary_service import summary_service
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/summary")


@router.post("/generate", response_model=APIResponse)
async def generate_summary(
    request: AISummaryRequest, user_id: str = Depends(get_current_user)
):
    """Generate AI summary for an intake session."""
    try:
        # Verify session belongs to user
        session = await db.get_intake_session(request.session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Generate summary
        summary_data = await summary_service.generate_summary(
            request.session_id, user_id
        )

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
    """Get AI summary for a session."""
    try:
        # Verify session belongs to user
        session = await db.get_intake_session(session_id, user_id)
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
