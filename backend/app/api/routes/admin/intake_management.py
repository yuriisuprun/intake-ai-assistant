"""
Advanced admin intake management API routes with bulk operations and analytics.
Follows REST best practices with comprehensive error handling and logging.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.middleware.auth import require_admin
from app.db.admin_operations import AdminOperations

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/intake-management")


# ============================================================================
# BULK OPERATIONS
# ============================================================================

@router.patch("/bulk/status", response_model=APIResponse)
async def bulk_update_status(
    session_ids: List[str] = Body(..., description="List of session IDs to update"),
    status: str = Body(..., description="New status for all sessions"),
    user_id: str = Depends(require_admin())
):
    """Bulk update status for multiple intakes (admin only)."""
    try:
        if not session_ids:
            raise HTTPException(status_code=400, detail="No session IDs provided")
        
        valid_statuses = ["new", "assigned", "in_progress", "completed", "archived"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        results = await AdminOperations.bulk_update_status(
            session_ids=session_ids,
            status=status,
            user_id=user_id
        )
        
        return APIResponse(
            success=True,
            data=results,
            message=f"Bulk status update completed: {results['updated']} updated, {results['failed']} failed"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk status update: {e}")
        raise HTTPException(status_code=500, detail="Failed to bulk update status")


@router.patch("/bulk/assign", response_model=APIResponse)
async def bulk_assign(
    session_ids: List[str] = Body(..., description="List of session IDs to assign"),
    assigned_to_user_id: str = Body(..., description="User ID to assign to"),
    user_id: str = Depends(require_admin())
):
    """Bulk assign multiple intakes to a team member (admin only)."""
    try:
        if not session_ids:
            raise HTTPException(status_code=400, detail="No session IDs provided")
        
        results = await AdminOperations.bulk_assign(
            session_ids=session_ids,
            assigned_to_user_id=assigned_to_user_id,
            assigned_by_user_id=user_id
        )
        
        return APIResponse(
            success=True,
            data=results,
            message=f"Bulk assignment completed: {results['assigned']} assigned, {results['failed']} failed"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk assign: {e}")
        raise HTTPException(status_code=500, detail="Failed to bulk assign intakes")


# ============================================================================
# ADVANCED SEARCH & FILTERING
# ============================================================================

@router.get("/search", response_model=APIResponse)
async def search_intakes(
    query: str = Query(..., min_length=2, description="Search query"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by legal category"),
    limit: int = Query(50, ge=1, le=200, description="Maximum results"),
    user_id: str = Depends(require_admin())
):
    """Advanced search across intakes with multiple filters (admin only)."""
    try:
        filters = {
            "status": status,
            "category": category,
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v}
        
        results = await AdminOperations.search_intakes(
            query=query,
            filters=filters if filters else None,
            limit=limit
        )
        
        return APIResponse(
            success=True,
            data={
                "results": results,
                "total": len(results),
                "query": query,
                "filters_applied": bool(filters),
            }
        )
    
    except Exception as e:
        logger.error(f"Error searching intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to search intakes")


# ============================================================================
# ANALYTICS & REPORTING
# ============================================================================

@router.get("/metrics", response_model=APIResponse)
async def get_intake_metrics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    status: Optional[str] = Query(None, description="Filter by status"),
    user_id: str = Depends(require_admin())
):
    """Get comprehensive intake metrics and statistics (admin only)."""
    try:
        metrics = await AdminOperations.get_intake_metrics(
            days=days,
            status=status
        )
        
        return APIResponse(
            success=True,
            data=metrics
        )
    
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get metrics")


@router.get("/performance", response_model=APIResponse)
async def get_performance_metrics(
    user_id: str = Depends(require_admin())
):
    """Get intake processing performance metrics (admin only)."""
    try:
        performance = await AdminOperations.get_intake_performance()
        
        return APIResponse(
            success=True,
            data=performance
        )
    
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get performance metrics")


@router.get("/team-workload", response_model=APIResponse)
async def get_team_workload(
    user_id: str = Depends(require_admin())
):
    """Get team member workload distribution (admin only)."""
    try:
        workload = await AdminOperations.get_team_workload()
        
        return APIResponse(
            success=True,
            data={
                "team_workload": workload,
                "total_members": len(workload),
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting team workload: {e}")
        raise HTTPException(status_code=500, detail="Failed to get team workload")


# ============================================================================
# DATA EXPORT
# ============================================================================

@router.get("/export", response_model=APIResponse)
async def export_intakes(
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    user_id: str = Depends(require_admin())
):
    """Export intakes data for reporting/analysis (admin only)."""
    try:
        filters = {
            "status": status,
            "category": category,
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v}
        
        export_data = await AdminOperations.export_intakes_data(
            filters=filters if filters else None
        )
        
        return APIResponse(
            success=True,
            data={
                "intakes": export_data,
                "total": len(export_data),
                "exported_at": datetime.utcnow().isoformat(),
                "filters_applied": filters if filters else {},
            }
        )
    
    except Exception as e:
        logger.error(f"Error exporting intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to export intakes")


# ============================================================================
# WORKFLOW MANAGEMENT
# ============================================================================

@router.get("/{session_id}/workflow", response_model=APIResponse)
async def get_intake_workflow_status(
    session_id: str,
    user_id: str = Depends(require_admin())
):
    """Get detailed workflow status and available actions for an intake (admin only)."""
    try:
        # Get session
        session = await db.get_intake_session_admin(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        current_status = session.get("status")
        
        # Define workflow transitions
        workflow_transitions = {
            "in_progress": ["completed", "archived"],
            "completed": ["archived", "in_progress"],
            "archived": ["in_progress"],
        }
        
        available_actions = workflow_transitions.get(current_status, [])
        
        return APIResponse(
            success=True,
            data={
                "session_id": session_id,
                "current_status": current_status,
                "available_transitions": available_actions,
                "last_updated": session.get("updated_at"),
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get workflow status")


# ============================================================================
# QUALITY & COMPLIANCE
# ============================================================================

@router.post("/{session_id}/flag-review", response_model=APIResponse)
async def flag_for_review(
    session_id: str,
    reason: str = Body(..., description="Reason for flagging"),
    priority: str = Body("medium", description="Priority level: low, medium, high"),
    user_id: str = Depends(require_admin())
):
    """Flag an intake for quality review or compliance check (admin only)."""
    try:
        if priority not in ["low", "medium", "high"]:
            raise HTTPException(status_code=400, detail="Invalid priority level")
        
        # Create a flagged note
        note = await AdminOperations.create_note(
            session_id=session_id,
            admin_id=user_id,
            note_text=f"[{priority.upper()} REVIEW FLAG] {reason}",
            note_type="urgent" if priority == "high" else "general"
        )
        
        # Log action
        await AdminOperations.create_audit_log(
            user_id=user_id,
            action="FLAG_FOR_REVIEW",
            resource_type="intake_session",
            resource_id=session_id,
            changes={"reason": reason, "priority": priority}
        )
        
        return APIResponse(
            success=True,
            data=note,
            message=f"Intake flagged for {priority} priority review"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error flagging intake: {e}")
        raise HTTPException(status_code=500, detail="Failed to flag intake")


# ============================================================================
# REPORTING & AUDITS
# ============================================================================

@router.get("/audit-trail/{session_id}", response_model=APIResponse)
async def get_audit_trail(
    session_id: str,
    user_id: str = Depends(require_admin())
):
    """Get complete audit trail for an intake (admin only)."""
    try:
        audit_logs = await AdminOperations.get_audit_logs(
            resource_type="intake_session"
        )
        
        # Filter for this session
        session_logs = [log for log in audit_logs if log.get("resource_id") == session_id]
        
        return APIResponse(
            success=True,
            data={
                "session_id": session_id,
                "audit_trail": session_logs,
                "total_actions": len(session_logs),
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting audit trail: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit trail")
