from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Room
from app.schemas import RoomDetailsResponse

router = APIRouter()


@router.get("")
def get_room(roomId: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.roomId == roomId).first()

    if not room:
        raise HTTPException(status_code=404, detail={"error": "Room not found"})

    return RoomDetailsResponse.model_validate(room)
