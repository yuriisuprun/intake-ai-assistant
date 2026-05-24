"""
Messages API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from app.models.schemas import MessageCreate, MessageResponse, APIResponse
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/messages")


@router.post("/", response_model=APIResponse)
async def create_message(
    request: MessageCreate, user_id: str = Depends(get_current_user)
):
    """Create a new message."""
    try:
        # Verify session belongs to user
        session = await db.get_intake_session(request.session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Create message
        message = await db.create_message(
            {
                "session_id": request.session_id,
                "role": request.role.value,
                "content": request.content,
                "message_type": request.message_type.value if request.message_type else "text",
                "metadata": request.metadata,
            }
        )

        if not message:
            raise HTTPException(status_code=500, detail="Failed to create message")

        return APIResponse(
            success=True,
            data=MessageResponse(**message),
            message="Message created successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating message: {e}")
        raise HTTPException(status_code=500, detail="Failed to create message")


@router.get("/{session_id}", response_model=APIResponse)
async def get_messages(
    session_id: str, skip: int = 0, limit: int = 50, user_id: str = Depends(get_current_user)
):
    """Get messages for a session."""
    try:
        # Verify session belongs to user
        session = await db.get_intake_session(session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Get messages
        messages = await db.get_messages(session_id, skip, limit)

        return APIResponse(
            success=True,
            data={
                "messages": [MessageResponse(**m) for m in messages],
                "total": len(messages),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get messages")
