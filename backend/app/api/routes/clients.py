"""
Client management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import logging

from app.models.schemas import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    APIResponse,
)
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/clients")


@router.post("", response_model=APIResponse)
async def create_client(
    request: ClientCreate, user_id: str = Depends(get_current_user)
):
    """Create a new client."""
    try:
        client_data = request.model_dump()
        client = await db.create_client(user_id, client_data)

        if not client:
            raise HTTPException(status_code=500, detail="Failed to create client")

        return APIResponse(
            success=True,
            data=ClientResponse(**client),
            message="Client created successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating client: {e}")
        raise HTTPException(status_code=500, detail="Failed to create client")


@router.get("", response_model=APIResponse)
async def list_clients(
    skip: int = 0, limit: int = 10, user_id: str = Depends(get_current_user)
):
    """List clients for the current user."""
    try:
        clients, total = await db.list_clients(user_id, skip, limit)

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
async def get_client(
    client_id: str, user_id: str = Depends(get_current_user)
):
    """Get a specific client."""
    try:
        client = await db.get_client(client_id, user_id)

        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        return APIResponse(
            success=True,
            data=ClientResponse(**client),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting client: {e}")
        raise HTTPException(status_code=500, detail="Failed to get client")


@router.put("/{client_id}", response_model=APIResponse)
async def update_client(
    client_id: str,
    request: ClientUpdate,
    user_id: str = Depends(get_current_user),
):
    """Update a client."""
    try:
        # Verify client exists
        client = await db.get_client(client_id, user_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        # Update client
        update_data = request.model_dump(exclude_unset=True)
        updated_client = await db.update_client(client_id, user_id, update_data)

        if not updated_client:
            raise HTTPException(status_code=500, detail="Failed to update client")

        return APIResponse(
            success=True,
            data=ClientResponse(**updated_client),
            message="Client updated successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating client: {e}")
        raise HTTPException(status_code=500, detail="Failed to update client")
