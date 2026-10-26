import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from .auth import bootstrap_superadmin
from .config import settings
from .database import Base, SessionLocal, engine, get_db
from .email_service import send_contact_emails
from .models import ContactMessage
from .routers import admin, auth, posters
from .schemas import ContactIn, ContactOut

logging.basicConfig(level=logging.INFO)

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)  # creates tables on first run
    db = SessionLocal()
    try:
        bootstrap_superadmin(db)  # creates the owner's account from .env, once
    finally:
        db.close()
    yield


app = FastAPI(title="Raventiq API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# uploaded poster images, served as plain static files at /uploads/posters/<file>
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(auth.router)
app.include_router(posters.router)
app.include_router(admin.router)

# very small in-memory throttle: max 5 submissions per IP per 10 minutes
_hits: dict[str, list[float]] = {}


def _throttled(ip: str, limit: int = 5, window: int = 600) -> bool:
    import time

    now = time.time()
    recent = [t for t in _hits.get(ip, []) if now - t < window]
    if len(recent) >= limit:
        _hits[ip] = recent
        return True
    recent.append(now)
    _hits[ip] = recent
    return False


@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.post("/api/contact", response_model=ContactOut, status_code=201)
def create_contact(
    payload: ContactIn,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else "unknown"
    if _throttled(ip):
        raise HTTPException(status_code=429, detail="Too many messages. Please try again later.")

    if payload.website:  # honeypot filled -> pretend success, store nothing
        return ContactOut(id=0)

    row = ContactMessage(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        service=payload.service,
        message=payload.message,
    )
    db.add(row)
    db.commit()
    background.add_task(send_contact_emails, row.id)
    return ContactOut(id=row.id)
