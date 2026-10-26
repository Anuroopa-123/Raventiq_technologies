import secrets

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/raventiq"
    cors_origins: str = "http://localhost:4200"

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    mail_from: str = "Raventiq <no-reply@raventiq.com>"
    notify_emails: str = ""

    # --- auth ---
    # Generated fresh if not set in .env. Set a fixed value in production, or every
    # restart invalidates every logged-in session.
    jwt_secret: str = secrets.token_urlsafe(48)
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 7  # 7 days

    # The owner's login. Created automatically on first startup if no superadmin
    # exists yet. Change the password after first login (see README).
    superadmin_name: str = "Owner"
    superadmin_email: str = ""
    superadmin_password: str = ""

    # Google Sign-In: create an OAuth 2.0 Web client at
    # https://console.cloud.google.com/apis/credentials and put its Client ID here
    # AND in frontend/src/app/site.config.ts (googleClientId). Leave blank to disable
    # the "Sign in with Google" button.
    google_client_id: str = ""

    # where uploaded poster images are written; served at /uploads/*
    upload_dir: str = "uploads"
    max_upload_mb: int = 5

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def notify_list(self) -> list[str]:
        return [e.strip() for e in self.notify_emails.split(",") if e.strip()]


settings = Settings()
