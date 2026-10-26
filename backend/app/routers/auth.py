from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import (
    create_token,
    get_current_user,
    hash_password,
    verify_google_id_token,
    verify_password,
)
from ..database import get_db
from ..models import User, UserRole
from ..schemas import GoogleAuthIn, LoginIn, RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with that email already exists. Try logging in.")
    user = User(
        name=payload.name,
        email=email,
        phone=payload.phone,
        college=payload.college,
        password_hash=hash_password(payload.password),
        role=UserRole.student,  # self-registration can only ever create a student account
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=create_token(user), user=UserOut.from_model(user))


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if user is None or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated.")
    return TokenOut(access_token=create_token(user), user=UserOut.from_model(user))


@router.post("/google", response_model=TokenOut)
def google_auth(payload: GoogleAuthIn, db: Session = Depends(get_db)):
    claims = verify_google_id_token(payload.credential)
    sub = claims["sub"]
    email = claims["email"].lower().strip()

    user = db.query(User).filter(User.google_sub == sub).first()
    if user is None:
        # same email already registered with a password -> link the Google account to it
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            user = User(
                name=claims.get("name") or email.split("@")[0],
                email=email,
                google_sub=sub,
                role=UserRole.student,
            )
            db.add(user)
        else:
            user.google_sub = sub
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated.")
    return TokenOut(access_token=create_token(user), user=UserOut.from_model(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.from_model(user)
