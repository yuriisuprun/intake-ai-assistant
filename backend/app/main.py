"""
FastAPI main application.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging
import json

from app.core.config import settings
from app.services.ollama_service import close_ollama_service
from app.api.routes import messages, intake as public_intake, auth
from app.api.routes.client import intake, files, profile, dashboard
from app.api.routes.admin import (
    clients as admin_clients,
    intakes as admin_intakes,
    intake_management as admin_intake_management,
    summary as admin_summary,
    notes as admin_notes,
    dashboard as admin_dashboard,
)
from app.middleware.audit import AuditLoggingMiddleware

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    logger.info("Application startup")
    yield
    logger.info("Application shutdown")
    await close_ollama_service()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# Add middleware
app.add_middleware(AuditLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    logger.error(f"Validation error on {request.url.path}: {exc.errors()}")
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"][1:]),
            "message": error["msg"],
            "type": error["type"],
        })
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "validation_error",
            "message": "Request validation failed",
            "details": errors,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "internal_server_error",
            "message": "An unexpected error occurred",
        },
    )


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": settings.APP_VERSION}


# Include routers
# Authentication
app.include_router(auth.router, tags=["auth"])

# Shared routes
app.include_router(messages.router, prefix=settings.API_PREFIX, tags=["messages"])
app.include_router(public_intake.router, prefix=settings.API_PREFIX, tags=["public-intake"])
app.include_router(files.router, prefix=settings.API_PREFIX, tags=["public-files"])

# Client routes
app.include_router(intake.router, prefix=f"{settings.API_PREFIX}/client", tags=["client-intake"])
app.include_router(files.router, prefix=f"{settings.API_PREFIX}/client", tags=["client-files"])
app.include_router(profile.router, prefix=f"{settings.API_PREFIX}/client", tags=["client-profile"])
app.include_router(dashboard.router, prefix=f"{settings.API_PREFIX}/client", tags=["client-dashboard"])

# Admin routes
app.include_router(admin_clients.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-clients"])
app.include_router(admin_intakes.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-intakes"])
app.include_router(admin_intake_management.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-intake-management"])
app.include_router(admin_summary.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-summary"])
app.include_router(admin_notes.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-notes"])
app.include_router(admin_dashboard.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-dashboard"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
