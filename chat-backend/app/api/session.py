import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.schemas import SessionDetailResponse, SessionTokenRequest
from app.services.session_service import logout_session, refresh_session

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/refresh")
@limiter.limit("30/minute")
def refresh(
    request: Request,
    body: SessionTokenRequest,
    db: Session = Depends(get_db),
):
    session = refresh_session(db, body.sessionToken)
    if not session:
        raise HTTPException(status_code=401, detail={"error": "Invalid or expired session"})

    db.commit()
    return SessionDetailResponse(
        sessionToken=session.token,
        role=session.role,
        userId=session.userId,
        roomId=session.roomId,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def logout(
    request: Request,
    body: SessionTokenRequest,
    db: Session = Depends(get_db),
):
    logout_session(db, body.sessionToken)
    db.commit()
