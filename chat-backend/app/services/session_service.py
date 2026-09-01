import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import SESSION_TOKEN_TTL_HOURS
from app.models import SessionToken

logger = logging.getLogger(__name__)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def create_session(db: Session, user_id: str, room_id: str, role: str) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = _utcnow() + timedelta(hours=SESSION_TOKEN_TTL_HOURS)
    db.add(
        SessionToken(
            token=token,
            userId=user_id,
            roomId=room_id,
            role=role,
            expiresAt=expires_at,
        )
    )
    db.flush()
    return token


def validate_session(db: Session, token: str, user_id: str, room_id: str) -> SessionToken | None:
    session = db.query(SessionToken).filter(SessionToken.token == token).first()
    if not session:
        return None
    if session.expiresAt < _utcnow():
        db.delete(session)
        db.commit()
        logger.info("Expired session removed for userId=%s roomId=%s", user_id, room_id)
        return None
    if session.userId != user_id or session.roomId != room_id:
        return None
    return session


def validate_session_token(db: Session, token: str) -> SessionToken | None:
    session = db.query(SessionToken).filter(SessionToken.token == token).first()
    if not session:
        return None
    if session.expiresAt < _utcnow():
        db.delete(session)
        db.commit()
        return None
    return session


def refresh_session(db: Session, token: str) -> SessionToken | None:
    session = validate_session_token(db, token)
    if not session:
        return None

    db.delete(session)
    new_token = create_session(db, session.userId, session.roomId, session.role)
    db.flush()

    new_session = db.query(SessionToken).filter(SessionToken.token == new_token).first()
    logger.info("Session refreshed for userId=%s roomId=%s", session.userId, session.roomId)
    return new_session


def logout_session(db: Session, token: str) -> bool:
    session = db.query(SessionToken).filter(SessionToken.token == token).first()
    if not session:
        return False
    db.delete(session)
    db.commit()
    logger.info("Session logged out for userId=%s roomId=%s", session.userId, session.roomId)
    return True


def delete_expired_sessions(db: Session) -> int:
    now = _utcnow()
    expired = db.query(SessionToken).filter(SessionToken.expiresAt < now).all()
    count = len(expired)
    for session in expired:
        db.delete(session)
    if count:
        db.commit()
        logger.info("Deleted %d expired session tokens", count)
    return count
