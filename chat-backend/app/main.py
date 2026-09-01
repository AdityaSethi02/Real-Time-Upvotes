from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.api import admin, room, session, user
from app.limiter import limiter
from app.config import CORS_ORIGINS, DATABASE_URL
from app.database import SessionLocal, bootstrap_database, engine
from app.logging_config import setup_logging
from app.services.session_service import delete_expired_sessions
from app.websocket.handler import router as websocket_router

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if DATABASE_URL:
        bootstrap_database()
        db = SessionLocal()
        try:
            delete_expired_sessions(db)
        finally:
            db.close()
    yield


app = FastAPI(title="ChatBoard API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(room.router, prefix="/api/room", tags=["room"])
app.include_router(session.router, prefix="/api/session", tags=["session"])
app.include_router(websocket_router)


@app.get("/health")
def health_check():
    if not DATABASE_URL:
        return {"status": "error", "database": "not_configured"}

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as error:
        return {"status": "degraded", "database": "error", "details": str(error)}
