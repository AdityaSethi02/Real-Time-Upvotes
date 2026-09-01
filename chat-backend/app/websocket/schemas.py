from pydantic import BaseModel, Field

from app.config import MAX_MESSAGE_LENGTH


class JoinRoomPayload(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    userId: str = Field(min_length=1, max_length=64)
    roomId: str = Field(min_length=1, max_length=64)
    sessionToken: str = Field(min_length=1)


class SendMessagePayload(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_MESSAGE_LENGTH)
    userId: str | None = Field(default=None, max_length=64)
    roomId: str | None = Field(default=None, max_length=64)


class UpvoteMessagePayload(BaseModel):
    chatId: str = Field(min_length=1)
    userId: str | None = Field(default=None, max_length=64)
    roomId: str | None = Field(default=None, max_length=64)


class DismissChatPayload(BaseModel):
    chatId: str = Field(min_length=1)
    userId: str | None = Field(default=None, max_length=64)
    roomId: str | None = Field(default=None, max_length=64)


class LoadMoreHistoryPayload(BaseModel):
    beforeChatId: str = Field(min_length=1)
    userId: str | None = Field(default=None, max_length=64)
    roomId: str | None = Field(default=None, max_length=64)
