"""
AI Summary generation service.
"""

import json
import logging
from typing import Optional, Dict, Any, List
from app.services.ollama_service import get_ollama_service
from app.services.pdf_service import pdf_service
from app.db.supabase import db
from app.core.prompts import (
    SYSTEM_PROMPT,
    SUMMARY_PROMPT_TEMPLATE,
    CATEGORY_DETECTION_PROMPT,
    URGENCY_ASSESSMENT_PROMPT,
)
from app.models.schemas import AISummaryResponse, UrgencyLevel

logger = logging.getLogger(__name__)


class SummaryService:
    """Service for generating AI summaries of intake sessions."""

    def __init__(self):
        self.ollama = get_ollama_service()

    async def generate_summary(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Generate AI summary for an intake session.

        Args:
            session_id: ID of the intake session
            user_id: ID of the user (for authorization)

        Returns:
            Summary dict or None if failed
        """
        try:
            # Get session
            session = await db.get_intake_session(session_id, user_id)
            if not session:
                logger.error(f"Session not found: {session_id}")
                return None

            # Get all messages
            messages = await db.get_messages(session_id)
            if not messages:
                logger.warning(f"No messages found for session: {session_id}")
                return None

            # Get all files
            files = await db.get_files(session_id)

            # Build client info from messages
            client_info = self._build_client_info(messages)

            # Extract text from documents
            documents_info = await self._extract_documents_info(files)

            # Generate summary
            summary_data = await self._generate_summary_data(
                client_info, documents_info
            )

            if not summary_data:
                logger.error("Failed to generate summary data")
                return None

            # Store summary in database
            await db.update_intake_session(
                session_id,
                user_id,
                {
                    "ai_summary": summary_data,
                    "urgency": summary_data.get("urgency"),
                },
            )

            return summary_data

        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return None

    def _build_client_info(self, messages: List[Dict[str, Any]]) -> str:
        """Build client information from messages."""
        info_parts = []

        for message in messages:
            if message.get("role") == "client":
                content = message.get("content", "")
                metadata = message.get("metadata", {})

                if metadata.get("question_key"):
                    question_key = metadata.get("question_key")
                    info_parts.append(f"{question_key}: {content}")
                else:
                    info_parts.append(content)

        return "\n".join(info_parts)

    async def _extract_documents_info(self, files: List[Dict[str, Any]]) -> str:
        """Extract information from uploaded documents."""
        docs_info = []

        for file in files:
            extracted_text = file.get("extracted_text", "")
            file_name = file.get("file_name", "")
            document_type = file.get("document_type", "unknown")

            if extracted_text:
                summary = pdf_service.summarize_text(extracted_text, max_length=500)
                docs_info.append(
                    f"Document: {file_name} (Type: {document_type})\n{summary}"
                )

        return "\n\n".join(docs_info) if docs_info else "No documents provided"

    async def _generate_summary_data(
        self, client_info: str, documents_info: str
    ) -> Optional[Dict[str, Any]]:
        """Generate summary data using Ollama."""
        try:
            # Build prompt
            prompt = SUMMARY_PROMPT_TEMPLATE.format(
                client_info=client_info, documents_info=documents_info
            )

            # Call Ollama
            response = await self.ollama.generate_json(
                prompt=prompt, system_prompt=SYSTEM_PROMPT, temperature=0.3
            )

            if not response:
                logger.error("Ollama returned no response")
                return None

            # Validate and normalize response
            summary_data = self._normalize_summary_response(response)
            return summary_data

        except Exception as e:
            logger.error(f"Error generating summary data: {e}")
            return None

    def _normalize_summary_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize and validate summary response from Ollama."""
        try:
            # Ensure required fields
            summary = response.get("summary", "")
            urgency = response.get("urgency", "medium")
            key_facts = response.get("key_facts", [])
            missing_info = response.get("missing_information", [])
            recommended_questions = response.get("recommended_next_questions", [])
            confidence = response.get("confidence", 0.5)

            # Validate urgency
            try:
                urgency = UrgencyLevel(urgency).value
            except ValueError:
                urgency = "medium"

            # Ensure lists
            if not isinstance(key_facts, list):
                key_facts = [str(key_facts)]
            if not isinstance(missing_info, list):
                missing_info = [str(missing_info)]
            if not isinstance(recommended_questions, list):
                recommended_questions = [str(recommended_questions)]

            # Ensure confidence is float between 0 and 1
            try:
                confidence = float(confidence)
                confidence = max(0.0, min(1.0, confidence))
            except (ValueError, TypeError):
                confidence = 0.5

            return {
                "summary": summary,
                "urgency": urgency,
                "key_facts": key_facts[:10],  # Limit to 10
                "missing_information": missing_info[:10],  # Limit to 10
                "recommended_next_questions": recommended_questions[:10],  # Limit to 10
                "confidence": confidence,
                "model": "mistral",
            }

        except Exception as e:
            logger.error(f"Error normalizing summary response: {e}")
            return {
                "summary": "Unable to generate summary",
                "urgency": "medium",
                "key_facts": [],
                "missing_information": [],
                "recommended_next_questions": [],
                "confidence": 0.0,
                "model": "mistral",
            }

    async def detect_legal_category(self, description: str) -> Optional[str]:
        """Detect legal category from description (deprecated - kept for backward compatibility)."""
        # This method is deprecated as legal_category column has been removed
        return None

    async def assess_urgency(self, facts: List[str]) -> Optional[str]:
        """Assess urgency level from facts."""
        try:
            facts_text = "\n".join(facts)
            prompt = URGENCY_ASSESSMENT_PROMPT.format(facts=facts_text)
            response = await self.ollama.generate_json(
                prompt=prompt, system_prompt=SYSTEM_PROMPT, temperature=0.3
            )

            if response:
                urgency = response.get("urgency", "medium")
                try:
                    return UrgencyLevel(urgency).value
                except ValueError:
                    return "medium"

            return None

        except Exception as e:
            logger.error(f"Error assessing urgency: {e}")
            return None


# Singleton instance
summary_service = SummaryService()
