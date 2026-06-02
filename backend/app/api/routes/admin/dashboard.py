"""
Admin dashboard statistics and reporting API routes.
Provides overview metrics, analytics, and reporting capabilities.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
import logging
from datetime import datetime, timedelta

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.middleware.auth import require_admin
from app.db.admin_operations import AdminOperations

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard")


@router.get("/overview", response_model=APIResponse)
async def get_dashboard_overview(
    user_id: str = Depends(require_admin())
):
    """Get dashboard overview with key statistics (admin only)."""
    try:
        report = await AdminOperations.get_overview_report()
        
        return APIResponse(
            success=True,
            data=report,
        )

    except Exception as e:
        logger.error(f"Error getting overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to get overview")


@router.get("/activity", response_model=APIResponse)
async def get_activity_report(
    days: int = Query(7, ge=1, le=90, description="Number of days to report on"),
    user_id: str = Depends(require_admin())
):
    """Get activity report for specified days (admin only)."""
    try:
        report = await AdminOperations.get_activity_report(days)
        
        return APIResponse(
            success=True,
            data=report,
        )

    except Exception as e:
        logger.error(f"Error getting activity report: {e}")
        raise HTTPException(status_code=500, detail="Failed to get activity report")


@router.get("/status-distribution", response_model=APIResponse)
async def get_status_distribution(
    user_id: str = Depends(require_admin())
):
    """Get distribution of intake statuses (admin only)."""
    try:
        # Get all sessions with status
        response = (
            db.client.table("intake_sessions")
            .select("status", count="exact")
            .execute()
        )
        
        # Get anonymous intakes
        anonymous_response = (
            db.client.table("anonymous_intakes")
            .select("status", count="exact")
            .execute()
        )
        
        # Count by status
        status_counts = {}
        for session in response.data or []:
            status = session.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        for intake in anonymous_response.data or []:
            status = intake.get("status", "unknown")
            status_counts[f"anon_{status}"] = status_counts.get(f"anon_{status}", 0) + 1
        
        return APIResponse(
            success=True,
            data={
                "status_distribution": status_counts,
                "total": sum(status_counts.values()),
            },
        )

    except Exception as e:
        logger.error(f"Error getting status distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to get status distribution")


@router.get("/urgency-distribution", response_model=APIResponse)
async def get_urgency_distribution(
    user_id: str = Depends(require_admin())
):
    """Get distribution of intake urgency levels (admin only)."""
    try:
        response = (
            db.client.table("intake_sessions")
            .select("urgency", count="exact")
            .execute()
        )
        
        urgency_counts = {}
        for session in response.data or []:
            urgency = session.get("urgency", "low")
            urgency_counts[urgency] = urgency_counts.get(urgency, 0) + 1
        
        return APIResponse(
            success=True,
            data={
                "urgency_distribution": urgency_counts,
                "total": sum(urgency_counts.values()),
            },
        )

    except Exception as e:
        logger.error(f"Error getting urgency distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to get urgency distribution")


@router.get("/category-distribution", response_model=APIResponse)
async def get_category_distribution(
    user_id: str = Depends(require_admin())
):
    """Get distribution of legal categories (admin only)."""
    try:
        response = (
            db.client.table("intake_sessions")
            .select("legal_category, count")
            .execute()
        )
        
        category_counts = {}
        for session in response.data or []:
            category = session.get("legal_category", "General")
            category_counts[category] = category_counts.get(category, 0) + 1
        
        return APIResponse(
            success=True,
            data={
                "category_distribution": category_counts,
                "total": sum(category_counts.values()),
            },
        )

    except Exception as e:
        logger.error(f"Error getting category distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to get category distribution")


@router.get("/team-assignments", response_model=APIResponse)
async def get_team_assignments(
    user_id: str = Depends(require_admin())
):
    """Get current team member assignments (admin only)."""
    try:
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
        logger.error(f"Error getting team assignments: {e}")
        raise HTTPException(status_code=500, detail="Failed to get team assignments")


@router.get("/audit-logs", response_model=APIResponse)
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    resource_type: Optional[str] = None,
    user_id: str = Depends(require_admin())
):
    """Get audit logs with optional filtering (admin only)."""
    try:
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
        logger.error(f"Error getting audit logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit logs")


@router.get("/pending-review", response_model=APIResponse)
async def get_pending_review(
    limit: int = Query(10, ge=1, le=100),
    user_id: str = Depends(require_admin())
):
    """Get intakes pending review (admin only)."""
    try:
        # Get anonymous intakes with submitted status
        response = (
            db.client.table("anonymous_intakes")
            .select("*")
            .eq("status", "submitted")
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
        logger.error(f"Error getting pending intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to get pending intakes")
