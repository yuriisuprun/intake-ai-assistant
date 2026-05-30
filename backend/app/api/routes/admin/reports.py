"""
Admin reports API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import logging

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reports")


@router.get("/overview", response_model=APIResponse)
async def get_overview_report(user_id: str = Depends(get_current_user)):
    """Get overview report (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get overview statistics
        report = await db.get_overview_report()
        
        if not report:
            report = {
                "total_clients": 0,
                "total_sessions": 0,
                "completed_sessions": 0,
                "pending_sessions": 0,
                "total_documents": 0,
            }

        return APIResponse(
            success=True,
            data=report,
        )

    except Exception as e:
        logger.error(f"Error getting overview report: {e}")
        raise HTTPException(status_code=500, detail="Failed to get overview report")


@router.get("/activity", response_model=APIResponse)
async def get_activity_report(
    days: int = 7, user_id: str = Depends(get_current_user)
):
    """Get activity report for the last N days (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get activity report
        report = await db.get_activity_report(days)
        
        if not report:
            report = {
                "period_days": days,
                "sessions_created": 0,
                "sessions_completed": 0,
                "documents_uploaded": 0,
                "summaries_generated": 0,
            }

        return APIResponse(
            success=True,
            data=report,
        )

    except Exception as e:
        logger.error(f"Error getting activity report: {e}")
        raise HTTPException(status_code=500, detail="Failed to get activity report")


@router.get("/clients", response_model=APIResponse)
async def get_clients_report(
    skip: int = 0, limit: int = 20, user_id: str = Depends(get_current_user)
):
    """Get clients report (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get clients report
        report, total = await db.get_clients_report(skip, limit)
        
        if not report:
            report = []

        return APIResponse(
            success=True,
            data={
                "clients": report,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error getting clients report: {e}")
        raise HTTPException(status_code=500, detail="Failed to get clients report")


@router.get("/sessions", response_model=APIResponse)
async def get_sessions_report(
    skip: int = 0, limit: int = 20, user_id: str = Depends(get_current_user)
):
    """Get sessions report (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get sessions report
        report, total = await db.get_sessions_report(skip, limit)
        
        if not report:
            report = []

        return APIResponse(
            success=True,
            data={
                "sessions": report,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error getting sessions report: {e}")
        raise HTTPException(status_code=500, detail="Failed to get sessions report")
