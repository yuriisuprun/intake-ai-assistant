"""
Client profile management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from app.models.schemas import ClientResponse, APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile")


@router.get("", response_model=APIResponse)
async def get_profile(user_id: str = Depends(get_current_user)):
    """Get client profile information."""
    try:
        # Get user profile from database
        profile = await db.get_user_profile(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return APIResponse(
            success=True,
            data=profile,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")


@router.get("/stats", response_model=APIResponse)
async def get_profile_stats(user_id: str = Depends(get_current_user)):
    """Get client profile statistics."""
    try:
        # Get client statistics
        stats = await db.get_client_stats(user_id)
        
        if not stats:
            stats = {
                "total_sessions": 0,
                "completed_sessions": 0,
                "pending_sessions": 0,
                "total_documents": 0,
            }

        return APIResponse(
            success=True,
            data=stats,
        )

    except Exception as e:
        logger.error(f"Error getting profile stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile stats")
