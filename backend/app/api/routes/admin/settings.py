"""
Admin settings management API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging

from app.models.schemas import APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings")


class SettingUpdate(BaseModel):
    """Setting update request."""
    value: str


@router.get("", response_model=APIResponse)
async def get_settings(user_id: str = Depends(get_current_user)):
    """Get all settings (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get settings
        settings = await db.get_all_settings()
        
        if not settings:
            settings = {}

        return APIResponse(
            success=True,
            data=settings,
        )

    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get settings")


@router.get("/{setting_key}", response_model=APIResponse)
async def get_setting(
    setting_key: str, user_id: str = Depends(get_current_user)
):
    """Get a specific setting (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Get setting
        setting = await db.get_setting(setting_key)
        
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")

        return APIResponse(
            success=True,
            data=setting,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting setting: {e}")
        raise HTTPException(status_code=500, detail="Failed to get setting")


@router.put("/{setting_key}", response_model=APIResponse)
async def update_setting(
    setting_key: str, request: SettingUpdate, user_id: str = Depends(get_current_user)
):
    """Update a setting (admin only)."""
    try:
        # TODO: Add role-based authorization check
        # Update setting
        setting = await db.update_setting(setting_key, request.value)

        if not setting:
            raise HTTPException(status_code=500, detail="Failed to update setting")

        return APIResponse(
            success=True,
            data=setting,
            message="Setting updated successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating setting: {e}")
        raise HTTPException(status_code=500, detail="Failed to update setting")
