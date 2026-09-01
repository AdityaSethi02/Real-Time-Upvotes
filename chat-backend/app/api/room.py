from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models import Room
from app.schemas import RoomDetailsRequest, RoomDetailsResponse
from app.services.session_service import validate_session_token

router = APIRouter()


@router.post("/details")
@limiter.limit("60/minute")
def get_room_details(
    request: Request,
    body: RoomDetailsRequest,
    db: Session = Depends(get_db),
):
    session = validate_session_token(db, body.sessionToken)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Invalid or expired session"},
        )

    if session.roomId != body.roomId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Session does not match this room"},
        )

    room = db.query(Room).filter(Room.roomId == body.roomId).first()
    if not room:
        raise HTTPException(status_code=404, detail={"error": "Room not found"})

    return RoomDetailsResponse.model_validate(room)
