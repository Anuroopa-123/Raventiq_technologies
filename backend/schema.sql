-- Reference only: the app creates all of this automatically on startup
-- (SQLAlchemy's Base.metadata.create_all). You do not need to run this file.

CREATE TABLE IF NOT EXISTS contact_messages (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    phone         VARCHAR(30),
    service       VARCHAR(80),
    message       TEXT          NOT NULL,
    email_status  VARCHAR(20)   NOT NULL DEFAULT 'pending', -- pending | sent | failed | skipped
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_contact_messages_created_at ON contact_messages (created_at DESC);

CREATE TYPE user_role AS ENUM ('student', 'admin', 'superadmin');

CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(120)  NOT NULL,
    email          VARCHAR(255)  NOT NULL UNIQUE,
    phone          VARCHAR(30),
    college        VARCHAR(160),
    password_hash  VARCHAR(255),           -- null for Google-only accounts
    google_sub     VARCHAR(255) UNIQUE,    -- null for password accounts
    role           user_role     NOT NULL DEFAULT 'student',
    is_active      BOOLEAN       NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_users_created_at ON users (created_at DESC);

CREATE TABLE IF NOT EXISTS posters (
    id             SERIAL PRIMARY KEY,
    title          VARCHAR(160)  NOT NULL,
    description    TEXT,
    image_path     VARCHAR(500)  NOT NULL, -- relative path under the uploads/ folder
    link_url       VARCHAR(500),
    is_active      BOOLEAN       NOT NULL DEFAULT true,
    created_by_id  INTEGER REFERENCES users(id),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_posters_created_at ON posters (created_at DESC);
