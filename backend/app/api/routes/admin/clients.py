"""
Admin client management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from app.models.schemas import ClientResponse, APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/clients")


@router.get("", response_model=APIResponse)
async def list_all_clients(
    skip: int = 0, limit: int = 20, user_id: str = Depends(get_current_user)
):
    """List all clients (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get all clients
        clients, total = await db.list_all_clients(skip, limit)

        return APIResponse(
            success=True,
            data={
                "clients": [ClientResponse(**c) for c in clients],
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error listing clients: {e}")
        raise HTTPException(status_code=500, detail="Failed to list clients")


@router.get("/{client_id}", response_model=APIResponse)
async def get_client_details(
    client_id: str, user_id: str = Depends(get_current_user)
):
    """Get detailed client information (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get client details
        client = await db.get_client_admin(client_id)
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        return APIResponse(
            success=True,
            data=ClientResponse(**client),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting client details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get client details")


@router.get("/{client_id}/sessions", response_model=APIResponse)
async def get_client_sessions(
    client_id: str, skip: int = 0, limit: int = 20, user_id: str = Depends(get_current_user)
):
    """Get all sessions for a client (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get client sessions
        sessions, total = await db.get_client_sessions(client_id, skip, limit)
        
        if not sessions:
            sessions = []

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
        logger.error(f"Error getting client sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get client sessions")
