"""
FastAPI Backend for AI Customer Support Platform
Enterprise-grade API with comprehensive error handling and monitoring
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
import json

from app.api import chat, harassment, analytics, conversations
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# Application Lifespan
// ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 Starting AI Customer Support Platform API")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Version: {settings.VERSION}")
    
    # Startup: Initialize connections, load models, etc.
    # await init_database()
    # await load_ml_models()
    
    yield
    
    # Shutdown: Cleanup
    logger.info("👋 Shutting down AI Customer Support Platform API")
    # await cleanup_resources()

# ============================================================================
# FastAPI Application
// ============================================================================

app = FastAPI(
    title="AI Customer Support Platform API",
    description="""
    Enterprise-grade customer support platform with AI-powered features:
    
    - **RAG-based FAQ Chatbot**: Intelligent responses using semantic search
    - **Harassment Detection**: Real-time customer harassment monitoring
    - **Sentiment Analysis**: Emotion tracking and analytics
    - **Conversation Management**: Full CRUD operations for conversations
    - **Analytics Dashboard**: Real-time metrics and insights
    
    Built with FastAPI, Supabase, OpenAI, and love 💙
    """,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

// ============================================================================
// Middleware Configuration
// ============================================================================

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
// Health Check Endpoints
// ============================================================================

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API information"""
    return {
        "name": "AI Customer Support Platform API",
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
    }

// ============================================================================
// API Routers
// ============================================================================

# Chat & AI Features
app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["Chat"]
)

# Harassment Detection
app.include_router(
    harassment.router,
    prefix="/api/v1/harassment",
    tags=["Harassment Detection"]
)

# Analytics
app.include_router(
    analytics.router,
    prefix="/api/v1/analytics",
    tags=["Analytics"]
)

# Conversations
app.include_router(
    conversations.router,
    prefix="/api/v1/conversations",
    tags=["Conversations"]
)

// ============================================================================
// Error Handlers
// ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP error: {exc.status_code} - {exc.detail}")
    return {
        "success": False,
        "error": {
            "code": f"HTTP_{exc.status_code}",
            "message": exc.detail,
        }
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return {
        "success": False,
        "error": {
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
        }
    }

// ============================================================================
// Run Application
// ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
