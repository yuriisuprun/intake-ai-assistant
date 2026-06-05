"""
Admin dashboard statistics and reporting API routes.
Provides overview metrics, analytics, and reporting capabilities.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging
from datetime import datetime, timedelta

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.db.admin_operations import AdminOperations

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard")


@router.get("/overview", response_model=APIResponse)
async def get_dashboard_overview():
    """Get dashboard overview with key statistics."""
    try:
        logger.info("Dashboard overview requested")
        report = await AdminOperations.get_overview_report()
        
        return APIResponse(
            success=True,
            data=report,
        )

    except Exception as e:
        logger.error(f"Error getting overview: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get overview: {str(e)}")


@router.get("/activity", response_model=APIResponse)
async def get_activity_report(
    days: int = Query(7, ge=1, le=90, description="Number of days to report on")
):
    """Get activity report for specified days."""
    try:
        logger.info(f"Activity report requested for {days} days")
        report = await AdminOperations.get_activity_report(days)
        
        return APIResponse(
            success=True,
            data=report,
        )

    except Exception as e:
        logger.error(f"Error getting activity report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get activity report: {str(e)}")


@router.get("/status-distribution", response_model=APIResponse)
async def get_status_distribution():
    """Get distribution of intake statuses."""
    try:
        logger.info("Status distribution requested")
        # Get all sessions with status - consolidated view
        response = (
            db.client.table("intakes")
            .select("status")
            .execute()
        )
        
        # Count by status
        status_counts = {}
        for session in response.data or []:
            status = session.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return APIResponse(
            success=True,
            data={
                "status_distribution": status_counts,
                "total": sum(status_counts.values()),
            },
        )

    except Exception as e:
        logger.error(f"Error getting status distribution: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get status distribution: {str(e)}")


@router.get("/category-distribution", response_model=APIResponse)
async def get_category_distribution():
    """Get distribution of legal categories (deprecated endpoint)."""
    try:
        logger.info("Category distribution requested - endpoint deprecated")
        return APIResponse(
            success=False,
            error="This endpoint is deprecated as legal_category has been removed from the system",
        )

    except Exception as e:
        logger.error(f"Error in deprecated category endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Deprecated endpoint: {str(e)}")


@router.get("/team-assignments", response_model=APIResponse)
async def get_team_assignments():
    """Get current team member assignments."""
    try:
        logger.info("Team assignments requested")
        # Get all active team members
        team_response = (
            db.client.table("team_members")
            .select("id, user_id, role, status")
            .eq("status", "active")
            .execute()
        )
        
        team_members = team_response.data or []
        
        # Count assignments per member
        assignments_data = []
        for member in team_members:
            assign_response = (
                db.client.table("team_assignments")
                .select("id", count="exact")
                .eq("assigned_to_user_id", member["user_id"])
                .eq("assignment_status", "assigned")
                .execute()
            )
            
            assignments_data.append({
                "user_id": member["user_id"],
                "role": member["role"],
                "assignment_count": assign_response.count or 0,
            })
        
        return APIResponse(
            success=True,
            data={
                "team_assignments": assignments_data,
                "total_members": len(team_members),
            },
        )

    except Exception as e:
        logger.error(f"Error getting team assignments: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get team assignments: {str(e)}")


@router.get("/audit-logs", response_model=APIResponse)
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    resource_type: Optional[str] = None
):
    """Get audit logs with optional filtering."""
    try:
        logger.info(f"Audit logs requested with skip={skip}, limit={limit}")
        logs = await AdminOperations.get_audit_logs(
            resource_type=resource_type,
            limit=limit,
            offset=skip
        )
        
        return APIResponse(
            success=True,
            data={
                "logs": logs,
                "total": len(logs),
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error getting audit logs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get audit logs: {str(e)}")


@router.get("/pending-review", response_model=APIResponse)
async def get_pending_review(
    limit: int = Query(10, ge=1, le=100)
):
    """Get intakes pending review."""
    try:
        logger.info(f"Pending review requested with limit {limit}")
        # Get sessions with submitted status (consolidated view)
        response = (
            db.client.table("intakes")
            .select("*")
            .eq("status", "new")
            .order("created_at")
            .limit(limit)
            .execute()
        )
        
        pending = response.data or []
        
        return APIResponse(
            success=True,
            data={
                "pending_intakes": pending,
                "total": len(pending),
            },
        )

    except Exception as e:
        logger.error(f"Error getting pending intakes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get pending intakes: {str(e)}")
