"""
Admin anonymous intake management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.middleware.auth import require_admin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/anonymous-intakes")


@router.get("", response_model=APIResponse)
async def list_all_anonymous_intakes(
    skip: int = 0, limit: int = 20, user_id: str = Depends(require_admin())
):
    """List all anonymous intake submissions (admin only)."""
    try:
        intakes, total = await db.list_all_anonymous_intakes(skip, limit)

        return APIResponse(
            success=True,
            data={
                "intakes": intakes,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error listing anonymous intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to list anonymous intakes")


@router.get("/{intake_id}", response_model=APIResponse)
async def get_anonymous_intake_details(
    intake_id: str, user_id: str = Depends(require_admin())
):
    """Get detailed anonymous intake information (admin only)."""
    try:
        intake = await db.get_anonymous_intake(intake_id)
        
        if not intake:
            raise HTTPException(status_code=404, detail="Anonymous intake not found")

        # Get associated session
        session = await db.client.table("intake_sessions").select("*").eq("id", intake["session_id"]).single().execute()
        
        # Get messages/responses
        messages = await db.get_messages(intake["session_id"])

        return APIResponse(
            success=True,
            data={
                "intake": intake,
                "session": session.data if session.data else None,
                "responses": messages,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting anonymous intake details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get anonymous intake details")


@router.patch("/{intake_id}", response_model=APIResponse)
async def update_anonymous_intake(
    intake_id: str,
    status: str = None,
    admin_notes: str = None,
    user_id: str = Depends(require_admin())
):
    """Update anonymous intake status and notes (admin only)."""
    try:
        update_data = {}
        
        if status:
            if status not in ["submitted", "reviewed", "assigned", "archived"]:
                raise HTTPException(status_code=400, detail="Invalid status")
            update_data["status"] = status
            if status == "reviewed":
                update_data["reviewed_at"] = "now()"
        
        if admin_notes is not None:
            update_data["admin_notes"] = admin_notes

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        intake = await db.update_anonymous_intake(intake_id, update_data)

        if not intake:
            raise HTTPException(status_code=404, detail="Anonymous intake not found")

        return APIResponse(
            success=True,
            data=intake,
            message="Anonymous intake updated successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating anonymous intake: {e}")
        raise HTTPException(status_code=500, detail="Failed to update anonymous intake")


@router.get("/search/by-email", response_model=APIResponse)
async def search_anonymous_intakes_by_email(
    email: str, user_id: str = Depends(require_admin())
):
    """Search anonymous intakes by email (admin only)."""
    try:
        response = (
            db.client.table("anonymous_intakes")
            .select("*")
            .ilike("client_email", f"%{email}%")
            .order("created_at", desc=True)
            .execute()
        )

        intakes = response.data or []

        return APIResponse(
            success=True,
            data={
                "intakes": intakes,
                "total": len(intakes),
            },
        )

    except Exception as e:
        logger.error(f"Error searching anonymous intakes: {e}")
        raise HTTPException(status_code=500, detail="Failed to search anonymous intakes")
