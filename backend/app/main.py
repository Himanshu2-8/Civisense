from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import init_db
from app.api.document import router as document_router
from app.api.analysis import router as analysis_router
from app.api.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist upon startup
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Legislative Consultation Analysis Platform API",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "running", "service": "civisense-backend"}


# Include API v1 Routers (/api/v1)
app.include_router(document_router, prefix=settings.API_PREFIX)
app.include_router(analysis_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)

# Also mount under /api for convenience
app.include_router(document_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
