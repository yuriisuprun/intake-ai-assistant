"""
API dependencies and middleware.
"""

from fastapi import Depends, HTTPException, Header
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Get current user from JWT token.
    
    In production, this would validate the JWT token from Supabase Auth.
    For MVP, we'll use a simple header-based approach.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")

        # In production, validate JWT token with Supabase
        # For MVP, we'll just extract user_id from token
        # This is a simplified approach - use proper JWT validation in production
        
        # For now, we'll use the token as the user_id
        # In production: decode JWT and extract user_id
        user_id = token  # Placeholder

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user_id

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    except Exception as e:
        logger.error(f"Error validating token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
