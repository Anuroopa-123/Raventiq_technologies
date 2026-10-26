from pydantic import BaseModel, EmailStr, Field, field_validator


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    service: str | None = Field(default=None, max_length=80)
    message: str = Field(min_length=10, max_length=3000)
    # Honeypot: real users never see/fill this field, bots do.
    website: str | None = Field(default=None, max_length=200)

    @field_validator("name", "message", mode="before")
    @classmethod
    def strip(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("phone", "service", mode="before")
    @classmethod
    def blank_to_none(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v


class ContactOut(BaseModel):
    id: int
    detail: str = "Thank you! We have received your message and will reply soon."


# ------------------------------------------------------------------ auth ----

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=30)
    college: str | None = Field(default=None, max_length=160)

    @field_validator("name", mode="before")
    @classmethod
    def strip(cls, v):
        return v.strip() if isinstance(v, str) else v


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class GoogleAuthIn(BaseModel):
    credential: str = Field(min_length=10)  # the ID token from Google Identity Services


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    college: str | None = None
    role: str
    is_active: bool
    has_password: bool = False
    has_google: bool = False
    created_at: str

    @classmethod
    def from_model(cls, u) -> "UserOut":
        return cls(
            id=u.id, name=u.name, email=u.email, phone=u.phone, college=u.college,
            role=u.role.value, is_active=u.is_active,
            has_password=bool(u.password_hash), has_google=bool(u.google_sub),
            created_at=u.created_at.isoformat(),
        )


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class CreateAdminIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# ---------------------------------------------------------------- posters ---

class PosterIn(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    link_url: str | None = Field(default=None, max_length=500)
    is_active: bool = True


class PosterOut(BaseModel):
    id: int
    title: str
    description: str | None
    image_url: str
    link_url: str | None
    is_active: bool
    created_at: str
