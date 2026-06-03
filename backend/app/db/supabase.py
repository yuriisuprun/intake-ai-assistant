"""
Supabase database client and utilities.
"""

from supabase import create_client, Client
from app.core.config import settings
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class SupabaseDB:
    """Supabase database client wrapper."""

    _instance: Optional["SupabaseDB"] = None
    _client: Optional[Client] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            # Use service role key for write operations to bypass RLS
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
            self._client = create_client(settings.SUPABASE_URL, key)

    @property
    def client(self) -> Client:
        """Get Supabase client."""
        if self._client is None:
            # Use service role key for write operations to bypass RLS
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
            self._client = create_client(settings.SUPABASE_URL, key)
        return self._client

    # Clients
    async def create_client(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new client."""
        try:
            response = (
                self.client.table("clients")
                .insert({**data, "user_id": user_id})
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating client: {e}")
            raise

    async def get_client(self, client_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get client by ID."""
        try:
            response = (
                self.client.table("clients")
                .select("*")
                .eq("id", client_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error getting client: {e}")
            return None

    async def list_clients(
        self, user_id: str, skip: int = 0, limit: int = 10
    ) -> tuple[List[Dict[str, Any]], int]:
        """List clients for user."""
        try:
            # Get total count
            count_response = (
                self.client.table("clients")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            total = count_response.count or 0

            # Get paginated results
            response = (
                self.client.table("clients")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .range(skip, skip + limit - 1)
                .execute()
            )
            return response.data or [], total
        except Exception as e:
            logger.error(f"Error listing clients: {e}")
            return [], 0

    async def update_client(
        self, client_id: str, user_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update client."""
        try:
            response = (
                self.client.table("clients")
                .update(data)
                .eq("id", client_id)
                .eq("user_id", user_id)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating client: {e}")
            raise

    # Intake Sessions
    async def create_intake_session(
        self, user_id: Optional[str] = None, client_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new intake session (registered or unregistered)."""
        try:
            response = (
                self.client.table("intake_sessions")
                .insert(
                    {
                        "user_id": user_id,
                        "client_id": client_id,
                        "status": "submitted",
                        "current_step": 0,
                        "flow_data": {},
                    }
                )
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating intake session: {e}")
            raise

    async def create_intake(self, session_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an anonymous intake record."""
        try:
            response = (
                self.client.table("anonymous_intakes")
                .insert({**data, "session_id": session_id, "status": "submitted"})
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating intake: {e}")
            raise

    async def get_intake(self, intake_id: str) -> Optional[Dict[str, Any]]:
        """Get anonymous intake by ID."""
        try:
            response = (
                self.client.table("anonymous_intakes")
                .select("*")
                .eq("id", intake_id)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error getting intake: {e}")
            return None

    async def list_all_intakes(self, skip: int = 0, limit: int = 20) -> tuple[List[Dict[str, Any]], int]:
        """List all intakes (admin only) - combines anonymous intakes and registered sessions."""
        try:
            # Get anonymous intakes count
            anon_count_response = (
                self.client.table("anonymous_intakes")
                .select("id", count="exact")
                .execute()
            )
            anon_total = anon_count_response.count or 0

            # Get anonymous intakes
            anon_response = (
                self.client.table("anonymous_intakes")
                .select("*")
                .order("created_at", desc=True)
                .range(skip, skip + limit - 1)
                .execute()
            )
            
            # Format results
            results = anon_response.data or []
            return results, anon_total
        except Exception as e:
            logger.error(f"Error listing intakes: {e}")
            return [], 0

    async def update_intake(self, intake_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update anonymous intake."""
        try:
            response = (
                self.client.table("anonymous_intakes")
                .update(data)
                .eq("id", intake_id)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating intake: {e}")
            raise

    async def get_intake_session(
        self, session_id: str, user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get intake session by ID."""
        try:
            response = (
                self.client.table("intake_sessions")
                .select("*")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error getting intake session: {e}")
            return None

    async def list_intake_sessions(
        self, user_id: str, skip: int = 0, limit: int = 10
    ) -> tuple[List[Dict[str, Any]], int]:
        """List intake sessions for user."""
        try:
            # Get total count
            count_response = (
                self.client.table("intake_sessions")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            total = count_response.count or 0

            # Get paginated results with client info
            response = (
                self.client.table("intake_sessions")
                .select("*, clients(id, full_name, email)")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .range(skip, skip + limit - 1)
                .execute()
            )
            return response.data or [], total
        except Exception as e:
            logger.error(f"Error listing intake sessions: {e}")
            return [], 0

    async def list_all_intake_sessions(
        self, skip: int = 0, limit: int = 20
    ) -> tuple[List[Dict[str, Any]], int]:
        """List all intake sessions (admin only) - includes both registered and intakes."""
        try:
            # Get total count
            count_response = (
                self.client.table("intake_sessions")
                .select("id", count="exact")
                .execute()
            )
            total = count_response.count or 0

            # Get paginated results with client info (optional join)
            response = (
                self.client.table("intake_sessions")
                .select("*, clients(id, full_name, email)")
                .order("created_at", desc=True)
                .range(skip, skip + limit - 1)
                .execute()
            )
            return response.data or [], total
        except Exception as e:
            logger.error(f"Error listing all intake sessions: {e}")
            return [], 0

    async def update_intake_session(
        self, session_id: str, user_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update intake session."""
        try:
            response = (
                self.client.table("intake_sessions")
                .update(data)
                .eq("id", session_id)
                .eq("user_id", user_id)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating intake session: {e}")
            raise

    async def get_intake_session_admin(
        self, session_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get intake session by ID (admin only - no user_id check)."""
        try:
            response = (
                self.client.table("intake_sessions")
                .select("*, clients(id, full_name, email)")
                .eq("id", session_id)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error getting intake session: {e}")
            return None

    # Messages
    async def create_message(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new message."""
        try:
            response = self.client.table("messages").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            raise

    async def get_messages(
        self, session_id: str, skip: int = 0, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get messages for a session."""
        try:
            response = (
                self.client.table("messages")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at", desc=False)
                .range(skip, skip + limit - 1)
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return []

    async def get_intake_responses(
        self, session_id: str
    ) -> List[Dict[str, Any]]:
        """Get all intake responses/messages for a session (same as get_messages)."""
        try:
            response = (
                self.client.table("messages")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at", desc=False)
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting intake responses: {e}")
            return []

    # Files
    async def create_file_record(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a file record in database."""
        try:
            response = self.client.table("uploaded_files").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating file record: {e}")
            raise

    async def get_files(self, session_id: str) -> List[Dict[str, Any]]:
        """Get files for a session."""
        try:
            response = (
                self.client.table("uploaded_files")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at", desc=True)
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting files: {e}")
            return []

    async def get_file(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Get file by ID."""
        try:
            response = (
                self.client.table("uploaded_files")
                .select("*")
                .eq("id", file_id)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error getting file: {e}")
            return None


# Singleton instance
db = SupabaseDB()
