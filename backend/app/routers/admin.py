from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from ..auth import hash_password, require_superadmin
from ..database import get_db
from ..models import ContactMessage, Poster, User, UserRole
from ..schemas import CreateAdminIn, UserOut

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_superadmin)])


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    return {
        "students": db.query(func.count(User.id)).filter(User.role == UserRole.student).scalar(),
        "admins": db.query(func.count(User.id)).filter(User.role == UserRole.admin).scalar(),
        "posters": db.query(func.count(Poster.id)).scalar(),
        "contact_messages": db.query(func.count(ContactMessage.id)).scalar(),
    }


@router.get("/users", response_model=list[UserOut])
def list_registrations(role: str | None = None, db: Session = Depends(get_db)):
    """Every registered account: who signed up, when, and how (password or Google)."""
    q = db.query(User)
    if role:
        try:
            q = q.filter(User.role == UserRole(role))
        except ValueError:
            raise HTTPException(status_code=400, detail="role must be student, admin or superadmin.")
    rows = q.order_by(desc(User.created_at)).all()
    return [UserOut.from_model(u) for u in rows]


@router.get("/contact-messages")
def list_contact_messages(db: Session = Depends(get_db)):
    rows = db.query(ContactMessage).order_by(desc(ContactMessage.created_at)).all()
    return [
        {
            "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
            "service": m.service, "message": m.message, "email_status": m.email_status,
            "created_at": m.created_at.isoformat(),
        }
        for m in rows
    ]


@router.post("/admins", response_model=UserOut, status_code=201)
def create_admin(payload: CreateAdminIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with that email already exists.")
    admin = User(
        name=payload.name, email=email,
        password_hash=hash_password(payload.password), role=UserRole.admin,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return UserOut.from_model(admin)


@router.patch("/admins/{user_id}/active", response_model=UserOut)
def set_admin_active(user_id: int, is_active: bool, db: Session = Depends(get_db)):
    admin = db.get(User, user_id)
    if admin is None or admin.role != UserRole.admin:
        raise HTTPException(status_code=404, detail="Admin not found.")
    admin.is_active = is_active
    db.commit()
    db.refresh(admin)
    return UserOut.from_model(admin)


@router.delete("/admins/{user_id}", status_code=204)
def delete_admin(user_id: int, db: Session = Depends(get_db)):
    admin = db.get(User, user_id)
    if admin is None or admin.role != UserRole.admin:
        raise HTTPException(status_code=404, detail="Admin not found.")
    db.delete(admin)
    db.commit()
