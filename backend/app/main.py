"""
FastAPI main application.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import json

from app.core.config import settings
from app.services.ollama_service import close_ollama_service
from app.api.routes import messages, intake as public_intake
from app.api.routes.client import intake, files, profile, dashboard
from app.api.routes.admin import (
    clients as admin_clients,
    intake as admin_intake,
    anonymous_intakes as admin_anonymous_intakes,
    summary as admin_summary,
    notes as admin_notes,
    team as admin_team,
    reports as admin_reports,
    settings as admin_settings,
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
# Shared routes
app.include_router(messages.router, prefix=settings.API_PREFIX, tags=["messages"])
app.include_router(public_intake.router, prefix=settings.API_PREFIX, tags=["public-intake"])

# Client routes
app.include_router(intake.router, prefix=f"{settings.API_PREFIX}/client", tags=["client-intake"])
app.include_router(files.router, prefix=f"{settings.API_PREFIX}/client", tags=["client-files"])
app.include_router(profile.router, prefix=f"{settings.API_PREFIX}/client", tags=["client-profile"])
app.include_router(dashboard.router, prefix=f"{settings.API_PREFIX}/client", tags=["client-dashboard"])

# Admin routes
app.include_router(admin_clients.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-clients"])
app.include_router(admin_intake.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-intake"])
app.include_router(admin_anonymous_intakes.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-anonymous-intakes"])
app.include_router(admin_summary.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-summary"])
app.include_router(admin_notes.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-notes"])
app.include_router(admin_team.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-team"])
app.include_router(admin_reports.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-reports"])
app.include_router(admin_settings.router, prefix=f"{settings.API_PREFIX}/admin", tags=["admin-settings"])


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
