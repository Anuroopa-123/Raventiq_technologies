"""Password hashing, JWT issuing/verification, Google ID-token verification,
and the FastAPI dependencies that guard admin / superadmin endpoints."""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import User, UserRole

bearer = HTTPBearer(auto_error=False)

# bcrypt's own algorithm silently ignores any password bytes past 72; we reject
# anything that long up front instead (RegisterIn already caps at 128 chars).
_MAX_PW_BYTES = 72


def hash_password(password: str) -> str:
    pw = password.encode("utf-8")[:_MAX_PW_BYTES]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, password_hash: str) -> bool:
    pw = password.encode("utf-8")[:_MAX_PW_BYTES]
    try:
        return bcrypt.checkpw(pw, password_hash.encode("ascii"))
    except ValueError:
        return False


def create_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "role": user.role.value,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expires_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Your session has expired. Please log in again.") from exc


def verify_google_id_token(token: str) -> dict:
    """Verifies a Google Identity Services credential and returns its claims
    (email, name, sub, email_verified, ...). Raises 401 if invalid."""
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured on this server.")
    try:
        claims = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.google_client_id
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Google sign-in failed. Please try again.") from exc
    if not claims.get("email_verified", False):
        raise HTTPException(status_code=401, detail="Your Google email is not verified.")
    return claims


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise HTTPException(status_code=401, detail="Please log in.", headers={"WWW-Authenticate": "Bearer"})
    payload = decode_token(creds.credentials)
    user = db.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="This account is no longer active.")
    return user


def require_roles(*roles: UserRole):
    """Dependency factory: require_roles(UserRole.admin, UserRole.superadmin)"""

    def dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="You don't have permission to do that.")
        return user

    return dep


require_admin = require_roles(UserRole.admin, UserRole.superadmin)
require_superadmin = require_roles(UserRole.superadmin)


def bootstrap_superadmin(db: Session) -> None:
    """Creates the owner's account from .env on first startup, if no superadmin
    exists yet. Safe to call on every startup."""
    exists = db.query(User).filter(User.role == UserRole.superadmin).first()
    if exists:
        return
    if not settings.superadmin_email or not settings.superadmin_password:
        import logging

        logging.getLogger("raventiq.auth").warning(
            "No superadmin account exists yet, and SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD "
            "are not set in .env, so one could not be created. Set them and restart."
        )
        return
    owner = User(
        name=settings.superadmin_name,
        email=settings.superadmin_email.lower().strip(),
        password_hash=hash_password(settings.superadmin_password),
        role=UserRole.superadmin,
    )
    db.add(owner)
    db.commit()
    import logging

    logging.getLogger("raventiq.auth").info("Created the owner (superadmin) account: %s", owner.email)
