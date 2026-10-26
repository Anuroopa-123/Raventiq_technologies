from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import desc
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_admin
from ..config import settings
from ..database import get_db
from ..models import Poster, User
from ..schemas import PosterOut
from ..uploads import delete_poster_image, save_poster_image

router = APIRouter(prefix="/api/posters", tags=["posters"])


def _out(p: Poster) -> PosterOut:
    return PosterOut(
        id=p.id, title=p.title, description=p.description,
        image_url=f"/uploads/{p.image_path}", link_url=p.link_url,
        is_active=p.is_active, created_at=p.created_at.isoformat(),
    )


@router.get("", response_model=list[PosterOut])
def list_posters(db: Session = Depends(get_db)):
    """Public: only the posters that are switched on, newest first."""
    rows = db.query(Poster).filter(Poster.is_active.is_(True)).order_by(desc(Poster.created_at)).all()
    return [_out(p) for p in rows]


@router.get("/all", response_model=list[PosterOut])
def list_all_posters(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Admin/superadmin: every poster, including hidden ones."""
    rows = db.query(Poster).order_by(desc(Poster.created_at)).all()
    return [_out(p) for p in rows]


@router.post("", response_model=PosterOut, status_code=201)
def create_poster(
    title: str = Form(..., min_length=2, max_length=160),
    description: str | None = Form(default=None),
    link_url: str | None = Form(default=None),
    is_active: bool = Form(default=True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    rel_path = save_poster_image(image)
    row = Poster(
        title=title.strip(), description=(description or "").strip() or None,
        link_url=(link_url or "").strip() or None, is_active=is_active,
        image_path=rel_path, created_by_id=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _out(row)


@router.patch("/{poster_id}", response_model=PosterOut)
def update_poster(
    poster_id: int,
    title: str | None = Form(default=None, min_length=2, max_length=160),
    description: str | None = Form(default=None),
    link_url: str | None = Form(default=None),
    is_active: bool | None = Form(default=None),
    image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    row = db.get(Poster, poster_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Poster not found.")
    if title is not None:
        row.title = title.strip()
    if description is not None:
        row.description = description.strip() or None
    if link_url is not None:
        row.link_url = link_url.strip() or None
    if is_active is not None:
        row.is_active = is_active
    if image is not None:
        old = row.image_path
        row.image_path = save_poster_image(image)
        delete_poster_image(old)
    db.commit()
    db.refresh(row)
    return _out(row)


@router.delete("/{poster_id}", status_code=204)
def delete_poster(poster_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    row = db.get(Poster, poster_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Poster not found.")
    delete_poster_image(row.image_path)
    db.delete(row)
    db.commit()
