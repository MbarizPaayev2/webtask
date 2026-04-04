-- Birbaşa PostgreSQL (DATABASE_URL) — app.py işə düşəndə CREATE TABLE da edilir;
-- əl ilə:  psql "$DATABASE_URL" -f backend/postgres_setup.sql

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
