-- Neon / PostgreSQL: köhnə "users" sxemi (username, password və s.) bu layihə ilə uyğun deyil.
-- Tətbiq gözləyir: email, password_hash, full_name, created_at, about_me
--
-- Diqqət: aşağıdakı cədvəllərdəki MƏLUMAT silinəcək. Yalnız inkişaf/test üçün.
-- SQL Editor-də işlədin, sonra Flask-ı yenidən işə salın (cədvəllər yenidən yaradılacaq).

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_uploads CASCADE;
DROP TABLE IF EXISTS flights CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Sonra: layihəni işə salın — backend/app.py init_db_postgres + _migrate_postgres_extras
-- avtomatik düzgün sxemi yaradacaq.
