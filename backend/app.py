# -*- coding: utf-8 -*-
"""
Aviakassa — Flask backend (login / register)
Yalnız PostgreSQL (DATABASE_URL). İşə salmaq: python backend/app.py
"""

import os
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"


def _path_is_under_var_task(p: Path) -> bool:
    """Vercel serverless paketi /var/task altındadır; PROJECT_ROOT.resolve() bəzən fərqli ola bilər."""
    try:
        p = p.resolve()
    except OSError:
        pass
    parts = p.parts
    # POSIX: ('/', 'var', 'task', ...)
    return len(parts) >= 3 and parts[0] == "/" and parts[1] == "var" and parts[2] == "task"


def _is_vercel_runtime() -> bool:
    """Serverless (Vercel/Lambda): SSL, sessiya, /tmp upload, DB timeout."""
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        return True
    if os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return True
    if _path_is_under_var_task(Path(__file__)):
        return True
    if _path_is_under_var_task(PROJECT_ROOT):
        return True
    try:
        root = str(PROJECT_ROOT.resolve()).replace("\\", "/")
    except OSError:
        root = str(PROJECT_ROOT).replace("\\", "/")
    return root == "/var/task" or root.startswith("/var/task/")


# .env: əvvəl layihə kökü, sonra backend/ (hansı varsa)
# override=True: OS-də qalmış köhnə DATABASE_URL (məs. localhost) layihə .env üzərində yazılmasın
load_dotenv(PROJECT_ROOT / ".env", override=True)
load_dotenv(BACKEND_DIR / ".env")

# Serverless: layihə qovluğuna (/var/task) yazmaq olmaz — yalnız gettempdir()
if _is_vercel_runtime():
    UPLOAD_DIR = Path(tempfile.gettempdir()) / "aviakassa_uploads"
else:
    UPLOAD_DIR = PROJECT_ROOT / "uploads"

app = Flask(__name__)
# Təhlükəsizlik yaması: default olaraq təsadüfi gizli açar (Secret Key)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or os.urandom(24)


class DatabaseNotConfigured(Exception):
    """DATABASE_URL yoxdur — Vercel-də Environment Variables lazımdır."""

if _is_vercel_runtime():
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"


@app.before_request
def _api_options_preflight() -> Optional[Response]:
    if request.method == "OPTIONS" and request.path.startswith("/api/"):
        r = Response(status=204)
        r.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, OPTIONS, DELETE"
        r.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return r
    return None


@app.errorhandler(500)
def _api_500_json(e: Exception):
    """Görünməz 500-lərdə /api/* üçün JSON (HTML səhifə əvəzi)."""
    if request.path.startswith("/api/"):
        import traceback

        traceback.print_exc()
        return (
            jsonify(
                {
                    "ok": False,
                    "error": "Server xətası. Vercel Environment-də DATABASE_URL və deploy loglarını yoxlayın.",
                }
            ),
            500,
        )
    return e


@app.errorhandler(DatabaseNotConfigured)
def _handle_database_not_configured(_e: DatabaseNotConfigured):
    return (
        jsonify(
            {
                "ok": False,
                "error": (
                    "DATABASE_URL təyin edilməyib. Vercel: Project → Settings → "
                    "Environment Variables → DATABASE_URL (Neon PostgreSQL connection string). "
                    "Əlavə etdikdən sonra Redeploy edin."
                ),
            }
        ),
        503,
    )


DATABASE_URL = (os.environ.get("DATABASE_URL") or "").strip()
if not DATABASE_URL:
    print(
        "Xəta: DATABASE_URL boşdur. PostgreSQL üçün .env faylında məs. "
        "DATABASE_URL=postgresql://user:pass@localhost:5432/dbname təyin edin.",
        file=sys.stderr,
    )
    # Vercel serverless: import zamanı env bəzən yoxdur; layihə ayarlarında DATABASE_URL verin
    if not _is_vercel_runtime():
        sys.exit(1)

DB_MODE = "postgres"


def _effective_database_url() -> str:
    """Bulud Postgres (Neon, Supabase və s.) üçün SSL; Vercel-dən qoşulmada sslmode tez-tez lazımdır."""
    if not DATABASE_URL:
        return ""
    parsed = urlparse(DATABASE_URL)
    qs = parse_qs(parsed.query)
    # Bəzi libpq/psycopg2 (xüsusən Linux/Vercel) channel_binding ilə uğursuz qoşulur
    for _k in list(qs.keys()):
        if _k.lower() == "channel_binding":
            del qs[_k]
    keys_lower = {k.lower() for k in qs}
    if _is_vercel_runtime() and "sslmode" not in keys_lower:
        qs["sslmode"] = ["require"]
    new_query = urlencode(qs, doseq=True)
    return urlunparse(parsed._replace(query=new_query))


def _env_flag(*names: str) -> bool:
    for n in names:
        if (os.environ.get(n) or "").strip().lower() in ("1", "true", "yes"):
            return True
    return False


def _websec_lab_on() -> bool:
    """WEBSEC_LAB default 1 — təhlükəsizlik labı üçün. Söndürmək: WEBSEC_LAB=0"""
    v = (os.environ.get("WEBSEC_LAB") or "1").strip().lower()
    return v not in ("0", "false", "no", "off")


# Köhnə env adları: SQLI_LAB → DEV_INSECURE_SQL, SQLI_LAB_SKIP_PASSWORD → DEV_AUTH_BYPASS
# WEBSEC_LAB=1 (default) olduqda həm zəif SQL, həm parol bypass lab üçün aktiv ola bilər
_LAB = _websec_lab_on()
DEV_INSECURE_SQL = _env_flag("DEV_INSECURE_SQL", "SQLI_LAB") or _LAB
INSECURE_SQL_DB = DEV_INSECURE_SQL
DEV_AUTH_BYPASS = _env_flag("DEV_AUTH_BYPASS", "SQLI_LAB_SKIP_PASSWORD") or _LAB


def get_db_postgres():
    import psycopg2
    from psycopg2.extras import RealDictCursor

    dsn = _effective_database_url()
    if not dsn:
        raise DatabaseNotConfigured()
    kwargs: Dict[str, Any] = {"cursor_factory": RealDictCursor}
    if _is_vercel_runtime():
        kwargs["connect_timeout"] = 15
    return psycopg2.connect(dsn, **kwargs)


def init_db_postgres():
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id BIGSERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """
    )
    conn.commit()
    cur.close()
    conn.close()


try:
    init_db_postgres()
except Exception as ex:
    print("Postgres init xətası (cədvəl artıq var ola bilər):", ex)


def _migrate_postgres_extras():
    conn = get_db_postgres()
    cur = conn.cursor()
    # Köhnə/boş sxemdə users mövcud olsa belə CREATE TABLE sütun əlavə etmir
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT")
    cur.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()"
    )
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS about_me TEXT DEFAULT ''")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS flights (
            id BIGSERIAL PRIMARY KEY,
            code TEXT NOT NULL,
            from_country TEXT NOT NULL,
            to_country TEXT NOT NULL,
            flight_date TEXT NOT NULL,
            price DOUBLE PRECISION NOT NULL,
            seats INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id),
            flight_id BIGINT NOT NULL REFERENCES flights(id),
            amount DOUBLE PRECISION NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS user_uploads (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id),
            original_name TEXT NOT NULL,
            stored_name TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """
    )
    conn.commit()
    cur.execute("SELECT COUNT(*) AS c FROM flights")
    if (cur.fetchone() or {}).get("c", 0) == 0:
        cur.executemany(
            "INSERT INTO flights (code, from_country, to_country, flight_date, price, seats) VALUES (%s,%s,%s,%s,%s,%s)",
            [
                ("J2-101", "Azərbaycan", "Türkiyə", "2026-05-12", 189.0, 42),
                ("J2-204", "Türkiyə", "Qətər", "2026-05-18", 320.0, 18),
                ("J2-330", "Azərbaycan", "BƏƏ", "2026-06-01", 410.0, 24),
            ],
        )
        conn.commit()
    cur.execute("SELECT COUNT(*) AS c FROM transactions")
    if (cur.fetchone() or {}).get("c", 0) == 0:
        cur.execute("SELECT id FROM users ORDER BY id LIMIT 1")
        u = cur.fetchone()
        if u:
            uid = u["id"]
            cur.execute("SELECT id FROM flights ORDER BY id LIMIT 3")
            fids = [r["id"] for r in cur.fetchall()]
            if len(fids) >= 2:
                cur.execute(
                    "INSERT INTO transactions (user_id, flight_id, amount, status) VALUES (%s,%s,%s,%s)",
                    (uid, fids[0], 189.0, "ödənilib"),
                )
                cur.execute(
                    "INSERT INTO transactions (user_id, flight_id, amount, status) VALUES (%s,%s,%s,%s)",
                    (uid, fids[1], 320.0, "gözləmədə"),
                )
                conn.commit()
    cur.close()
    conn.close()


try:
    _migrate_postgres_extras()
except Exception as ex:
    print("Postgres əlavə sxem xətası:", ex)

def _ensure_upload_dir() -> None:
    """Import zamanı çökməsin: layihə qovluğu read-only-dirsə /tmp istifadə olunur."""
    global UPLOAD_DIR
    tmp = Path(tempfile.gettempdir()) / "aviakassa_uploads"
    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    except OSError as ex:
        print(
            "Upload qovluğu read-only və ya əlçatmaz; /tmp istifadə olunur:",
            ex,
            file=sys.stderr,
        )
        UPLOAD_DIR = tmp
        try:
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        except OSError as ex2:
            print("Upload qovluğu yaradılmadı:", ex2, file=sys.stderr)


_ensure_upload_dir()


def validate_email(email: str) -> bool:
    email = (email or "").strip()
    if len(email) < 5 or "@" not in email or "." not in email.split("@")[-1]:
        return False
    return True


MAX_LOGIN_EMAIL_LEN = 254
MAX_LOGIN_PASSWORD_LEN = 256


def validate_password_strength(pw: str) -> Tuple[bool, str]:
    if not pw or len(pw) < 8:
        return False, "Parol ən azı 8 simvol olmalıdır."
    if not any(c.isalpha() for c in pw):
        return False, "Parolda ən azı bir hərf olmalıdır."
    if not any(c.isdigit() for c in pw):
        return False, "Parolda ən azı bir rəqəm olmalıdır."
    return True, ""


def login_input_bounds(email: str, password: str) -> Tuple[bool, Optional[str]]:
    """Uzunluq və null-byte yoxlaması."""
    if len(email) > MAX_LOGIN_EMAIL_LEN or len(password) > MAX_LOGIN_PASSWORD_LEN:
        return False, "E-poçt və ya parol çox uzundur."
    if "\x00" in email or "\x00" in password:
        return False, "Yanlış simvol."
    return True, None


def user_get_by_email(email_lower: str) -> Optional[Dict[str, Any]]:
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, password_hash, full_name FROM users WHERE lower(email) = %s",
        (email_lower,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row is None:
        return None
    return dict(row)


def _serialize_created_at(val: Any) -> Optional[str]:
    if val is None:
        return None
    if hasattr(val, "isoformat"):
        return val.isoformat()
    return str(val)


def user_get_by_id(user_id: Any) -> Optional[Dict[str, Any]]:
    """Sessiya üçün istifadəçi sətirini oxuyur (parol hash qaytarılmır)."""
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, full_name, created_at, about_me FROM users WHERE id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row is None:
        return None
    d = dict(row)
    d["full_name"] = d.get("full_name") or ""
    d["about_me"] = d.get("about_me") or ""
    d["created_at"] = _serialize_created_at(d.get("created_at"))
    return d


def user_insert(email_lower: str, password_hash: str, full_name: str) -> Tuple[bool, Optional[str]]:
    import psycopg2

    try:
        conn = get_db_postgres()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s)",
            (email_lower, password_hash, full_name),
        )
        conn.commit()
        cur.close()
        conn.close()
        return True, None
    except psycopg2.IntegrityError:
        return False, "Bu e-poçt artıq qeydiyyatdan keçib."
    except Exception as ex:
        return False, str(ex)


def _user_lookup_concat(email: str) -> Optional[Dict[str, Any]]:
    """İnkişaf rejimi: sorğuda mətn birləşdirməsi (DEV_INSECURE_SQL)."""
    conn = get_db_postgres()
    cur = conn.cursor()
    try:
        sql = (
            "SELECT id, email, password_hash, full_name FROM users WHERE email = '"
            + email
            + "'"
        )
        cur.execute(sql)
        row = cur.fetchone()
        if row is None:
            return None
        return dict(row)
    except Exception:
        return None
    finally:
        cur.close()
        conn.close()


def _user_insert_concat(email_lower: str, password_hash: str, full_name: str) -> Tuple[bool, Optional[str]]:
    """İnkişaf rejimi: INSERT-də mətn birləşdirməsi (DEV_INSECURE_SQL)."""
    import psycopg2

    conn = get_db_postgres()
    cur = conn.cursor()
    try:
        sql = (
            "INSERT INTO users (email, password_hash, full_name) VALUES ('"
            + email_lower
            + "','"
            + password_hash
            + "','"
            + full_name
            + "')"
        )
        cur.execute(sql)
        conn.commit()
        return True, None
    except psycopg2.IntegrityError:
        return False, "Bu e-poçt artıq qeydiyyatdan keçib."
    except Exception as ex:
        return False, str(ex)
    finally:
        cur.close()
        conn.close()


def user_update_about_me(user_id: Any, about_me: str) -> bool:
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        "UPDATE users SET about_me = %s WHERE id = %s",
        (about_me, user_id),
    )
    conn.commit()
    cur.close()
    conn.close()
    return True


def admin_reports_data() -> Tuple[bool, Dict[str, Any]]:
    """Bütün uçuşlar və tranzaksiyalar (hesabat üçün)."""
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, code, from_country, to_country, flight_date, price, seats FROM flights ORDER BY id"
    )
    flights = [dict(x) for x in cur.fetchall()]
    cur.execute(
        """
        SELECT t.id, t.user_id, u.email AS user_email, t.flight_id, f.code AS flight_code,
               t.amount, t.status, t.created_at
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        JOIN flights f ON f.id = t.flight_id
        ORDER BY t.id
        """
    )
    trans = [dict(x) for x in cur.fetchall()]
    for d in trans:
        d["created_at"] = _serialize_created_at(d.get("created_at"))
    cur.close()
    conn.close()
    return True, {"flights": flights, "transactions": trans}


def user_uploads_list(user_id: Any) -> List[Dict[str, Any]]:
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, original_name, stored_name, created_at FROM user_uploads WHERE user_id = %s ORDER BY id DESC",
        (user_id,),
    )
    rows = [dict(x) for x in cur.fetchall()]
    cur.close()
    conn.close()
    return rows


def user_bookings_for_user(user_id: Any) -> Tuple[bool, List[Dict[str, Any]]]:
    """Cari istifadəçinin tranzaksiya/rezervasiya siyahısı (panel üçün)."""
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT t.id, t.amount, t.status, t.created_at,
               f.code AS flight_code, f.from_country, f.to_country, f.flight_date
        FROM transactions t
        JOIN flights f ON f.id = t.flight_id
        WHERE t.user_id = %s
        ORDER BY t.created_at DESC
        """,
        (user_id,),
    )
    out: List[Dict[str, Any]] = []
    for x in cur.fetchall():
        d = dict(x)
        d["created_at"] = _serialize_created_at(d.get("created_at"))
        d["flight_date"] = d.get("flight_date") or ""
        out.append(d)
    cur.close()
    conn.close()
    return True, out


@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    password2 = data.get("password_confirm") or ""
    full_name = (data.get("full_name") or "").strip()

    if not full_name or len(full_name) < 2:
        return jsonify({"ok": False, "error": "Ad ən azı 2 simvol olmalıdır."}), 400
    if INSECURE_SQL_DB:
        if not email.strip():
            return jsonify({"ok": False, "error": "E-poçt yazın."}), 400
    elif not validate_email(email):
        return jsonify({"ok": False, "error": "E-poçt düzgün deyil."}), 400
    ok, msg = validate_password_strength(password)
    if not ok:
        return jsonify({"ok": False, "error": msg}), 400
    if password != password2:
        return jsonify({"ok": False, "error": "Parollar üst-üstə düşmür."}), 400

    pw_hash = generate_password_hash(password)
    if INSECURE_SQL_DB:
        ok_ins, err = _user_insert_concat(email.lower(), pw_hash, full_name)
    else:
        ok_ins, err = user_insert(email.lower(), pw_hash, full_name)
    if not ok_ins:
        return jsonify({"ok": False, "error": err or "Qeydiyyat alınmadı."}), 400

    return jsonify(
        {
            "ok": True,
            "message": "Qeydiyyat tamamlandı. Biletlər və bildirişlər üçün hesaba daxil ola bilərsiniz.",
        }
    )


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or {}
    email_raw = (data.get("email") or "").strip()
    email = email_raw.lower()
    password = data.get("password") or ""

    ok_in, err_in = login_input_bounds(email, password)
    if not ok_in:
        return jsonify({"ok": False, "error": err_in}), 400

    if INSECURE_SQL_DB:
        if not email:
            return jsonify({"ok": False, "error": "E-poçt yazın."}), 400
        if not DEV_AUTH_BYPASS and not password:
            return jsonify({"ok": False, "error": "Parol yazın."}), 400
    elif not validate_email(email) or not password:
        return jsonify({"ok": False, "error": "E-poçt və parol yazın."}), 400

    if INSECURE_SQL_DB:
        row = _user_lookup_concat(email_raw)
    else:
        row = user_get_by_email(email)
    if row is None:
        return jsonify({"ok": False, "error": "E-poçt və ya parol səhvdir."}), 401

    if INSECURE_SQL_DB and DEV_AUTH_BYPASS:
        pw_ok = True
    else:
        ph = row.get("password_hash")
        try:
            pw_ok = bool(ph) and check_password_hash(str(ph), password)
        except (TypeError, ValueError):
            pw_ok = False
    if not pw_ok:
        return jsonify({"ok": False, "error": "E-poçt və ya parol səhvdir."}), 401

    db_user = user_get_by_id(row["id"])
    # UNION ilə saxta id: DB-də yoxdur — sessiya yaratmırıq; yalnız cavabda sorğu sətri (lab exfil)
    if db_user is None:
        probe_user: Dict[str, Any] = {}
        if hasattr(row, "keys"):
            for k in row.keys():
                probe_user[k] = row[k]
        else:
            probe_user = dict(row)
        for k, v in list(probe_user.items()):
            if hasattr(v, "isoformat"):
                probe_user[k] = v.isoformat()
            elif v is not None and not isinstance(v, (str, int, float, bool)):
                probe_user[k] = str(v)
        frag = email_raw.replace("\r", " ").replace("\n", " ")
        if len(frag) > 280:
            frag = frag[:277] + "..."
        return jsonify(
            {
                "ok": True,
                "message": "",
                "user": probe_user,
                "session_created": False,
                "query_probe": True,
                "db": DB_MODE,
                "sql_fragment": frag,
            }
        )

    session["user_id"] = row["id"]
    session["email"] = row["email"]
    session["full_name"] = row["full_name"] or ""

    return jsonify(
        {
            "ok": True,
            "message": "Xoş gəldiniz!",
            "user": db_user,
            "session_created": True,
        }
    )


@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/me", methods=["GET"])
def api_me():
    if "user_id" not in session:
        return jsonify({"ok": False, "logged_in": False})
    row = user_get_by_id(session["user_id"])
    if row is None:
        session.clear()
        return jsonify({"ok": False, "logged_in": False, "error": "İstifadəçi DB-də tapılmadı."})
    session["email"] = row["email"]
    session["full_name"] = row["full_name"]
    return jsonify(
        {
            "ok": True,
            "logged_in": True,
            "user": row,
        }
    )


@app.route("/api/me/bookings", methods=["GET"])
def api_me_bookings():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Daxil olun."}), 401
    _ok, bookings = user_bookings_for_user(session["user_id"])
    return jsonify({"ok": True, "bookings": bookings})


@app.route("/api/me/profile", methods=["PATCH"])
def api_me_profile():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Daxil olun."}), 401
    data = request.get_json(silent=True) or {}
    about = data.get("about_me")
    if about is None:
        return jsonify({"ok": False, "error": "about_me göndərin."}), 400
    if not isinstance(about, str):
        about = str(about)
    if len(about) > 100000:
        return jsonify({"ok": False, "error": "Mətn çox uzundur."}), 400
    user_update_about_me(session["user_id"], about)
    row = user_get_by_id(session["user_id"])
    return jsonify({"ok": True, "user": row})


@app.route("/api/upload", methods=["POST"])
def api_upload():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Daxil olun."}), 401
    f = request.files.get("file")
    if not f:
        return jsonify({"ok": False, "error": "Fayl seçin."}), 400
    orig = f.filename or "file"
    unsafe_name = orig.replace("\\", "/").split("/")[-1]
    if not unsafe_name or unsafe_name in (".", ".."):
        return jsonify({"ok": False, "error": "Fayl adı uyğun deyil."}), 400
        
    # Təhlükəsizlik Yaması: Yalnız icazə verilən fayllar yüklənə bilər (XSS/RCE qorunması)
    allowed_extensions = {".png", ".jpg", ".jpeg", ".pdf"}
    import os
    ext = os.path.splitext(unsafe_name)[1].lower()
    if ext not in allowed_extensions:
        return jsonify({"ok": False, "error": f"Faylın növünə icazə verilmir ({ext}). Yalnız JPG, PNG, PDF."}), 400

    dest_path = UPLOAD_DIR / unsafe_name
    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        f.save(str(dest_path))
    except OSError:
        return jsonify(
            {"ok": False, "error": "Fayl saxlanılmadı (server fayl sistemi)."}
        ), 500
    uid = session["user_id"]
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO user_uploads (user_id, original_name, stored_name) VALUES (%s,%s,%s)",
        (uid, orig, unsafe_name),
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(
        {
            "ok": True,
            "url": "/uploads/" + unsafe_name.replace("\\", "/"),
            "name": unsafe_name,
        }
    )


@app.route("/api/uploads/mine", methods=["GET"])
def api_uploads_mine():
    if "user_id" not in session:
        return jsonify({"ok": False}), 401
    items = user_uploads_list(session["user_id"])
    for it in items:
        it["url"] = "/uploads/" + str(it.get("stored_name", "")).replace("\\", "/")
    return jsonify({"ok": True, "uploads": items})


@app.route("/api/admin/reports", methods=["GET"])
def api_admin_reports():
    """Hesabat: Admin hüququ yoxlanılır."""
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Daxil olun."}), 401
    
    # Sadə admin yoxlaması: Yalnız müəyyən email adminlik roluna sahibdir
    if session.get("email") != "admin@aviakassa.com":
        return jsonify({"ok": False, "error": "Bu səhifəyə daxil olmaq üçün admin hüququnuz yoxdur."}), 403

    ok, data = admin_reports_data()
    if not ok:
        return jsonify({"ok": True, **data})
    return jsonify({"ok": True, **data})


@app.route("/api/transactions/<int:tid>", methods=["GET"])
def api_transaction_by_id(tid: int):
    """Tək sifariş — IDOR düzəlişi: yalnız o istifadəçinin öz sifarişi yoxlanılır."""
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Daxil olun."}), 401
    uid = session["user_id"]
    conn = get_db_postgres()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT t.id, t.user_id, u.email AS user_email, t.flight_id, f.code AS flight_code,
               t.amount, t.status, t.created_at
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        JOIN flights f ON f.id = t.flight_id
        WHERE t.id = %s AND t.user_id = %s
        """,
        (tid, uid),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row is None:
        return jsonify({"ok": False, "error": "Tapılmadı və ya icazəniz yoxdur."}), 404
    tr = dict(row)
    tr["created_at"] = _serialize_created_at(tr.get("created_at"))
    return jsonify({"ok": True, "transaction": tr})


@app.route("/uploads/<path:filename>")
def serve_uploads(filename: str):
    return send_from_directory(UPLOAD_DIR, filename)


@app.route("/api/health", methods=["GET"])
def api_health():
    """PostgreSQL qoşulmasını yoxlayır."""
    out: Dict[str, Any] = {"ok": True, "db": "postgres"}
    try:
        conn = get_db_postgres()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        out["reachable"] = True
    except Exception as ex:
        out["ok"] = False
        out["reachable"] = False
        out["error"] = str(ex)
    return jsonify(out)


@app.route("/", defaults={"path": "login.html"})
@app.route("/<path:path>")
def serve_file(path):
    if path.startswith("api/"):
        return "Tapılmadı", 404
    allowed_suffix = {".html", ".css", ".js", ".jpg", ".jpeg", ".png", ".ico", ".svg"}
    safe_path = (FRONTEND_DIR / path).resolve()
    try:
        safe_path.relative_to(FRONTEND_DIR.resolve())
    except ValueError:
        return "Forbidden", 403
    if not safe_path.is_file():
        return "Tapılmadı", 404
    if safe_path.suffix.lower() not in allowed_suffix:
        return "Forbidden", 403
    return send_from_directory(FRONTEND_DIR, path)


if __name__ == "__main__":
    print("DB: PostgreSQL (DATABASE_URL)")
    print("WEBSEC_LAB:", _LAB, "| Zəif SQL (lab):", INSECURE_SQL_DB, "| Auth bypass (lab):", DEV_AUTH_BYPASS)
    print("Frontend:", FRONTEND_DIR)
    print("Açın: http://127.0.0.1:5000/panel.html (və ya login.html)")
    app.run(host="127.0.0.1", port=5000, debug=True)
