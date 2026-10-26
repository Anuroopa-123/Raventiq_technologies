import os
import threading
import time

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://postgres@localhost:5432/raventiq")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.config import settings
from app.database import SessionLocal
from app.main import app, _hits


@pytest.fixture()
def client():
    _hits.clear()
    with TestClient(app) as c:
        with SessionLocal() as db:
            db.execute(text("TRUNCATE contact_messages RESTART IDENTITY"))
            db.commit()
        yield c


GOOD = {"name": "Test User", "email": "student@example.com", "phone": "9876543210",
        "service": "Web Development", "message": "I need a website for my shop please."}


def status_of(i):
    with SessionLocal() as db:
        return db.execute(text("SELECT email_status FROM contact_messages WHERE id=:i"), {"i": i}).scalar()


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_saves_to_db_and_skips_mail_when_unconfigured(client, monkeypatch):
    monkeypatch.setattr(settings, "smtp_host", "")
    r = client.post("/api/contact", json=GOOD)
    assert r.status_code == 201
    assert status_of(r.json()["id"]) == "skipped"


def test_sends_two_emails(client, monkeypatch):
    sent = []
    import app.email_service as es
    monkeypatch.setattr(es, "_send", lambda m: sent.append(m))
    for k, v in dict(smtp_host="h", smtp_user="u", smtp_password="p", notify_emails="team@x.com").items():
        monkeypatch.setattr(settings, k, v)
    r = client.post("/api/contact", json=GOOD)
    assert r.status_code == 201
    assert status_of(r.json()["id"]) == "sent"
    assert [m["To"] for m in sent][0] == "team@x.com"
    assert "student@example.com" in sent[1]["To"]
    assert sent[0]["Reply-To"].endswith("<student@example.com>")


def test_mail_failure_keeps_message(client, monkeypatch):
    import app.email_service as es
    def boom(m): raise RuntimeError("smtp down")
    monkeypatch.setattr(es, "_send", boom)
    for k, v in dict(smtp_host="h", smtp_user="u", smtp_password="p", notify_emails="team@x.com").items():
        monkeypatch.setattr(settings, k, v)
    r = client.post("/api/contact", json=GOOD)
    assert r.status_code == 201
    assert status_of(r.json()["id"]) == "failed"


def test_validation(client):
    assert client.post("/api/contact", json={**GOOD, "email": "nope"}).status_code == 422
    assert client.post("/api/contact", json={**GOOD, "message": "short"}).status_code == 422


def test_honeypot_stores_nothing(client):
    r = client.post("/api/contact", json={**GOOD, "website": "http://spam"})
    assert r.status_code == 201 and r.json()["id"] == 0
    with SessionLocal() as db:
        assert db.execute(text("SELECT count(*) FROM contact_messages")).scalar() == 0


def test_throttle(client):
    codes = [client.post("/api/contact", json=GOOD).status_code for _ in range(6)]
    assert codes[:5] == [201] * 5 and codes[5] == 429
