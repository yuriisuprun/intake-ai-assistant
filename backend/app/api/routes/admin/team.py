"""
Admin team management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/team")


class TeamMemberCreate(BaseModel):
    """Team member creation request."""
    email: str
    role: str
    name: str


class TeamMemberUpdate(BaseModel):
    """Team member update request."""
    role: str
    name: str


@router.get("", response_model=APIResponse)
async def list_team_members(
    skip: int = 0, limit: int = 20, user_id: str = Depends(get_current_user)
):
    """List team members (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get team members
        members, total = await db.list_team_members(skip, limit)
        
        if not members:
            members = []

        return APIResponse(
            success=True,
            data={
                "members": members,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error listing team members: {e}")
        raise HTTPException(status_code=500, detail="Failed to list team members")


@router.post("", response_model=APIResponse)
async def add_team_member(
    request: TeamMemberCreate, user_id: str = Depends(get_current_user)
):
    """Add a team member (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Add team member
        member = await db.create_team_member(
            {
                "email": request.email,
                "role": request.role,
                "name": request.name,
            }
        )

        if not member:
            raise HTTPException(status_code=500, detail="Failed to add team member")

        return APIResponse(
            success=True,
            data=member,
            message="Team member added successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding team member: {e}")
        raise HTTPException(status_code=500, detail="Failed to add team member")


@router.put("/{member_id}", response_model=APIResponse)
async def update_team_member(
    member_id: str, request: TeamMemberUpdate, user_id: str = Depends(get_current_user)
):
    """Update a team member (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Update team member
        member = await db.update_team_member(
            member_id, {"role": request.role, "name": request.name}
        )

        if not member:
            raise HTTPException(status_code=500, detail="Failed to update team member")

        return APIResponse(
            success=True,
            data=member,
            message="Team member updated successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating team member: {e}")
        raise HTTPException(status_code=500, detail="Failed to update team member")


@router.delete("/{member_id}", response_model=APIResponse)
async def remove_team_member(
    member_id: str, user_id: str = Depends(get_current_user)
):
    """Remove a team member (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Remove team member
        success = await db.delete_team_member(member_id)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to remove team member")

        return APIResponse(
            success=True,
            message="Team member removed successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing team member: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove team member")
