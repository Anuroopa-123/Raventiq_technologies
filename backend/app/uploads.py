"""Saves uploaded poster images to disk as safe, unique, re-encoded files."""

import io
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from .config import settings

ALLOWED = {"jpeg": "jpg", "png": "png", "webp": "webp"}


def save_poster_image(file: UploadFile) -> str:
    raw = file.file.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(raw) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Image is larger than {settings.max_upload_mb}MB.")
    try:
        img = Image.open(io.BytesIO(raw))
        img.verify()
        img = Image.open(io.BytesIO(raw))  # re-open: verify() consumes the parser
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="That file isn't a valid image.") from exc

    fmt = (img.format or "").lower()
    ext = ALLOWED.get(fmt)
    if not ext:
        raise HTTPException(status_code=400, detail="Please upload a JPEG, PNG or WebP image.")
    if img.mode in ("RGBA", "P") and ext == "jpg":
        img = img.convert("RGB")

    posters_dir = Path(settings.upload_dir) / "posters"
    posters_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}.{ext}"
    img.save(posters_dir / name)
    return f"posters/{name}"


def delete_poster_image(rel_path: str) -> None:
    p = Path(settings.upload_dir) / rel_path
    try:
        if p.is_file() and p.resolve().is_relative_to(Path(settings.upload_dir).resolve()):
            p.unlink()
    except OSError:
        pass
