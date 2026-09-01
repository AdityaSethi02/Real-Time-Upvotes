import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from app.limiter import limiter

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Room, User
from app.schemas import JoinRoomRequest, JoinRoomResponse, RoomResponse, SessionResponse, UserResponse
from app.services.session_service import create_session

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("")
@limiter.limit("20/minute")
def join_room(
    request: Request,
    body: JoinRoomRequest,
    db: Session = Depends(get_db),
):
    try:
        room = db.query(Room).filter(Room.roomId == body.roomId).first()

        if not room:
            raise HTTPException(status_code=404, detail={"error": "Room does not exist"})

        user = User(userName=body.userName.strip(), roomId=body.roomId)
        db.add(user)
        db.flush()

        token = create_session(db, user.userId, body.roomId, "user")
        db.commit()
        db.refresh(user)

        logger.info("User joined room roomId=%s userId=%s", body.roomId, user.userId)

        return JoinRoomResponse(
            user=UserResponse.model_validate(user),
            room=RoomResponse.model_validate(room),
            session=SessionResponse(sessionToken=token, role="user"),
        )
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        logger.exception("Failed to join room")
        raise HTTPException(status_code=500, detail={"error": "Error joining room"})
