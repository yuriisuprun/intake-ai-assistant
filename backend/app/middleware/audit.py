"""
Audit logging middleware.
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging
import time
import json
from datetime import datetime

logger = logging.getLogger(__name__)


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all API requests and responses for audit purposes."""

    async def dispatch(self, request: Request, call_next) -> Response:
        """Log request and response details."""
        # Extract request information
        request_id = request.headers.get("x-request-id", "unknown")
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params)
        
        # Get user ID from headers if available
        user_id = "anonymous"
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            # In a real implementation, you would decode the JWT here
            user_id = "authenticated_user"
        
        # Record request start time
        start_time = time.time()
        
        # Call the next middleware/route
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            status_code = 500
            raise
        
        # Calculate request duration
        duration = time.time() - start_time
        
        # Log audit information
        audit_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id,
            "user_id": user_id,
            "method": method,
            "path": path,
            "query_params": query_params,
            "status_code": status_code,
            "duration_ms": round(duration * 1000, 2),
            "client_ip": request.client.host if request.client else "unknown",
        }
        
        # Log based on status code
        if status_code >= 400:
            logger.warning(f"Audit: {json.dumps(audit_log)}")
        else:
            logger.info(f"Audit: {json.dumps(audit_log)}")
        
        return response


async def log_action(
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    details: dict = None,
):
    """
    Log an action for audit purposes.
    
    Args:
        user_id: ID of the user performing the action
        action: Type of action (create, read, update, delete)
        resource_type: Type of resource being acted upon
        resource_id: ID of the resource
        details: Additional details about the action
    """
    audit_log = {
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details or {},
    }
    
    logger.info(f"Action: {json.dumps(audit_log)}")
