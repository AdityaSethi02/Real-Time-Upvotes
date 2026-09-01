import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Room(Base):
    __tablename__ = "Room"

    roomId: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    roomName: Mapped[str] = mapped_column(String, nullable=False)
    chatCoolDown: Mapped[int] = mapped_column(Integer, nullable=False)
    upvoteCoolDown: Mapped[int] = mapped_column(Integer, nullable=False)
    mediumVoteThreshold: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    hotVoteThreshold: Mapped[int] = mapped_column(Integer, nullable=False, default=10)

    admins: Mapped[list["Admin"]] = relationship(back_populates="room")
    users: Mapped[list["User"]] = relationship(back_populates="room")
    chats: Mapped[list["Chat"]] = relationship(back_populates="room")


class Admin(Base):
    __tablename__ = "Admin"

    adminId: Mapped[str] = mapped_column(String, primary_key=True)
    adminName: Mapped[str] = mapped_column(String, nullable=False)
    roomId: Mapped[str] = mapped_column(String, ForeignKey("Room.roomId"), nullable=False)

    room: Mapped["Room"] = relationship(back_populates="admins")
    chats: Mapped[list["Chat"]] = relationship(back_populates="admin")


class User(Base):
    __tablename__ = "User"

    userId: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userName: Mapped[str] = mapped_column(String, nullable=False)
    roomId: Mapped[str] = mapped_column(String, ForeignKey("Room.roomId"), nullable=False)

    room: Mapped["Room"] = relationship(back_populates="users")
    chats: Mapped[list["Chat"]] = relationship(back_populates="user")


class Chat(Base):
    __tablename__ = "Chat"

    chatId: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    content: Mapped[str] = mapped_column(String, nullable=False)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.userId"), nullable=False)
    adminId: Mapped[str] = mapped_column(String, ForeignKey("Admin.adminId"), nullable=False)
    roomId: Mapped[str] = mapped_column(String, ForeignKey("Room.roomId"), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="chats")
    admin: Mapped["Admin"] = relationship(back_populates="chats")
    room: Mapped["Room"] = relationship(back_populates="chats")
    upvotes: Mapped[list["Upvote"]] = relationship(back_populates="chat", cascade="all, delete-orphan")


class Upvote(Base):
    __tablename__ = "Upvote"

    chatId: Mapped[str] = mapped_column(String, ForeignKey("Chat.chatId"), primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.userId"), primary_key=True)

    chat: Mapped["Chat"] = relationship(back_populates="upvotes")


class SessionToken(Base):
    __tablename__ = "SessionToken"

    token: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, nullable=False)
    roomId: Mapped[str] = mapped_column(String, ForeignKey("Room.roomId"), nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    expiresAt: Mapped[datetime] = mapped_column(DateTime, nullable=False)
