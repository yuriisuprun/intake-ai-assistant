"""
Intake flow API routes.
"""

from fastapi import APIRouter, HTTPException
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
async def start_intake(request: IntakeSessionCreate):
    """Start a new intake session."""
    try:
        # Create intake session with client information
        session = await db.create_intake_session(
            client_name=request.client_name,
            client_email=request.client_email,
            client_phone=request.client_phone
        )

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
    request: IntakeStepSubmit
):
    """Submit an intake step answer."""
    try:
        # Get session
        session = await db.client.table("intakes").select("*").eq("id", request.session_id).single().execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        session_data = session.data

        # Validate answer
        is_valid, error_msg = IntakeService.validate_answer(request.step_key, request.answer)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)

        # Submit step
        success = await IntakeService.submit_step(
            request.session_id,
            None,  # No user_id needed
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
    session_id: str
):
    """Complete an intake session."""
    try:
        # Get session
        session = await db.client.table("intakes").select("*").eq("id", session_id).single().execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        # Complete intake
        success = await IntakeService.complete_intake(session_id, None)

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
    session_id: str
):
    """Get intake session details."""
    try:
        session = await db.client.table("intakes").select("*").eq("id", session_id).single().execute()
        
        if not session.data:
            raise HTTPException(status_code=404, detail="Session not found")

        return APIResponse(
            success=True,
            data=session.data,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intake session: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session")


@router.get("/", response_model=APIResponse)
async def list_intake_sessions(
    skip: int = 0, limit: int = 10
):
    """List all intake sessions."""
    try:
        sessions, total = await db.list_intake_sessions(skip, limit)

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
