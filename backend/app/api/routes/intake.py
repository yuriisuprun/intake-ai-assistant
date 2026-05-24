"""
Intake flow API routes.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import logging

from app.models.schemas import (
    IntakeSessionCreate,
    IntakeSessionResponse,
    IntakeStepSubmit,
    IntakeFlowResponse,
    IntakeQuestion,
    APIResponse,
)
from app.services.intake_service import IntakeService
from app.db.supabase import db
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/intake")


@router.get("/flow", response_model=IntakeFlowResponse)
async def get_intake_flow():
    """Get the intake flow definition."""
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
async def start_intake(
    request: IntakeSessionCreate, user_id: str = Depends(get_current_user)
):
    """Start a new intake session."""
    try:
        # Verify client exists and belongs to user
        client = await db.get_client(request.client_id, user_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

        # Create intake session
        session = await db.create_intake_session(user_id, request.client_id)

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
            data=IntakeSessionResponse(**session),
            message="Intake session started",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting intake: {e}")
        raise HTTPException(status_code=500, detail="Failed to start intake")


@router.post("/step", response_model=APIResponse)
async def submit_intake_step(
    request: IntakeStepSubmit, user_id: str = Depends(get_current_user)
):
    """Submit an intake step."""
    try:
        # Validate answer
        is_valid, error_msg = IntakeService.validate_answer(
            request.step_key, request.answer
        )
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)

        # Submit step
        success = await IntakeService.submit_step(
            request.session_id,
            user_id,
            request.step_key,
            request.answer,
            request.question_type,
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to submit step")

        # Get updated session
        session = await db.get_intake_session(request.session_id, user_id)

        return APIResponse(
            success=True,
            data=IntakeSessionResponse(**session),
            message="Step submitted successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting intake step: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit step")


@router.post("/complete", response_model=APIResponse)
async def complete_intake(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Complete intake session."""
    try:
        # Complete intake
        success = await IntakeService.complete_intake(session_id, user_id)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to complete intake")

        # Get updated session
        session = await db.get_intake_session(session_id, user_id)

        return APIResponse(
            success=True,
            data=IntakeSessionResponse(**session),
            message="Intake completed successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing intake: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete intake")


@router.get("/{session_id}", response_model=APIResponse)
async def get_intake_session(
    session_id: str, user_id: str = Depends(get_current_user)
):
    """Get intake session details."""
    try:
        session = await db.get_intake_session(session_id, user_id)

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return APIResponse(
            success=True,
            data=IntakeSessionResponse(**session),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intake session: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session")


@router.get("/", response_model=APIResponse)
async def list_intake_sessions(
    skip: int = 0, limit: int = 10, user_id: str = Depends(get_current_user)
):
    """List intake sessions for user."""
    try:
        sessions, total = await db.list_intake_sessions(user_id, skip, limit)

        return APIResponse(
            success=True,
            data={
                "sessions": [IntakeSessionResponse(**s) for s in sessions],
                "total": total,
                "skip": skip,
                "limit": limit,
            },
        )

    except Exception as e:
        logger.error(f"Error listing intake sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to list sessions")
