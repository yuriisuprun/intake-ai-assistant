"""
Client dashboard API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard")


@router.get("", response_model=APIResponse)
async def get_dashboard(user_id: str = Depends(get_current_user)):
    """Get client dashboard data."""
    try:
        # Get recent sessions
        sessions, _ = await db.list_intake_sessions(user_id, skip=0, limit=5)
        
        # Get client statistics
        stats = await db.get_client_stats(user_id)
        
        if not stats:
            stats = {
                "total_sessions": 0,
                "completed_sessions": 0,
                "pending_sessions": 0,
                "total_documents": 0,
            }

        dashboard_data = {
            "recent_sessions": sessions,
            "stats": stats,
        }

        return APIResponse(
            success=True,
            data=dashboard_data,
        )

    except Exception as e:
        logger.error(f"Error getting dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard")


@router.get("/activity", response_model=APIResponse)
async def get_activity(
    skip: int = 0, limit: int = 20, user_id: str = Depends(get_current_user)
):
    """Get client activity log."""
    try:
        # Get activity log
        activity = await db.get_activity_log(user_id, skip, limit)
        
        if not activity:
            activity = []

        return APIResponse(
            success=True,
            data={
                "activity": activity,
                "total": len(activity),
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error getting activity: {e}")
        raise HTTPException(status_code=500, detail="Failed to get activity")
