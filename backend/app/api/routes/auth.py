"""
Authentication routes for admin and user login.
Supports database-backed authentication via Supabase.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import logging
from datetime import datetime, timedelta
import jwt
from typing import Optional

from app.core.config import settings
from app.db.supabase import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    role: str





def _create_jwt_token(user_id: str, email: str, role: str, expires_in_hours: int = 24) -> str:
    """
    Create a JWT token for authentication.
    
    Tokens are signed with the Supabase JWT secret for consistency with database authentication.
    """
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=expires_in_hours),
        "iat": datetime.utcnow(),
    }
    
    # Use Supabase JWT secret for token signing
    secret = settings.SUPABASE_KEY or "your-secret-key"
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token


async def _get_user_role_from_db(user_id: str, email: str) -> str:
    """Get user role from database."""
    try:
        # Try to get from team_members table
        response = (
            db.client.table("team_members")
            .select("role")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        
        if response.data:
            return response.data.get("role", "client")
    except Exception as e:
        logger.debug(f"Error getting user role from DB: {e}")
    
    return "client"


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login endpoint for both admin and user authentication.
    
    Validates user credentials against the database.
    """
    email = request.email.lower()
    password = request.password
    
    logger.info(f"Login attempt for email: {email}")
    
    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required"
        )
    
    # Validate against database users
    # This requires a users table with hashed passwords in Supabase
    try:
        # Check if user exists in Supabase auth
        # The actual validation is handled by Supabase
        response = db.client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if response and response.user:
            # Get user role from database
            user_id = response.user.id
            role = await _get_user_role_from_db(user_id, email)
            
            # Create our own JWT token for consistent response format
            token = _create_jwt_token(
                user_id=user_id,
                email=email,
                role=role
            )
            
            logger.info(f"User login successful: {email}")
            return AuthResponse(
                access_token=token,
                token_type="bearer",
                user_id=user_id,
                email=email,
                role=role
            )
    except Exception as e:
        logger.warning(f"Login failed for {email}: {str(e)}")
    
    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )


@router.post("/verify-token")
async def verify_token(authorization: Optional[str] = None):
    """
    Verify if a JWT token is valid.
    
    Returns user info if valid, raises 401 if invalid.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="No authorization token provided"
        )
    
    try:
        # Extract token from "Bearer <token>"
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = parts[1]
        secret = settings.SUPABASE_KEY or "your-secret-key"
        
        # Decode and verify token
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        
        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role"),
            "valid": True
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Unexpected error verifying token: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")
