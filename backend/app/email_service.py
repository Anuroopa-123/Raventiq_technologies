import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr, parseaddr

from sqlalchemy.orm import Session

from .config import settings
from .database import SessionLocal
from .models import ContactMessage

log = logging.getLogger("raventiq.mail")


def _smtp_ready() -> bool:
    return bool(settings.smtp_host and settings.smtp_user and settings.smtp_password)


def _send(msg: EmailMessage) -> None:
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as s:
        s.starttls()
        s.login(settings.smtp_user, settings.smtp_password)
        s.send_message(msg)


def _team_mail(c: ContactMessage) -> EmailMessage:
    m = EmailMessage()
    m["Subject"] = f"New enquiry from {c.name} ({c.service or 'General'})"
    m["From"] = settings.mail_from
    m["To"] = ", ".join(settings.notify_list)
    m["Reply-To"] = formataddr((c.name, c.email))
    m.set_content(
        f"New contact form message #{c.id}\n\n"
        f"Name:    {c.name}\nEmail:   {c.email}\nPhone:   {c.phone or '-'}\n"
        f"Service: {c.service or '-'}\n\nMessage:\n{c.message}\n"
    )
    return m


def _ack_mail(c: ContactMessage) -> EmailMessage:
    m = EmailMessage()
    m["Subject"] = "We got your message - Raventiq"
    m["From"] = settings.mail_from
    m["To"] = formataddr((c.name, c.email))
    m.set_content(
        f"Hi {c.name},\n\n"
        "Thank you for contacting Raventiq. We have received your message "
        "and one of us (Anuroopa or Dinesh) will reply within 24 hours.\n\n"
        "Your message:\n"
        f"{c.message}\n\n"
        "Code. Grow. Uplift.\nTeam Raventiq\n"
    )
    return m


def send_contact_emails(contact_id: int) -> None:
    """Runs in a background task, after the response has been returned to the visitor."""
    db: Session = SessionLocal()
    try:
        c = db.get(ContactMessage, contact_id)
        if c is None:
            return
        if not _smtp_ready() or not settings.notify_list:
            log.warning("SMTP not configured; skipping emails for contact #%s", contact_id)
            c.email_status = "skipped"
        else:
            try:
                _send(_team_mail(c))
                _send(_ack_mail(c))
                c.email_status = "sent"
            except Exception:  # noqa: BLE001 - never lose the stored message because of mail trouble
                log.exception("Failed to send emails for contact #%s", contact_id)
                c.email_status = "failed"
        db.commit()
    finally:
        db.close()
