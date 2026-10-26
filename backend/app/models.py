import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class ContactMessage(Base):
    __tablename__ = "contact_messages"
    __table_args__ = (Index("ix_contact_messages_created_at", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    service: Mapped[str | None] = mapped_column(String(80), nullable=True)
    message: Mapped[str] = mapped_column(Text)
    email_status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"
    superadmin = "superadmin"


class User(Base):
    """A registered account. Students self-register (form or Google); admin and
    superadmin accounts are created only by a superadmin (never through /register)."""

    __tablename__ = "users"
    __table_args__ = (Index("ix_users_created_at", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    college: Mapped[str | None] = mapped_column(String(160), nullable=True)

    # exactly one of these identifies how the person signs in
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.student)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    posters: Mapped[list["Poster"]] = relationship(back_populates="created_by")


class Poster(Base):
    """An event / workshop poster that admins upload, shown in the website's
    Updates gallery."""

    __tablename__ = "posters"
    __table_args__ = (Index("ix_posters_created_at", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_path: Mapped[str] = mapped_column(String(500))  # relative path under uploads/
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    created_by: Mapped["User | None"] = relationship(back_populates="posters")
