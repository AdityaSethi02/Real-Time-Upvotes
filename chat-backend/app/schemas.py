from pydantic import BaseModel, Field, field_validator, model_validator

from app.config import DEFAULT_HOT_VOTE_THRESHOLD, DEFAULT_MEDIUM_VOTE_THRESHOLD


class CreateAdminAndRoomRequest(BaseModel):
    adminName: str = Field(min_length=1, max_length=100)
    roomName: str = Field(min_length=1, max_length=100)
    chatCoolDown: str | int
    upvoteCoolDown: str | int
    mediumVoteThreshold: int = Field(default=DEFAULT_MEDIUM_VOTE_THRESHOLD, ge=1, le=1000)
    hotVoteThreshold: int = Field(default=DEFAULT_HOT_VOTE_THRESHOLD, ge=2, le=1000)
    adminId: str | None = None

    @model_validator(mode="after")
    def validate_thresholds(self):
        if self.mediumVoteThreshold >= self.hotVoteThreshold:
            raise ValueError("mediumVoteThreshold must be less than hotVoteThreshold")
        return self


class JoinRoomRequest(BaseModel):
    userName: str = Field(min_length=1, max_length=100)
    roomId: str = Field(min_length=1, max_length=64)

    @field_validator("roomId")
    @classmethod
    def strip_room_id(cls, value: str) -> str:
        return value.strip()


class SessionTokenRequest(BaseModel):
    sessionToken: str = Field(min_length=1)


class AdminResponse(BaseModel):
    adminId: str
    adminName: str
    roomId: str

    model_config = {"from_attributes": True}


class RoomResponse(BaseModel):
    roomId: str
    roomName: str
    chatCoolDown: int
    upvoteCoolDown: int
    mediumVoteThreshold: int
    hotVoteThreshold: int

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    userId: str
    userName: str
    roomId: str

    model_config = {"from_attributes": True}


class RoomDetailsResponse(BaseModel):
    roomName: str
    chatCoolDown: int
    upvoteCoolDown: int
    mediumVoteThreshold: int
    hotVoteThreshold: int

    model_config = {"from_attributes": True}


class AdminSummaryResponse(BaseModel):
    adminId: str
    adminName: str

    model_config = {"from_attributes": True}


class SessionResponse(BaseModel):
    sessionToken: str
    role: str


class SessionDetailResponse(BaseModel):
    sessionToken: str
    role: str
    userId: str
    roomId: str


class CreateAdminAndRoomResponse(BaseModel):
    admin: AdminResponse
    room: RoomResponse
    session: SessionResponse


class JoinRoomResponse(BaseModel):
    user: UserResponse
    room: RoomResponse
    session: SessionResponse


def parse_cooldown(value: str | int) -> int:
    text = str(value).replace("sec", "").strip()
    if text in ("none", ""):
        return 0
    try:
        parsed = int(text)
        return max(0, parsed)
    except ValueError:
        return 0
