import json
import logging
import time
from collections import deque

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.config import WS_RATE_LIMIT_PER_MINUTE
from app.database import SessionLocal
from app.services.chat_service import (
    UpvoteError,
    add_chat,
    dismiss_chat,
    get_chats_page,
    get_room,
    upvote_chat,
)
from app.services.session_service import validate_session
from app.websocket.manager import UserManager
from app.websocket.messages import IncomingMessageType, OutgoingMessageType
from app.websocket.schemas import (
    DismissChatPayload,
    JoinRoomPayload,
    LoadMoreHistoryPayload,
    SendMessagePayload,
    UpvoteMessagePayload,
)

router = APIRouter()
logger = logging.getLogger(__name__)

user_manager = UserManager()


async def send_error(
    websocket: WebSocket,
    code: str,
    message: str,
    remaining_seconds: int | None = None,
    extra: dict | None = None,
) -> None:
    payload: dict = {"code": code, "message": message}
    if remaining_seconds is not None:
        payload["remainingSeconds"] = remaining_seconds
    if extra:
        payload.update(extra)
    await websocket.send_json(
        {
            "type": OutgoingMessageType.ERROR,
            "payload": payload,
        }
    )


def check_ws_rate_limit(timestamps: deque[float]) -> bool:
    now = time.time()
    while timestamps and now - timestamps[0] > 60:
        timestamps.popleft()
    if len(timestamps) >= WS_RATE_LIMIT_PER_MINUTE:
        return False
    timestamps.append(now)
    return True


def _serialize_chats(chats: list) -> list[dict]:
    return [
        {
            "chatId": chat.chat_id,
            "message": chat.message,
            "name": chat.name,
            "upVotes": chat.upvotes,
            "upvotedByMe": chat.upvoted_by_me,
        }
        for chat in chats
    ]


async def send_chat_history(
    websocket: WebSocket,
    room_id: str,
    chats: list,
    has_more: bool,
    append: bool = False,
) -> None:
    await websocket.send_json(
        {
            "type": OutgoingMessageType.CHAT_HISTORY,
            "payload": {
                "roomId": room_id,
                "chats": _serialize_chats(chats),
                "hasMore": has_more,
                "append": append,
            },
        }
    )


async def handle_message(
    websocket: WebSocket,
    message: dict,
    rate_timestamps: deque[float],
) -> None:
    msg_type = message.get("type")
    payload = message.get("payload", {})

    if msg_type == IncomingMessageType.JOIN_ROOM:
        if not check_ws_rate_limit(rate_timestamps):
            await send_error(websocket, "RATE_LIMITED", "Too many messages. Slow down.")
            return

        try:
            data = JoinRoomPayload.model_validate(payload)
        except ValidationError:
            await send_error(websocket, "INVALID_PAYLOAD", "Invalid join payload")
            return

        db = SessionLocal()
        try:
            session = validate_session(db, data.sessionToken, data.userId, data.roomId)
            if not session:
                await send_error(websocket, "INVALID_SESSION", "Invalid or expired session")
                return

            room = get_room(db, data.roomId)
            if not room:
                await send_error(websocket, "ROOM_NOT_FOUND", "Room not found")
                return

            await user_manager.add_user(
                name=data.name,
                user_id=data.userId,
                room_id=data.roomId,
                socket=websocket,
                role=session.role,
                chat_cooldown=room.chatCoolDown,
                upvote_cooldown=room.upvoteCoolDown,
            )

            history, has_more = get_chats_page(db, data.roomId, data.userId)
            await send_chat_history(websocket, data.roomId, history, has_more, append=False)
            logger.info("User joined WS roomId=%s userId=%s", data.roomId, data.userId)
        finally:
            db.close()
        return

    user = user_manager.get_user_for_socket(websocket)
    if not user:
        await send_error(websocket, "NOT_JOINED", "Join the room before sending messages")
        return

    bound_identity = user_manager.get_bound_identity(websocket)
    bound_room_id = bound_identity[0] if bound_identity else None
    bound_user_id = bound_identity[1] if bound_identity else None

    payload_room = payload.get("roomId")
    payload_user = payload.get("userId")
    if payload_room and payload_room != bound_room_id:
        await send_error(websocket, "FORBIDDEN", "Room ID does not match your session")
        return
    if payload_user and payload_user != bound_user_id:
        await send_error(websocket, "FORBIDDEN", "User ID does not match your session")
        return

    if not check_ws_rate_limit(rate_timestamps):
        await send_error(websocket, "RATE_LIMITED", "Too many messages. Slow down.")
        return

    room_id = bound_room_id
    user_id = bound_user_id

    db = SessionLocal()
    try:
        if msg_type == IncomingMessageType.SEND_MESSAGE:
            try:
                data = SendMessagePayload.model_validate(payload)
            except ValidationError:
                await send_error(websocket, "INVALID_PAYLOAD", "Invalid message payload")
                return

            allowed, remaining = user_manager.can_send_message(user)
            if not allowed:
                await send_error(
                    websocket,
                    "CHAT_COOLDOWN",
                    f"Chat cooldown active. Wait {remaining}s",
                    remaining_seconds=remaining,
                )
                return

            chat = add_chat(db, user_id, user.name, room_id, data.message)
            if not chat:
                await send_error(websocket, "SEND_FAILED", "Could not send message")
                return

            user_manager.mark_message_sent(user)

            await user_manager.broadcast_to_room(
                room_id,
                {
                    "type": OutgoingMessageType.ADD_CHAT,
                    "payload": {
                        "chatId": chat.chat_id,
                        "roomId": room_id,
                        "message": chat.message,
                        "name": chat.name,
                        "userId": user_id,
                        "upVotes": 0,
                    },
                },
            )

        elif msg_type == IncomingMessageType.UPVOTE_MESSAGE:
            try:
                data = UpvoteMessagePayload.model_validate(payload)
            except ValidationError:
                await send_error(websocket, "INVALID_PAYLOAD", "Invalid upvote payload")
                return

            allowed, remaining = user_manager.can_upvote(user, data.chatId)
            if not allowed:
                await send_error(
                    websocket,
                    "UPVOTE_COOLDOWN",
                    f"Upvote cooldown active. Wait {remaining}s",
                    remaining_seconds=remaining,
                    extra={"chatId": data.chatId},
                )
                return

            chat, error = upvote_chat(db, user_id, room_id, data.chatId)
            if error == UpvoteError.ALREADY_UPVOTED:
                await send_error(
                    websocket,
                    "ALREADY_UPVOTED",
                    "You have already upvoted this message",
                    extra={"chatId": data.chatId},
                )
                return
            if error == UpvoteError.CHAT_NOT_FOUND:
                await send_error(
                    websocket,
                    "CHAT_NOT_FOUND",
                    "Message not found",
                    extra={"chatId": data.chatId},
                )
                return
            if error == UpvoteError.USER_NOT_IN_ROOM or not chat:
                await send_error(
                    websocket,
                    "UPVOTE_FAILED",
                    "Could not upvote message",
                    extra={"chatId": data.chatId},
                )
                return

            user_manager.mark_upvote_sent(user, data.chatId)

            await user_manager.broadcast_to_room(
                room_id,
                {
                    "type": OutgoingMessageType.UPDATE_CHAT,
                    "payload": {
                        "chatId": data.chatId,
                        "roomId": room_id,
                        "upVotes": chat.upvotes,
                    },
                },
            )

        elif msg_type == IncomingMessageType.DISMISS_CHAT:
            try:
                data = DismissChatPayload.model_validate(payload)
            except ValidationError:
                await send_error(websocket, "INVALID_PAYLOAD", "Invalid dismiss payload")
                return

            if user.role != "admin":
                await send_error(websocket, "FORBIDDEN", "Only admins can dismiss messages")
                return

            dismissed = dismiss_chat(db, room_id, data.chatId, user_id)
            if not dismissed:
                await send_error(websocket, "DISMISS_FAILED", "Could not dismiss message")
                return

            await user_manager.broadcast_to_room(
                room_id,
                {
                    "type": OutgoingMessageType.DISMISS_CHAT,
                    "payload": {
                        "chatId": data.chatId,
                        "roomId": room_id,
                    },
                },
            )

        elif msg_type == IncomingMessageType.LOAD_MORE_HISTORY:
            try:
                data = LoadMoreHistoryPayload.model_validate(payload)
            except ValidationError:
                await send_error(websocket, "INVALID_PAYLOAD", "Invalid history payload")
                return

            older, has_more = get_chats_page(
                db, room_id, user_id, before_chat_id=data.beforeChatId
            )
            await send_chat_history(websocket, room_id, older, has_more, append=True)

        else:
            await send_error(websocket, "INVALID_PAYLOAD", f"Unknown message type: {msg_type}")
    except Exception:
        logger.exception(
            "WebSocket handler error roomId=%s userId=%s type=%s", room_id, user_id, msg_type
        )
        await send_error(websocket, "INTERNAL_ERROR", "An unexpected error occurred")
    finally:
        db.close()


@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    current_room_id: str | None = None
    current_user_id: str | None = None
    rate_timestamps: deque[float] = deque()

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                payload = message.get("payload", {})
                socket_user = user_manager.get_user_for_socket(websocket)
                if socket_user:
                    bound = user_manager.get_bound_identity(websocket)
                    if bound:
                        current_room_id, current_user_id = bound
                elif payload.get("roomId"):
                    current_room_id = payload["roomId"]
                if payload.get("userId"):
                    current_user_id = payload["userId"]
                await handle_message(websocket, message, rate_timestamps)
            except json.JSONDecodeError:
                logger.warning("Invalid JSON received on WebSocket")
                await send_error(websocket, "INVALID_JSON", "Message must be valid JSON")
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected roomId=%s userId=%s", current_room_id, current_user_id)
        if current_room_id and current_user_id:
            user_manager.remove_user(current_room_id, current_user_id, websocket)
