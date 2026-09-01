import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models import Admin, Room, User
from app.schemas import (
    AdminResponse,
    AdminSummaryResponse,
    CreateAdminAndRoomRequest,
    CreateAdminAndRoomResponse,
    RoomResponse,
    SessionResponse,
    parse_cooldown,
)
from app.services.session_service import create_session

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("")
@limiter.limit("10/minute")
def create_admin_and_room(
    request: Request,
    body: CreateAdminAndRoomRequest,
    db: Session = Depends(get_db),
):
    try:
        room = Room(
            roomName=body.roomName.strip(),
            chatCoolDown=parse_cooldown(body.chatCoolDown),
            upvoteCoolDown=parse_cooldown(body.upvoteCoolDown),
            mediumVoteThreshold=body.mediumVoteThreshold,
            hotVoteThreshold=body.hotVoteThreshold,
        )
        db.add(room)
        db.flush()

        admin_id = str(uuid.uuid4())
        admin = Admin(
            adminName=body.adminName.strip(),
            adminId=admin_id,
            roomId=room.roomId,
        )
        db.add(admin)

        db.add(
            User(
                userId=admin_id,
                userName=body.adminName.strip(),
                roomId=room.roomId,
            )
        )

        token = create_session(db, admin_id, room.roomId, "admin")
        db.commit()
        db.refresh(room)
        db.refresh(admin)

        logger.info("Room created roomId=%s adminId=%s", room.roomId, admin_id)

        return CreateAdminAndRoomResponse(
            admin=AdminResponse.model_validate(admin),
            room=RoomResponse.model_validate(room),
            session=SessionResponse(sessionToken=token, role="admin"),
        )
    except Exception as error:
        db.rollback()
        logger.exception("Failed to create room")
        raise HTTPException(
            status_code=500,
            detail={"error": "Error creating admin and room", "details": str(error)},
        )


@router.get("")
def get_admin(roomId: str, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.roomId == roomId).first()

    if not admin:
        raise HTTPException(status_code=404, detail={"error": "Room not found, create room first"})

    return AdminSummaryResponse.model_validate(admin)
