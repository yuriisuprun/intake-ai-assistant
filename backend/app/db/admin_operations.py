"""
Admin database operations for role-based access control.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.db.supabase import supabase_client
from app.models.schemas import APIResponse


class AdminOperations:
    """Database operations for admin functionality."""

    @staticmethod
    async def get_user_role(user_id: UUID) -> Optional[str]:
        """Get user role from team_members table."""
        try:
            response = supabase_client.table("team_members").select("role").eq(
                "user_id", str(user_id)
            ).eq("status", "active").single().execute()
            
            if response.data:
                return response.data.get("role")
            return None
        except Exception as e:
            print(f"Error getting user role: {e}")
            return None

    @staticmethod
    async def is_admin(user_id: UUID) -> bool:
        """Check if user is an admin."""
        role = await AdminOperations.get_user_role(user_id)
        return role in ["admin", "lawyer", "manager"]

    @staticmethod
    async def create_audit_log(
        user_id: UUID,
        action: str,
        resource_type: str,
        resource_id: Optional[UUID] = None,
        endpoint: Optional[str] = None,
        status_code: Optional[int] = None,
        changes: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> bool:
        """Create an audit log entry."""
        try:
            supabase_client.table("audit_log").insert({
                "user_id": str(user_id),
                "action": action,
                "resource_type": resource_type,
                "resource_id": str(resource_id) if resource_id else None,
                "endpoint": endpoint,
                "status_code": status_code,
                "changes": changes,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "created_at": datetime.utcnow().isoformat(),
            }).execute()
            return True
        except Exception as e:
            print(f"Error creating audit log: {e}")
            return False

    @staticmethod
    async def create_note(
        session_id: UUID,
        admin_id: UUID,
        note_text: str,
        note_type: str = "general",
    ) -> Optional[Dict[str, Any]]:
        """Create a note for a session."""
        try:
            response = supabase_client.table("admin_notes").insert({
                "session_id": str(session_id),
                "admin_id": str(admin_id),
                "note_text": note_text,
                "note_type": note_type,
                "created_at": datetime.utcnow().isoformat(),
            }).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error creating note: {e}")
            return None

    @staticmethod
    async def get_notes(session_id: UUID) -> List[Dict[str, Any]]:
        """Get all notes for a session."""
        try:
            response = supabase_client.table("admin_notes").select("*").eq(
                "session_id", str(session_id)
            ).order("created_at", desc=True).execute()
            
            return response.data or []
        except Exception as e:
            print(f"Error getting notes: {e}")
            return []

    @staticmethod
    async def update_note(
        note_id: UUID,
        note_text: str,
        note_type: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Update a note."""
        try:
            update_data = {
                "note_text": note_text,
                "updated_at": datetime.utcnow().isoformat(),
            }
            if note_type:
                update_data["note_type"] = note_type
            
            response = supabase_client.table("admin_notes").update(
                update_data
            ).eq("id", str(note_id)).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error updating note: {e}")
            return None

    @staticmethod
    async def delete_note(note_id: UUID) -> bool:
        """Delete a note."""
        try:
            supabase_client.table("admin_notes").delete().eq(
                "id", str(note_id)
            ).execute()
            return True
        except Exception as e:
            print(f"Error deleting note: {e}")
            return False

    @staticmethod
    async def assign_session(
        session_id: UUID,
        assigned_to_user_id: UUID,
        assigned_by_user_id: UUID,
    ) -> Optional[Dict[str, Any]]:
        """Assign a session to a team member."""
        try:
            response = supabase_client.table("team_assignments").insert({
                "session_id": str(session_id),
                "assigned_to_user_id": str(assigned_to_user_id),
                "assigned_by_user_id": str(assigned_by_user_id),
                "assignment_status": "assigned",
                "created_at": datetime.utcnow().isoformat(),
            }).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error assigning session: {e}")
            return None

    @staticmethod
    async def get_team_members() -> List[Dict[str, Any]]:
        """Get all active team members."""
        try:
            response = supabase_client.table("team_members").select("*").eq(
                "status", "active"
            ).execute()
            
            return response.data or []
        except Exception as e:
            print(f"Error getting team members: {e}")
            return []

    @staticmethod
    async def get_setting(setting_key: str) -> Optional[str]:
        """Get a specific setting."""
        try:
            response = supabase_client.table("admin_settings").select(
                "setting_value"
            ).eq("setting_key", setting_key).single().execute()
            
            if response.data:
                return response.data.get("setting_value")
            return None
        except Exception as e:
            print(f"Error getting setting: {e}")
            return None

    @staticmethod
    async def get_all_settings() -> Dict[str, str]:
        """Get all settings."""
        try:
            response = supabase_client.table("admin_settings").select(
                "setting_key, setting_value"
            ).execute()
            
            settings = {}
            for item in response.data or []:
                settings[item["setting_key"]] = item["setting_value"]
            return settings
        except Exception as e:
            print(f"Error getting settings: {e}")
            return {}

    @staticmethod
    async def update_setting(setting_key: str, setting_value: str) -> bool:
        """Update a setting."""
        try:
            supabase_client.table("admin_settings").update({
                "setting_value": setting_value,
                "updated_at": datetime.utcnow().isoformat(),
            }).eq("setting_key", setting_key).execute()
            return True
        except Exception as e:
            print(f"Error updating setting: {e}")
            return False

    @staticmethod
    async def get_audit_logs(
        user_id: Optional[UUID] = None,
        resource_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Get audit logs with optional filtering."""
        try:
            query = supabase_client.table("audit_log").select("*")
            
            if user_id:
                query = query.eq("user_id", str(user_id))
            if resource_type:
                query = query.eq("resource_type", resource_type)
            
            response = query.order("created_at", desc=True).range(
                offset, offset + limit - 1
            ).execute()
            
            return response.data or []
        except Exception as e:
            print(f"Error getting audit logs: {e}")
            return []

    @staticmethod
    async def get_overview_report() -> Dict[str, Any]:
        """Get overview report with statistics."""
        try:
            # Get total sessions
            sessions_response = supabase_client.table("intake_sessions").select(
                "id", count="exact"
            ).execute()
            total_sessions = sessions_response.count or 0
            
            # Get completed sessions
            completed_response = supabase_client.table("intake_sessions").select(
                "id", count="exact"
            ).eq("status", "completed").execute()
            completed_sessions = completed_response.count or 0
            
            # Get total clients
            clients_response = supabase_client.table("clients").select(
                "id", count="exact"
            ).execute()
            total_clients = clients_response.count or 0
            
            return {
                "total_sessions": total_sessions,
                "completed_sessions": completed_sessions,
                "in_progress_sessions": total_sessions - completed_sessions,
                "total_clients": total_clients,
                "completion_rate": (
                    (completed_sessions / total_sessions * 100)
                    if total_sessions > 0
                    else 0
                ),
            }
        except Exception as e:
            print(f"Error getting overview report: {e}")
            return {}

    @staticmethod
    async def get_activity_report(days: int = 7) -> Dict[str, Any]:
        """Get activity report for the last N days."""
        try:
            from datetime import timedelta
            
            start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            # Get recent sessions
            response = supabase_client.table("intake_sessions").select(
                "id, created_at, status"
            ).gte("created_at", start_date).execute()
            
            sessions_by_day = {}
            for session in response.data or []:
                date = session["created_at"].split("T")[0]
                if date not in sessions_by_day:
                    sessions_by_day[date] = {"total": 0, "completed": 0}
                sessions_by_day[date]["total"] += 1
                if session["status"] == "completed":
                    sessions_by_day[date]["completed"] += 1
            
            return {"sessions_by_day": sessions_by_day}
        except Exception as e:
            print(f"Error getting activity report: {e}")
            return {}
