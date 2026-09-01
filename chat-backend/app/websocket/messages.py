from enum import Enum


class IncomingMessageType(str, Enum):
    JOIN_ROOM = "JOIN_ROOM"
    SEND_MESSAGE = "SEND_MESSAGE"
    UPVOTE_MESSAGE = "UPVOTE_MESSAGE"
    DISMISS_CHAT = "DISMISS_CHAT"


class OutgoingMessageType(str, Enum):
    ADD_CHAT = "ADD_CHAT"
    UPDATE_CHAT = "UPDATE_CHAT"
    CHAT_HISTORY = "CHAT_HISTORY"
    DISMISS_CHAT = "DISMISS_CHAT"
    ERROR = "ERROR"
