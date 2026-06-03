"""
Intake flow API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import logging
import uuid

from app.models.schemas import (
    IntakeSessionCreate,
    IntakeSessionResponse,
    IntakeStepSubmit,
    IntakeFlowResponse,
    IntakeQuestion,
    APIResponse,
    IntakeCreate,
)
from app.services.intake_service import IntakeService
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/intake")


@router.get("/flow", response_model=IntakeFlowResponse)
async def get_intake_flow():
    """Get the intake flow definition (public endpoint)."""
    try:
        questions = IntakeService.get_intake_flow()
        return IntakeFlowResponse(
            questions=[IntakeQuestion(**q) for q in questions],
            total_steps=IntakeService.get_total_steps(),
        )
    except Exception as e:
        logger.error(f"Error getting intake flow: {e}")
        raise HTTPException(status_code=500, detail="Failed to get intake flow")


@router.post("/start", response_model=APIResponse)
async def start_intake(request: IntakeSessionCreate, user_id: Optional[str] = Depends(get_current_user)):
    """Start a new intake session (registered or unregistered)."""
    try:
        session = None
        
        # Registered client intake
        if request.client_id:
            if not user_id:
                raise HTTPException(status_code=401, detail="Authentication required for registered client intake")
            
            # Verify client exists and belongs to user
            client = await db.get_client(request.client_id, user_id)
            if not client:
                raise HTTPException(status_code=404, detail="Client not found")

            # Create intake session
            session = await db.create_intake_session(user_id=user_id, client_id=request.client_id)

        # Unregistered intake
        elif request.client_name and request.client_email:
            # Create unregistered intake session with client info
            session = await db.create_intake_session(
                user_id=None,
                client_id=None,
                client_name=request.client_name,
                client_email=request.client_email,
                client_phone=request.client_phone
            )
        else:
            raise HTTPException(status_code=400, detail="Either client_id or client info (name and email) is required")

        if not session:
            raise HTTPException(status_code=500, detail="Failed to create intake session")

        # Create system message
        await db.create_message(
            {
                "session_id": session["id"],
                "role": "system",
                "content": "Intake session started",
                "message_type": "text",
            }
        )

        return APIResponse(
            success=True,
            data={
                "id": session["id"],
                "status": session.get("status"),
                "current_step": session.get("current_step"),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting intake: {e}")
        raise HTTPException(status_code=500, detail="Failed to start intake session")


@router.post("/step", response_model=APIResponse)
async def submit_intake_step(
    request: IntakeStepSubmit, user_id: Optional[str] = Depends(get_current_user)
):
    """Submit an intake step answer (works for both registered and unregistered)."""
    try:
        # Get session
        session = db.client.table("intake_sessions").select("*").eq("id", request.session_id).single().execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        session_data = session.data

        # For registered sessions with user_id, verify ownership
        if session_data.get("user_id") and session_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Validate answer
        is_valid, error_msg = IntakeService.validate_answer(request.step_key, request.answer)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)

        # Submit step
        success = await IntakeService.submit_step(
            request.session_id,
            session_data.get("user_id"),  # Can be None for anonymous
            request.step_key,
            request.answer,
            request.question_type,
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to submit step")

        return APIResponse(success=True, message="Step submitted successfully")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting intake step: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to submit step: {str(e)}")


@router.post("/complete", response_model=APIResponse)
async def complete_intake(
    session_id: str, user_id: Optional[str] = Depends(get_current_user)
):
    """Complete an intake session."""
    try:
        # Get session
        session = db.client.table("intake_sessions").select("*").eq("id", session_id).single().execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        session_data = session.data
        is_anonymous = session_data.get("is_anonymous", False)

        # For registered sessions, verify ownership
        if not is_anonymous and session_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Complete intake
        success = await IntakeService.complete_intake(session_id, session_data.get("user_id"))

        if not success:
            raise HTTPException(status_code=500, detail="Failed to complete intake")

        return APIResponse(success=True, message="Intake completed successfully")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing intake: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to complete intake: {str(e)}")


@router.get("/{session_id}", response_model=APIResponse)
async def get_intake_session(
    session_id: str, user_id: Optional[str] = Depends(get_current_user)
):
    """Get intake session details."""
    try:
        session = await db.client.table("intake_sessions").select("*").eq("id", session_id).single().execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        session_data = session.data
        is_anonymous = session_data.get("is_anonymous", False)

        # For registered sessions, verify ownership
        if not is_anonymous and session_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")

        return APIResponse(
            success=True,
            data=session_data,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intake session: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session")


@router.get("/", response_model=APIResponse)
async def list_intake_sessions(
    skip: int = 0, limit: int = 10, user_id: Optional[str] = Depends(get_current_user)
):
    """List intake sessions for user."""
    try:
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required to list sessions")
        
        sessions, total = await db.list_intake_sessions(user_id, skip, limit)

        return APIResponse(
            success=True,
            data={
                "sessions": sessions,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing intake sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to list sessions")
