-- Birbaşa PostgreSQL (DATABASE_URL) — app.py işə düşəndə CREATE TABLE da edilir;
-- əl ilə:  psql "$DATABASE_URL" -f backend/postgres_setup.sql
--
-- Əgər users cədvəli əvvəldən var idi və password_hash yoxdursa (Neon/SQL Editor):
--   ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
--   ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
--   ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
