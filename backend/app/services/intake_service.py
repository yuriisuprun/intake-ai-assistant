"""
Intake flow service for managing structured intake process.
"""

import logging
from typing import Dict, Any, List, Optional
from app.db.supabase import db

logger = logging.getLogger(__name__)


class IntakeService:
    """Service for managing intake flow."""

    # Define the intake flow structure
    INTAKE_FLOW = [
        {
            "key": "legal_area",
            "step": 1,
            "question": "What is your legal issue about?",
            "description": "Select the primary legal category",
            "question_type": "select",
            "required": True,
            "options": [
                "Employment",
                "Family",
                "Corporate",
                "Real Estate",
                "Intellectual Property",
                "Litigation",
                "Immigration",
                "Tax",
                "Bankruptcy",
                "Other",
            ],
            "help_text": "Choose the category that best describes your legal issue",
        },
        {
            "key": "problem_description",
            "step": 2,
            "question": "Please describe your legal issue in detail",
            "description": "Provide a comprehensive description of your situation",
            "question_type": "textarea",
            "required": True,
            "placeholder": "Describe what happened, when it happened, and who was involved...",
            "help_text": "The more detail you provide, the better we can assist you",
        },
        {
            "key": "timeline",
            "step": 3,
            "question": "When did this issue occur?",
            "description": "Provide key dates related to your issue",
            "question_type": "text",
            "required": False,
            "placeholder": "e.g., Started on January 15, 2024...",
            "help_text": "Include any important dates or timeframes",
        },
        {
            "key": "urgency",
            "step": 4,
            "question": "How urgent is this matter?",
            "description": "Indicate the time sensitivity of your issue",
            "question_type": "select",
            "required": True,
            "options": ["Low - Can wait", "Medium - Should handle soon", "High - Urgent"],
            "help_text": "This helps us prioritize your case",
        },
        {
            "key": "desired_outcome",
            "step": 5,
            "question": "What is your desired outcome?",
            "description": "What would you like to achieve?",
            "question_type": "textarea",
            "required": False,
            "placeholder": "What would an ideal resolution look like for you?",
            "help_text": "This helps us understand your goals",
        },
        {
            "key": "documents",
            "step": 6,
            "question": "Do you have any documents to upload?",
            "description": "Upload relevant documents (contracts, emails, etc.)",
            "question_type": "file",
            "required": False,
            "help_text": "You can upload PDFs, Word documents, images, etc.",
        },
        {
            "key": "contact_preference",
            "step": 7,
            "question": "How would you prefer to be contacted?",
            "description": "Choose your preferred communication method",
            "question_type": "select",
            "required": True,
            "options": ["Email", "Phone", "WhatsApp", "Both"],
            "help_text": "We'll use this to reach out to you",
        },
        {
            "key": "additional_info",
            "step": 8,
            "question": "Is there anything else we should know?",
            "description": "Any additional information that might be relevant",
            "question_type": "textarea",
            "required": False,
            "placeholder": "Any other details that might be important...",
            "help_text": "This is your chance to add any other relevant information",
        },
    ]

    @staticmethod
    def get_intake_flow() -> List[Dict[str, Any]]:
        """Get the complete intake flow definition."""
        return IntakeService.INTAKE_FLOW

    @staticmethod
    def get_question(step: int) -> Optional[Dict[str, Any]]:
        """Get a specific question by step number."""
        for question in IntakeService.INTAKE_FLOW:
            if question["step"] == step:
                return question
        return None

    @staticmethod
    def get_total_steps() -> int:
        """Get total number of steps in intake flow."""
        return len(IntakeService.INTAKE_FLOW)

    @staticmethod
    async def submit_step(
        session_id: str,
        user_id: Optional[str],
        step_key: str,
        answer: Any,
        question_type: str,
    ) -> bool:
        """
        Submit an intake step answer.

        Args:
            session_id: ID of the intake session
            user_id: ID of the user (can be None for anonymous)
            step_key: Key of the question
            answer: Answer provided by user
            question_type: Type of question

        Returns:
            True if successful, False otherwise
        """
        try:
            # Get current session
            session_response = db.client.table("intake_sessions").select("*").eq("id", session_id).single().execute()
            if not session_response.data:
                logger.error(f"Session not found: {session_id}")
                return False
            
            session = session_response.data

            # Get flow data
            flow_data = session.get("flow_data", {}) or {}

            # Store answer
            flow_data[step_key] = answer

            # Find step number
            step_num = None
            for q in IntakeService.INTAKE_FLOW:
                if q["key"] == step_key:
                    step_num = q["step"]
                    break

            # Create message record
            await db.create_message(
                {
                    "session_id": session_id,
                    "role": "client",
                    "content": str(answer),
                    "message_type": "answer",
                    "metadata": {
                        "question_key": step_key,
                        "question_type": question_type,
                        "step": step_num,
                    },
                }
            )

            # Update session - use direct client call to avoid user_id filter
            update_response = db.client.table("intake_sessions").update(
                {
                    "flow_data": flow_data,
                    "current_step": step_num or 0,
                }
            ).eq("id", session_id).execute()

            if not update_response.data:
                logger.error(f"Failed to update session: {session_id}")
                return False

            return True

        except Exception as e:
            logger.error(f"Error submitting intake step: {e}", exc_info=True)
            return False

    @staticmethod
    async def complete_intake(session_id: str, user_id: Optional[str]) -> bool:
        """
        Mark intake as completed.

        Args:
            session_id: ID of the intake session
            user_id: ID of the user (can be None for anonymous)

        Returns:
            True if successful, False otherwise
        """
        try:
            # Get session
            session_response = db.client.table("intake_sessions").select("*").eq("id", session_id).single().execute()
            if not session_response.data:
                logger.error(f"Session not found: {session_id}")
                return False

            # Update session status - use direct client call to avoid user_id filter
            update_response = db.client.table("intake_sessions").update(
                {
                    "status": "completed",
                    "current_step": IntakeService.get_total_steps(),
                }
            ).eq("id", session_id).execute()

            if not update_response.data:
                logger.error(f"Failed to update session: {session_id}")
                return False

            # Create system message
            await db.create_message(
                {
                    "session_id": session_id,
                    "role": "system",
                    "content": "Intake completed. Awaiting lawyer review.",
                    "message_type": "text",
                }
            )

            return True

        except Exception as e:
            logger.error(f"Error completing intake: {e}", exc_info=True)
            return False

    @staticmethod
    def validate_answer(question_key: str, answer: Any) -> tuple[bool, Optional[str]]:
        """
        Validate an answer against question requirements.

        Args:
            question_key: Key of the question
            answer: Answer to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Find question
        question = None
        for q in IntakeService.INTAKE_FLOW:
            if q["key"] == question_key:
                question = q
                break

        if not question:
            return False, "Question not found"

        # Check required
        if question.get("required") and not answer:
            return False, "This field is required"

        # Check type-specific validation
        question_type = question.get("question_type")

        if question_type == "select" or question_type == "radio":
            if answer not in question.get("options", []):
                return False, "Invalid option selected"

        if question_type == "email":
            if "@" not in str(answer):
                return False, "Invalid email address"

        if question_type == "date":
            # Basic date validation
            try:
                from datetime import datetime

                datetime.fromisoformat(str(answer))
            except ValueError:
                return False, "Invalid date format"

        return True, None
