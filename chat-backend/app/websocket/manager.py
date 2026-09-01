import logging
import time
from dataclasses import dataclass, field

from fastapi import WebSocket

logger = logging.getLogger(__name__)


@dataclass
class User:
    name: str
    id: str
    conn: WebSocket
    role: str = "user"
    chat_cooldown: int = 0
    upvote_cooldown: int = 0
    last_message_time: float = 0.0
    last_upvote_times: dict[str, float] = field(default_factory=dict)


@dataclass
class Room:
    users: list[User] = field(default_factory=list)


class UserManager:
    def __init__(self):
        self._rooms: dict[str, Room] = {}
        self._socket_index: dict[int, tuple[str, str]] = {}

    def _register_socket(self, socket: WebSocket, room_id: str, user_id: str) -> None:
        self._socket_index[id(socket)] = (room_id, user_id)

    def _unregister_socket(self, socket: WebSocket) -> None:
        self._socket_index.pop(id(socket), None)

    async def add_user(
        self,
        name: str,
        user_id: str,
        room_id: str,
        socket: WebSocket,
        role: str = "user",
        chat_cooldown: int = 0,
        upvote_cooldown: int = 0,
    ) -> None:
        if room_id not in self._rooms:
            self._rooms[room_id] = Room()

        room = self._rooms[room_id]
        existing = next((user for user in room.users if user.id == user_id), None)
        if existing and existing.conn is not socket:
            self._unregister_socket(existing.conn)
            old_conn = existing.conn
            old_conn.onclose = None
            try:
                await old_conn.close()
            except Exception:
                logger.debug("Failed to close stale WebSocket for userId=%s", user_id)

        room.users = [user for user in room.users if user.id != user_id]

        room.users.append(
            User(
                name=name,
                id=user_id,
                conn=socket,
                role=role,
                chat_cooldown=chat_cooldown,
                upvote_cooldown=upvote_cooldown,
            )
        )
        self._register_socket(socket, room_id, user_id)

    def remove_user(self, room_id: str, user_id: str, socket: WebSocket | None = None) -> None:
        room = self._rooms.get(room_id)
        if room:
            if socket is not None:
                room.users = [
                    user for user in room.users if user.id != user_id or user.conn is not socket
                ]
                self._unregister_socket(socket)
            else:
                for user in room.users:
                    if user.id == user_id:
                        self._unregister_socket(user.conn)
                room.users = [user for user in room.users if user.id != user_id]

            if not room.users:
                del self._rooms[room_id]

    def get_user(self, room_id: str, user_id: str) -> User | None:
        room = self._rooms.get(room_id)
        if not room:
            return None
        return next((user for user in room.users if user.id == user_id), None)

    def get_user_for_socket(self, socket: WebSocket) -> User | None:
        key = self._socket_index.get(id(socket))
        if not key:
            return None
        room_id, user_id = key
        user = self.get_user(room_id, user_id)
        if user and user.conn is socket:
            return user
        return None

    def is_joined(self, socket: WebSocket) -> bool:
        return self.get_user_for_socket(socket) is not None

    def get_bound_identity(self, socket: WebSocket) -> tuple[str, str] | None:
        return self._socket_index.get(id(socket))

    def can_send_message(self, user: User) -> tuple[bool, int]:
        if user.chat_cooldown <= 0:
            return True, 0
        elapsed = time.time() - user.last_message_time
        remaining = user.chat_cooldown - int(elapsed)
        if remaining > 0:
            return False, remaining
        return True, 0

    def can_upvote(self, user: User, chat_id: str) -> tuple[bool, int]:
        if user.upvote_cooldown <= 0:
            return True, 0
        last_upvote = user.last_upvote_times.get(chat_id, 0.0)
        elapsed = time.time() - last_upvote
        remaining = user.upvote_cooldown - int(elapsed)
        if remaining > 0:
            return False, remaining
        return True, 0

    def mark_message_sent(self, user: User) -> None:
        user.last_message_time = time.time()

    def mark_upvote_sent(self, user: User, chat_id: str) -> None:
        user.last_upvote_times[chat_id] = time.time()

    async def send_to_user(self, room_id: str, user_id: str, message: dict) -> None:
        user = self.get_user(room_id, user_id)
        if user:
            try:
                await user.conn.send_json(message)
            except Exception:
                logger.warning("Failed to send WS message to userId=%s", user_id)

    async def broadcast_to_room(self, room_id: str, message: dict) -> None:
        room = self._rooms.get(room_id)
        if not room:
            return
        for connected_user in room.users:
            try:
                await connected_user.conn.send_json(message)
            except Exception:
                logger.warning(
                    "Failed to broadcast to userId=%s in roomId=%s",
                    connected_user.id,
                    room_id,
                )
