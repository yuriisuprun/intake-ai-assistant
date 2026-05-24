"""
Ollama LLM integration service.
"""

import httpx
import json
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class OllamaService:
    """Service for interacting with Ollama local LLM."""

    def __init__(
        self,
        base_url: str = settings.OLLAMA_BASE_URL,
        model: str = settings.OLLAMA_MODEL,
        timeout: int = settings.OLLAMA_TIMEOUT,
    ):
        self.base_url = base_url
        self.model = model
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)

    async def health_check(self) -> bool:
        """Check if Ollama is running."""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return False

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        top_p: float = 0.9,
        retry_attempts: int = settings.OLLAMA_RETRY_ATTEMPTS,
    ) -> Optional[str]:
        """
        Generate text using Ollama.

        Args:
            prompt: The prompt to send to the model
            system_prompt: Optional system prompt
            temperature: Sampling temperature (0.0-1.0)
            top_p: Nucleus sampling parameter
            retry_attempts: Number of retry attempts

        Returns:
            Generated text or None if failed
        """
        for attempt in range(retry_attempts):
            try:
                payload = {
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": temperature,
                    "top_p": top_p,
                }

                if system_prompt:
                    payload["system"] = system_prompt

                response = await self.client.post(
                    f"{self.base_url}/api/generate", json=payload
                )

                if response.status_code == 200:
                    data = response.json()
                    return data.get("response", "").strip()
                else:
                    logger.error(
                        f"Ollama error (attempt {attempt + 1}): {response.status_code}"
                    )

            except httpx.TimeoutException:
                logger.warning(
                    f"Ollama timeout (attempt {attempt + 1}/{retry_attempts})"
                )
                if attempt == retry_attempts - 1:
                    logger.error("Ollama timeout - max retries exceeded")
                    return None

            except Exception as e:
                logger.error(f"Ollama error (attempt {attempt + 1}): {e}")
                if attempt == retry_attempts - 1:
                    logger.error(f"Ollama failed - max retries exceeded: {e}")
                    return None

        return None

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,  # Lower temp for JSON
        retry_attempts: int = settings.OLLAMA_RETRY_ATTEMPTS,
    ) -> Optional[Dict[str, Any]]:
        """
        Generate JSON response from Ollama.

        Args:
            prompt: The prompt to send to the model
            system_prompt: Optional system prompt
            temperature: Sampling temperature (lower for JSON)
            retry_attempts: Number of retry attempts

        Returns:
            Parsed JSON dict or None if failed
        """
        response_text = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            retry_attempts=retry_attempts,
        )

        if not response_text:
            return None

        try:
            # Try to extract JSON from response
            # Sometimes the model includes extra text
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1

            if json_start != -1 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            else:
                # Try parsing the whole response
                return json.loads(response_text)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.debug(f"Response text: {response_text}")
            return None

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()


# Singleton instance
_ollama_service: Optional[OllamaService] = None


def get_ollama_service() -> OllamaService:
    """Get or create Ollama service instance."""
    global _ollama_service
    if _ollama_service is None:
        _ollama_service = OllamaService()
    return _ollama_service


async def close_ollama_service():
    """Close Ollama service."""
    global _ollama_service
    if _ollama_service:
        await _ollama_service.close()
        _ollama_service = None
