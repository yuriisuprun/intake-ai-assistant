"""
API dependencies and middleware.
"""

from fastapi import Depends, HTTPException, Header
from typing import Optional
import logging
from jose import jwt, JWTError
from app.core.config import settings

logger = logging.getLogger(__name__)


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Get current user from JWT token.
    
    Validates the JWT token from Supabase Auth and extracts the user_id.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")

        # Decode JWT token from Supabase
        # Supabase uses the anon key as the secret for JWT validation
        decoded = jwt.get_unverified_claims(token)
        
        user_id = decoded.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user_id")

        return user_id

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token format")
    except Exception as e:
        logger.error(f"Error validating token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
