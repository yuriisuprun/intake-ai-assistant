"""
Role-based authorization middleware.
"""

from fastapi import HTTPException, Depends
from typing import Optional, List
import logging

from app.api.dependencies import get_current_user
from app.db.supabase import db

logger = logging.getLogger(__name__)


async def get_user_role(user_id: str) -> str:
    """Get user role from database."""
    try:
        # Use service_role client to bypass RLS when checking user role
        # This prevents infinite recursion issues with RLS policies
        response = (
            db.service_role_client.table("team_members")
            .select("role,status")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        
        if response.data:
            role = response.data.get("role", "client")
            status = response.data.get("status", "active")
            # Only return the role if the user is active
            if status == "active":
                return role
            return "client"
        
        # If not in team_members, they're a regular client
        return "client"
    except Exception as e:
        # If there's any error, default to client
        logger.error(f"Error getting user role: {e}")
        return "client"


async def require_role(
    required_roles: List[str],
    user_id: str = Depends(get_current_user),
) -> str:
    """
    Dependency to require specific roles.
    
    Usage:
        @router.get("/admin")
        async def admin_endpoint(user_id: str = Depends(require_role(["admin"]))):
            ...
    """
    user_role = await get_user_role(user_id)
    
    if user_role not in required_roles:
        logger.warning(f"User {user_id} with role {user_role} attempted unauthorized access")
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient permissions. Required roles: {', '.join(required_roles)}",
        )
    
    return user_id


def require_admin(required_roles: List[str] = None):
    """
    Decorator to require admin role.
    
    Usage:
        @router.get("/admin")
        async def admin_endpoint(user_id: str = Depends(require_admin())):
            ...
    """
    if required_roles is None:
        required_roles = ["admin"]
    
    async def _require_admin(user_id: str = Depends(get_current_user)) -> str:
        return await require_role(required_roles, user_id)
    
    return _require_admin


def require_client(required_roles: List[str] = None):
    """
    Decorator to require client role.
    
    Usage:
        @router.get("/client")
        async def client_endpoint(user_id: str = Depends(require_client())):
            ...
    """
    if required_roles is None:
        required_roles = ["client", "admin"]
    
    async def _require_client(user_id: str = Depends(get_current_user)) -> str:
        return await require_role(required_roles, user_id)
    
    return _require_client
