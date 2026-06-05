"""
Admin database operations for role-based access control.
Enhanced with comprehensive management features following best practices.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from app.db.supabase import db
import logging

logger = logging.getLogger(__name__)


class AdminOperations:
    """Database operations for admin functionality with comprehensive management."""

    @staticmethod
    async def get_user_role(user_id: UUID) -> Optional[str]:
        """Get user role from team_members table."""
        try:
            response = db.client.table("team_members").select("role").eq(
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
        return role == "admin"

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
            db.client.table("audit_log").insert({
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
            response = db.client.table("admin_notes").insert({
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
            response = db.client.table("admin_notes").select("*").eq(
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
            
            response = db.client.table("admin_notes").update(
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
            db.client.table("admin_notes").delete().eq(
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
            response = db.client.table("team_assignments").insert({
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
            response = db.client.table("team_members").select("*").eq(
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
            response = db.client.table("admin_settings").select(
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
            response = db.client.table("admin_settings").select(
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
            db.client.table("admin_settings").update({
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
            query = db.client.table("audit_log").select("*")
            
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
            sessions_response = db.client.table("intakes").select(
                "id", count="exact"
            ).execute()
            total_sessions = sessions_response.count or 0
            
            # Get completed sessions
            completed_response = db.client.table("intakes").select(
                "id", count="exact"
            ).eq("status", "completed").execute()
            completed_sessions = completed_response.count or 0
            
            # Get total clients
            clients_response = db.client.table("clients").select(
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
            start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            # Get recent sessions
            response = db.client.table("intakes").select(
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
            logger.error(f"Error getting activity report: {e}")
            return {}

    @staticmethod
    async def bulk_update_status(
        session_ids: List[str],
        status: str,
        user_id: UUID,
    ) -> Dict[str, Any]:
        """Bulk update status for multiple intakes."""
        try:
            results = {"updated": 0, "failed": 0, "errors": []}
            
            for session_id in session_ids:
                try:
                    update_data = {
                        "status": status,
                        "updated_at": datetime.utcnow().isoformat(),
                    }
                    
                    if status == "completed":
                        update_data["completed_at"] = datetime.utcnow().isoformat()
                    
                    response = db.client.table("intakes").update(
                        update_data
                    ).eq("id", session_id).execute()
                    
                    if response.data:
                        results["updated"] += 1
                        # Log each update
                        await AdminOperations.create_audit_log(
                            user_id=user_id,
                            action="BULK_UPDATE_STATUS",
                            resource_type="intake_session",
                            resource_id=UUID(session_id),
                            changes={"status": status}
                        )
                    else:
                        results["failed"] += 1
                        results["errors"].append(f"Session {session_id}: Not found")
                except Exception as e:
                    results["failed"] += 1
                    results["errors"].append(f"Session {session_id}: {str(e)}")
            
            return results
        except Exception as e:
            logger.error(f"Error in bulk status update: {e}")
            raise

    @staticmethod
    async def bulk_assign(
        session_ids: List[str],
        assigned_to_user_id: UUID,
        assigned_by_user_id: UUID,
    ) -> Dict[str, Any]:
        """Bulk assign multiple intakes to a team member."""
        try:
            results = {"assigned": 0, "failed": 0, "errors": []}
            
            for session_id in session_ids:
                try:
                    response = db.client.table("team_assignments").insert({
                        "session_id": session_id,
                        "assigned_to_user_id": str(assigned_to_user_id),
                        "assigned_by_user_id": str(assigned_by_user_id),
                        "assignment_status": "assigned",
                        "created_at": datetime.utcnow().isoformat(),
                    }).execute()
                    
                    if response.data:
                        results["assigned"] += 1
                        # Log each assignment
                        await AdminOperations.create_audit_log(
                            user_id=assigned_by_user_id,
                            action="BULK_ASSIGN",
                            resource_type="intake_session",
                            resource_id=UUID(session_id),
                            changes={"assigned_to": str(assigned_to_user_id)}
                        )
                    else:
                        results["failed"] += 1
                        results["errors"].append(f"Session {session_id}: Assignment failed")
                except Exception as e:
                    results["failed"] += 1
                    results["errors"].append(f"Session {session_id}: {str(e)}")
            
            return results
        except Exception as e:
            logger.error(f"Error in bulk assign: {e}")
            raise

    @staticmethod
    async def get_intake_metrics(
        days: int = 30,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get comprehensive intake metrics."""
        try:
            start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            # Build query
            query = db.client.table("intakes").select("*").gte(
                "created_at", start_date
            )
            
            if status:
                query = query.eq("status", status)
            
            response = query.execute()
            sessions = response.data or []
            
            # Calculate metrics
            total = len(sessions)
            completed = len([s for s in sessions if s.get("status") == "completed"])
            in_progress = len([s for s in sessions if s.get("status") == "in_progress"])
            archived = len([s for s in sessions if s.get("status") == "archived"])
            
            # Urgency breakdown
            urgencies = {}
            for session in sessions:
                urgency = session.get("urgency", "low")
                urgencies[urgency] = urgencies.get(urgency, 0) + 1
            
            # Average completion time
            completion_times = []
            for session in sessions:
                if session.get("status") == "completed":
                    created = datetime.fromisoformat(session["created_at"].replace("Z", "+00:00"))
                    completed_at = datetime.fromisoformat(session.get("completed_at", session["created_at"]).replace("Z", "+00:00"))
                    delta = (completed_at - created).total_seconds() / 3600  # Hours
                    completion_times.append(delta)
            
            avg_completion_time = sum(completion_times) / len(completion_times) if completion_times else 0
            
            return {
                "period_days": days,
                "total_intakes": total,
                "completed": completed,
                "in_progress": in_progress,
                "archived": archived,
                "completion_rate": (completed / total * 100) if total > 0 else 0,
                "average_completion_hours": round(avg_completion_time, 2),
                "by_urgency": urgencies,
            }
        except Exception as e:
            logger.error(f"Error getting metrics: {e}")
            raise

    @staticmethod
    async def get_team_workload() -> List[Dict[str, Any]]:
        """Get workload distribution across team members."""
        try:
            # Get all team members
            team_response = db.client.table("team_members").select(
                "id, user_id, role"
            ).eq("status", "active").execute()
            
            workload = []
            for member in team_response.data or []:
                user_id = member["user_id"]
                
                # Get assigned sessions
                assignments_response = db.client.table("team_assignments").select(
                    "id", count="exact"
                ).eq("assigned_to_user_id", user_id).eq(
                    "assignment_status", "assigned"
                ).execute()
                
                assigned_count = assignments_response.count or 0
                
                workload.append({
                    "user_id": user_id,
                    "role": member["role"],
                    "assigned_count": assigned_count,
                    "member_id": member["id"],
                })
            
            return sorted(workload, key=lambda x: x["assigned_count"], reverse=True)
        except Exception as e:
            logger.error(f"Error getting team workload: {e}")
            return []

    @staticmethod
    async def search_intakes(
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Advanced search for intakes across multiple fields."""
        try:
            # Start with all sessions
            response = db.client.table("intakes").select("*").limit(limit).execute()
            sessions = response.data or []
            
            # Apply text search
            query_lower = query.lower()
            results = []
            
            for session in sessions:
                # Check multiple fields
                match = False
                
                # Check client name and email from joined client table
                if session.get("clients"):
                    if isinstance(session["clients"], dict):
                        if query_lower in session["clients"].get("full_name", "").lower():
                            match = True
                        if query_lower in session["clients"].get("email", "").lower():
                            match = True
                
                # Check notes
                if query_lower in session.get("notes", "").lower():
                    match = True
                
                if match:
                    # Apply additional filters
                    if filters:
                        if filters.get("status") and session.get("status") != filters["status"]:
                            continue
                        if filters.get("urgency") and session.get("urgency") != filters["urgency"]:
                            continue
                    
                    results.append(session)
            
            return results
        except Exception as e:
            logger.error(f"Error searching intakes: {e}")
            return []

    @staticmethod
    async def export_intakes_data(
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Export intakes data for reporting."""
        try:
            # Get intakes from anonymous_intakes table
            query = db.client.table("anonymous_intakes").select("*")
            
            if filters:
                if filters.get("status"):
                    query = query.eq("status", filters["status"])
            
            response = query.order("created_at", desc=True).execute()
            
            export_data = []
            for intake in response.data or []:
                export_item = {
                    "id": intake.get("id"),
                    "client": intake.get("client_name", "N/A"),
                    "email": intake.get("client_email", "N/A"),
                    "status": intake.get("status"),
                    "created_at": intake.get("created_at"),
                    "updated_at": intake.get("updated_at"),
                }
                export_data.append(export_item)
            
            return export_data
        except Exception as e:
            logger.error(f"Error exporting intakes: {e}")
            return []

    @staticmethod
    async def get_intake_performance() -> Dict[str, Any]:
        """Get performance metrics for intake processing."""
        try:
            # Get last 90 days
            start_date = (datetime.utcnow() - timedelta(days=90)).isoformat()
            
            response = db.client.table("intakes").select(
                "created_at, completed_at, status"
            ).gte("created_at", start_date).execute()
            
            sessions = response.data or []
            
            # Calculate performance metrics
            total_processed = len([s for s in sessions if s.get("status") in ["completed", "archived"]])
            pending = len([s for s in sessions if s.get("status") == "in_progress"])
            
            completion_times = []
            for session in sessions:
                if session.get("status") == "completed" and session.get("completed_at"):
                    try:
                        created = datetime.fromisoformat(session["created_at"].replace("Z", "+00:00"))
                        completed = datetime.fromisoformat(session["completed_at"].replace("Z", "+00:00"))
                        hours = (completed - created).total_seconds() / 3600
                        completion_times.append(hours)
                    except:
                        pass
            
            return {
                "total_processed": total_processed,
                "pending": pending,
                "average_hours_to_complete": round(sum(completion_times) / len(completion_times), 2) if completion_times else 0,
                "min_hours": round(min(completion_times), 2) if completion_times else 0,
                "max_hours": round(max(completion_times), 2) if completion_times else 0,
                "total_analyzed": len(sessions),
            }
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return {}
