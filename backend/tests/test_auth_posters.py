import io
import os

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://postgres@localhost:5432/raventiq")

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import text

from app.auth import bootstrap_superadmin
from app.config import settings
from app.database import SessionLocal
from app.main import _hits, app
from app.models import UserRole


@pytest.fixture()
def client():
    _hits.clear()
    with TestClient(app) as c:
        with SessionLocal() as db:
            db.execute(text("TRUNCATE users, posters, contact_messages RESTART IDENTITY CASCADE"))
            db.commit()
            bootstrap_superadmin(db)  # re-create the owner after truncating users
        yield c


def jpeg_bytes():
    buf = io.BytesIO()
    Image.new("RGB", (40, 30), (255, 120, 0)).save(buf, format="JPEG")
    buf.seek(0)
    return buf


# ------------------------------------------------------------------ auth ----

def test_student_can_register_and_login(client):
    r = client.post("/api/auth/register", json={
        "name": "Kavya S", "email": "kavya@example.com", "password": "StrongPass1",
    })
    assert r.status_code == 201
    body = r.json()
    assert body["user"]["role"] == "student"
    token = body["access_token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200 and me.json()["email"] == "kavya@example.com"

    login = client.post("/api/auth/login", json={"email": "kavya@example.com", "password": "StrongPass1"})
    assert login.status_code == 200


def test_cannot_register_twice(client):
    first = client.post("/api/auth/register", json={"name": "Ann", "email": "a@example.com", "password": "StrongPass1"})
    assert first.status_code == 201
    r = client.post("/api/auth/register", json={"name": "Ann 2", "email": "a@example.com", "password": "StrongPass1"})
    assert r.status_code == 409


def test_wrong_password_rejected(client):
    client.post("/api/auth/register", json={"name": "A", "email": "a@example.com", "password": "StrongPass1"})
    r = client.post("/api/auth/login", json={"email": "a@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_registration_cannot_grant_admin_role(client):
    # the schema has no "role" field at all -- a client can't request one
    r = client.post("/api/auth/register", json={
        "name": "Sneaky", "email": "sneaky@example.com", "password": "StrongPass1", "role": "superadmin",
    })
    assert r.status_code == 201
    assert r.json()["user"]["role"] == "student"


def test_superadmin_bootstrapped_from_env(client):
    r = client.post("/api/auth/login", json={"email": settings.superadmin_email, "password": settings.superadmin_password})
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "superadmin"


def _owner_token(client):
    r = client.post("/api/auth/login", json={"email": settings.superadmin_email, "password": settings.superadmin_password})
    return r.json()["access_token"]


def _student_token(client, email="student1@example.com"):
    r = client.post("/api/auth/register", json={"name": "Student", "email": email, "password": "StrongPass1"})
    return r.json()["access_token"]


# -------------------------------------------------------- superadmin area ---

def test_student_cannot_see_registrations(client):
    tok = _student_token(client)
    r = client.get("/api/admin/users", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403


def test_no_token_is_401_not_403(client):
    r = client.get("/api/admin/users")
    assert r.status_code == 401


def test_superadmin_sees_all_registrations(client):
    _student_token(client, "s1@example.com")
    _student_token(client, "s2@example.com")
    tok = _owner_token(client)
    r = client.get("/api/admin/users", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    emails = {u["email"] for u in r.json()}
    assert {"s1@example.com", "s2@example.com", settings.superadmin_email} <= emails


def test_superadmin_creates_and_removes_admin(client):
    owner = {"Authorization": f"Bearer {_owner_token(client)}"}
    r = client.post("/api/admin/admins", json={"name": "Dinesh", "email": "dinesh@raventiq.com", "password": "AdminPass1"}, headers=owner)
    assert r.status_code == 201
    admin_id = r.json()["id"]
    assert r.json()["role"] == "admin"

    login = client.post("/api/auth/login", json={"email": "dinesh@raventiq.com", "password": "AdminPass1"})
    assert login.status_code == 200
    admin_tok = login.json()["access_token"]

    # the new admin cannot see registrations (superadmin-only) ...
    assert client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_tok}"}).status_code == 403
    # ... but CAN manage posters
    assert client.get("/api/posters/all", headers={"Authorization": f"Bearer {admin_tok}"}).status_code == 200

    # owner deactivates then deletes the admin
    deact = client.patch(f"/api/admin/admins/{admin_id}/active?is_active=false", headers=owner)
    assert deact.status_code == 200 and deact.json()["is_active"] is False
    still_in = client.post("/api/auth/login", json={"email": "dinesh@raventiq.com", "password": "AdminPass1"})
    assert still_in.status_code == 403  # deactivated

    delr = client.delete(f"/api/admin/admins/{admin_id}", headers=owner)
    assert delr.status_code == 204


def test_student_cannot_self_promote_via_admin_creation_endpoint(client):
    tok = _student_token(client)
    r = client.post("/api/admin/admins", json={"name": "X", "email": "x@example.com", "password": "StrongPass1"},
                     headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403


# ------------------------------------------------------------------- posters

def test_admin_uploads_poster_and_public_sees_it(client):
    owner = {"Authorization": f"Bearer {_owner_token(client)}"}
    r = client.post(
        "/api/posters",
        data={"title": "Free 3-Day Workshop", "description": "Dawn batch", "is_active": "true"},
        files={"image": ("poster.jpg", jpeg_bytes(), "image/jpeg")},
        headers=owner,
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["image_url"].startswith("/uploads/posters/")

    pub = client.get("/api/posters")
    assert pub.status_code == 200
    assert any(p["title"] == "Free 3-Day Workshop" for p in pub.json())

    img = client.get(body["image_url"])
    assert img.status_code == 200 and img.headers["content-type"].startswith("image/")


def test_inactive_poster_hidden_from_public_but_visible_to_admin(client):
    owner = {"Authorization": f"Bearer {_owner_token(client)}"}
    r = client.post(
        "/api/posters", data={"title": "Draft poster", "is_active": "false"},
        files={"image": ("p.jpg", jpeg_bytes(), "image/jpeg")}, headers=owner,
    )
    pid = r.json()["id"]
    assert all(p["id"] != pid for p in client.get("/api/posters").json())
    assert any(p["id"] == pid for p in client.get("/api/posters/all", headers=owner).json())


def test_student_cannot_create_poster(client):
    tok = _student_token(client)
    r = client.post(
        "/api/posters", data={"title": "Hack"}, files={"image": ("p.jpg", jpeg_bytes(), "image/jpeg")},
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert r.status_code == 403


def test_rejects_non_image_upload(client):
    owner = {"Authorization": f"Bearer {_owner_token(client)}"}
    r = client.post(
        "/api/posters", data={"title": "Bad file"},
        files={"image": ("p.txt", io.BytesIO(b"not an image"), "text/plain")}, headers=owner,
    )
    assert r.status_code == 400


def test_admin_updates_and_deletes_poster(client):
    owner = {"Authorization": f"Bearer {_owner_token(client)}"}
    r = client.post("/api/posters", data={"title": "Original"}, files={"image": ("p.jpg", jpeg_bytes(), "image/jpeg")}, headers=owner)
    pid = r.json()["id"]
    upd = client.patch(f"/api/posters/{pid}", data={"title": "Updated title"}, headers=owner)
    assert upd.status_code == 200 and upd.json()["title"] == "Updated title"
    delr = client.delete(f"/api/posters/{pid}", headers=owner)
    assert delr.status_code == 204
    assert all(p["id"] != pid for p in client.get("/api/posters/all", headers=owner).json())


def test_stats_endpoint(client):
    owner = {"Authorization": f"Bearer {_owner_token(client)}"}
    _student_token(client, "stu@example.com")
    r = client.get("/api/admin/stats", headers=owner)
    assert r.status_code == 200
    assert r.json()["students"] >= 1
