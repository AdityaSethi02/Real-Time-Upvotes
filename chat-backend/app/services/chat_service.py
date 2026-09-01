from dataclasses import dataclass
from enum import Enum

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.config import CHAT_HISTORY_PAGE_SIZE, MAX_MESSAGE_LENGTH
from app.models import Admin, Chat, Room, Upvote, User


@dataclass
class ChatDTO:
    chat_id: str
    message: str
    name: str
    upvotes: int
    upvoted_by_me: bool = False


class UpvoteError(str, Enum):
    ALREADY_UPVOTED = "ALREADY_UPVOTED"
    CHAT_NOT_FOUND = "CHAT_NOT_FOUND"
    USER_NOT_IN_ROOM = "USER_NOT_IN_ROOM"


def get_room(db: Session, room_id: str) -> Room | None:
    return db.query(Room).filter(Room.roomId == room_id).first()


def get_room_admin(db: Session, room_id: str) -> Admin | None:
    return db.query(Admin).filter(Admin.roomId == room_id).first()


def is_room_admin(db: Session, room_id: str, user_id: str) -> bool:
    admin = get_room_admin(db, room_id)
    return admin is not None and admin.adminId == user_id


def get_chats(db: Session, room_id: str, viewer_user_id: str, limit: int = 100) -> list[ChatDTO]:
    chats, _ = get_chats_page(db, room_id, viewer_user_id, limit=limit)
    return chats


def _chat_to_dto(chat: Chat, viewer_user_id: str) -> ChatDTO:
    return ChatDTO(
        chat_id=chat.chatId,
        message=chat.content,
        name=chat.user.userName,
        upvotes=len(chat.upvotes),
        upvoted_by_me=any(v.userId == viewer_user_id for v in chat.upvotes),
    )


def get_chats_page(
    db: Session,
    room_id: str,
    viewer_user_id: str,
    limit: int | None = None,
    before_chat_id: str | None = None,
) -> tuple[list[ChatDTO], bool]:
    page_size = limit or CHAT_HISTORY_PAGE_SIZE
    query = (
        db.query(Chat)
        .options(joinedload(Chat.upvotes), joinedload(Chat.user))
        .filter(Chat.roomId == room_id)
    )

    if before_chat_id:
        before_chat = (
            db.query(Chat)
            .filter(Chat.chatId == before_chat_id, Chat.roomId == room_id)
            .first()
        )
        if not before_chat:
            return [], False
        query = query.filter(Chat.createdAt < before_chat.createdAt)

    chats = query.order_by(Chat.createdAt.desc()).limit(page_size + 1).all()
    has_more = len(chats) > page_size
    if has_more:
        chats = chats[:page_size]
    chats.reverse()

    return [_chat_to_dto(chat, viewer_user_id) for chat in chats], has_more


def _user_in_room(db: Session, user_id: str, room_id: str) -> User | None:
    user = db.query(User).filter(User.userId == user_id).first()
    if not user or user.roomId != room_id:
        return None
    return user


def add_chat(
    db: Session,
    user_id: str,
    name: str,
    room_id: str,
    message: str,
) -> ChatDTO | None:
    message = message.strip()
    if not message or len(message) > MAX_MESSAGE_LENGTH:
        return None

    room = get_room(db, room_id)
    if not room:
        return None

    admin = get_room_admin(db, room_id)
    if not admin:
        return None

    user = _user_in_room(db, user_id, room_id)
    if not user:
        return None

    chat = Chat(
        content=message,
        userId=user_id,
        adminId=admin.adminId,
        roomId=room_id,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)

    return ChatDTO(
        chat_id=chat.chatId,
        message=chat.content,
        name=name,
        upvotes=0,
        upvoted_by_me=False,
    )


def upvote_chat(
    db: Session, user_id: str, room_id: str, chat_id: str
) -> tuple[ChatDTO | None, UpvoteError | None]:
    user = _user_in_room(db, user_id, room_id)
    if not user:
        return None, UpvoteError.USER_NOT_IN_ROOM

    chat = (
        db.query(Chat)
        .options(joinedload(Chat.upvotes), joinedload(Chat.user))
        .filter(Chat.chatId == chat_id, Chat.roomId == room_id)
        .first()
    )
    if not chat:
        return None, UpvoteError.CHAT_NOT_FOUND

    existing = (
        db.query(Upvote)
        .filter(Upvote.chatId == chat_id, Upvote.userId == user_id)
        .first()
    )
    if existing:
        return None, UpvoteError.ALREADY_UPVOTED

    try:
        db.add(Upvote(chatId=chat_id, userId=user_id))
        db.commit()
    except IntegrityError:
        db.rollback()
        return None, UpvoteError.ALREADY_UPVOTED

    vote_count = db.query(Upvote).filter(Upvote.chatId == chat_id).count()

    return ChatDTO(
        chat_id=chat.chatId,
        message=chat.content,
        name=chat.user.userName,
        upvotes=vote_count,
        upvoted_by_me=True,
    ), None


def dismiss_chat(db: Session, room_id: str, chat_id: str, user_id: str) -> bool:
    if not is_room_admin(db, room_id, user_id):
        return False

    chat = (
        db.query(Chat)
        .filter(Chat.chatId == chat_id, Chat.roomId == room_id)
        .first()
    )
    if not chat:
        return False

    db.delete(chat)
    db.commit()
    return True
