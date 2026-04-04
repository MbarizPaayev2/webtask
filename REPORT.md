# Web təhlükəsizliyi fənni — layihə hesabatı

**Layihə adı:** Aviakassa (WebSec)  
**Məzmun:** Bilet axtarışı kontekstində veb tətbiq, PostgreSQL, Flask API və təhlükəsizlik labı ssenariləri  

---

## Mündəricat

1. [Giriş və məqsəd](#1-giriş-və-məqsəd)  
2. [Arxitektura və texnologiyalar](#2-arxitektura-və-texnologiyalar)  
3. [Layihənin qurulması](#3-layihənin-qurulması)  
4. [Backend: əsas komponentlər](#4-backend-əsas-komponentlər)  
5. [Frontend](#5-frontend)  
6. [Nəzərdə tutulmuş təhlükəsizlik “boşluqları” (lab)](#6-nəzərdə-tutulmuş-təhlükəsizlik-boşluqları-lab)  
7. [Təhlükəsizlik yamaları və yaxşı təcrübələr](#7-təhlükəsizlik-yamaları-və-yaxşı-təcrübələr)  
8. [Deploy (Vercel və bulud PostgreSQL)](#8-deploy-vercel-və-bulud-postgresql)  
9. [Demo şəkilləri](#9-demo-şəkilləri)  
10. [Nəticə və tövsiyələr](#10-nəticə-və-tövsiyələr)  
11. [İstinadlar](#11-istinadlar)  

---

## 1. Giriş və məqsəd

Bu layihə veb təhlükəsizliyi kursu çərçivəsində hazırlanmışdır. Məqsəd:

- real veb stack (Flask + PostgreSQL + statik frontend) üzərində **giriş/qeydiyyat**, **sessiya**, **REST API** qurmaq;
- **tədris məqsədli** zəiflikləri (SQL injection, sessiya ilə bağlı ssenarilər, idarəetmə və s.) nümayiş etdirmək və müqayisəli olaraq **parametrləşdirilmiş sorğular** və **giriş yoxlamaları** ilə fərqi göstərmək;
- müəyyən **UI** üzərindən sızıntıların istifadəçiyə necə təqdim oluna biləcəyini təsvir etmək (simulyasiya).

Layihə **istehsal üçün hazır deyil**; təhlükəsizlik labı rejimi mühit dəyişənləri ilə idarə olunur.

---

## 2. Arxitektura və texnologiyalar

### 2.1. Ümumi sxem

```mermaid
flowchart LR
  subgraph client [Brauzer]
    HTML[HTML/CSS/JS]
  end
  subgraph server [Flask]
    API["/api/*"]
    Static[Statik səhifələr]
  end
  subgraph data [PostgreSQL]
    DB[(users, flights, ...)]
  end
  HTML --> API
  HTML --> Static
  API --> DB
```

### 2.2. Texnologiyalar

| Təbibət | Texnologiya |
|---------|---------------|
| Backend | Python 3, Flask |
| Verilənlər bazası | PostgreSQL (`psycopg2`, `RealDictCursor`) |
| Frontend | Vanilla JS, bir səhifəli HTML (`login`, `register`, `panel`, `admin`, `aviakassa`) |
| Konfiqurasiya | `.env`, `python-dotenv` |
| Deploy (istəyə bağlı) | Vercel serverless, `api/index.py` girişi |

---

## 3. Layihənin qurulması

### 3.1. Qovluq strukturu

```
WebSec/
├── api/index.py          # Vercel üçün Flask ixracı
├── backend/
│   ├── app.py            # Əsas tətbiq
│   ├── requirements.txt
│   └── postgres_setup.sql
├── frontend/             # HTML, CSS, JS, şəkillər
├── uploads/              # Yükləmələr (lokal; git-ə düşmür)
├── vercel.json
├── requirements.txt      # Vercel pip
├── .env.example
└── README.md
```

### 3.2. İşə salma (lokal)

Asılılıqlar:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
```

Mühit dəyişənləri (`.env`):

```env
FLASK_SECRET_KEY=uzun-tesadufi-acar
DATABASE_URL=postgresql://istifadəçi:parol@localhost:5432/verilanlar
```

Server:

```bash
python backend/app.py
```

Defolt ünvan: `http://127.0.0.1:5000/`.

---

## 4. Backend: əsas komponentlər

### 4.1. Flask tətbiqi və yollar

`Flask` instance yaradılır, `FRONTEND_DIR` və `UPLOAD_DIR` təyin edilir, sessiya üçün `secret_key` oxunur:

```python
# backend/app.py (fragment)
app = Flask(__name__)
# Təhlükəsizlik yaması: default olaraq təsadüfi gizli açar (Secret Key)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or os.urandom(24)

if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
```

### 4.2. PostgreSQL qoşulması

`DATABASE_URL` mühit dəyişənindən oxunur. Vercel mühitində boş olanda lokal kimi `sys.exit` çağırılmır; bulud üçün SSL parametri avtomatik əlavə olunur:

```python
# backend/app.py — _effective_database_url()
def _effective_database_url() -> str:
    """Bulud Postgres (Neon, Supabase və s.) üçün SSL; Vercel-dən qoşulmada sslmode tez-tez lazımdır."""
    if not DATABASE_URL:
        return ""
    if not _is_vercel_runtime():
        return DATABASE_URL
    parsed = urlparse(DATABASE_URL)
    qs = parse_qs(parsed.query)
    keys_lower = {k.lower() for k in qs}
    if "sslmode" not in keys_lower:
        qs["sslmode"] = ["require"]
    new_query = urlencode(qs, doseq=True)
    return urlunparse(parsed._replace(query=new_query))
```

```python
# backend/app.py — get_db_postgres()
def get_db_postgres():
    import psycopg2
    from psycopg2.extras import RealDictCursor

    dsn = _effective_database_url()
    if not dsn:
        raise RuntimeError("DATABASE_URL təyin edilməyib — Vercel Environment Variables əlavə edin.")
    kwargs: Dict[str, Any] = {"cursor_factory": RealDictCursor}
    if _is_vercel_runtime():
        kwargs["connect_timeout"] = 15
    return psycopg2.connect(dsn, **kwargs)
```

### 4.3. Lab rejimi bayraqları

`WEBSEC_LAB`, `DEV_INSECURE_SQL`, `DEV_AUTH_BYPASS` kimi dəyişənlər zəif SQL və parol yoxlamasını idarə edir:

```python
# backend/app.py — lab bayraqları
# Köhnə env adları: SQLI_LAB → DEV_INSECURE_SQL, SQLI_LAB_SKIP_PASSWORD → DEV_AUTH_BYPASS
# WEBSEC_LAB=1 (default) olduqda həm zəif SQL, həm parol bypass lab üçün aktiv ola bilər
_LAB = _websec_lab_on()
DEV_INSECURE_SQL = _env_flag("DEV_INSECURE_SQL", "SQLI_LAB") or _LAB
INSECURE_SQL_DB = DEV_INSECURE_SQL
DEV_AUTH_BYPASS = _env_flag("DEV_AUTH_BYPASS", "SQLI_LAB_SKIP_PASSWORD") or _LAB
```

### 4.4. Statik faylların verilməsi

Bütün HTML/CSS/JS `frontend/` qovluğundan path traversal əleyhinə yoxlama ilə verilir:

```python
# backend/app.py — serve_file()
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
```

---

## 5. Frontend

- **`auth.js`**: giriş/qeydiyyat `fetch("/api/login")`, `fetch("/api/register")`, korporativ e-poçt üçün yumşaq validasiya.
- **SQLi nəticəsi simulyasiyası**: serverdən gələn `user` və `sql_fragment` ilə **PostgreSQL xətası oxşar** mətn `pre` elementində, `textContent` ilə (XSS-dən qaçmaq üçün).

```javascript
// frontend/auth.js — buildDbErrorLeakText / showLoginProbe
  function buildDbErrorLeakText(user, sqlFragment) {
    var frag = sqlFragment != null && String(sqlFragment).length ? String(sqlFragment) : "…";
    var lines = [];
    lines.push('psycopg2.errors.SyntaxError: syntax error at or near "\'"');
    lines.push("");
    lines.push("SQLSTATE: 42601");
    lines.push("");
    var line1 =
      "LINE 1: SELECT id, email, password_hash, full_name FROM users WHERE email = '" + frag + "'";
    lines.push(line1);
    var caretCol = Math.min(100, Math.max(8, line1.length - 3));
    lines.push(new Array(caretCol + 1).join(" ") + "^");
    lines.push("");
    lines.push(
      "DETAIL: An error occurred while parsing the query. Column names visible in failing context: id, email, password_hash, full_name."
    );
    lines.push("");
    lines.push("CONTEXT: last retrieved tuple (application debug / verbose errors enabled):");
    Object.keys(user).forEach(function (key) {
      var v = user[key];
      var s = v == null ? "NULL" : String(v);
      if (s.length > 120) s = s.slice(0, 117) + "...";
      lines.push("  " + key + " = " + s);
    });
    lines.push("");
    lines.push('HINT: Check string literals; see also "syntax error near" in PostgreSQL documentation.');
    return lines.join("\n");
  }

  function showLoginProbe(user, sqlFragment) {
    var el = document.getElementById("login-pg-result");
    if (!el || !user || typeof user !== "object") return;
    el.hidden = false;
    el.innerHTML = "";
    el.className = "login-pg-result login-pg-result--db-leak";
    el.setAttribute("role", "alert");
    el.setAttribute("aria-label", "Verilənlər bazası xətası");

    var pre = document.createElement("pre");
    pre.className = "login-pg-result__leak";
    pre.textContent = buildDbErrorLeakText(user, sqlFragment);
    el.appendChild(pre);
  }
```

---

## 6. Nəzərdə tutulmuş təhlükəsizlik “boşluqları” (lab)

Aşağıdakılar **tədris məqsədilə** kodda mövcuddur və mühit dəyişənləri ilə söndürülə bilər.

### 6.1. SQL injection (sətir birləşdirməsi)

**Səbəb:** İstifadəçi girişi birbaşa SQL mətninə birləşdirilir; parametrləşdirilmiş sorğu əvəzinə string konkatenasiya.

```python
# backend/app.py — _user_lookup_concat (SQLi lab)
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
```

**Nəticə:** Hücumçu `UNION` və s. ilə sorğunu dəyişə bilər. Təhlükəsiz alternativ: `cur.execute("... WHERE email = %s", (email,))`.

Qeydiyyatda oxşar birləşdirmə `_user_insert_concat` ilə mövcuddur.

### 6.2. Lab üçün parol yoxlamasının keçilməsi

`DEV_AUTH_BYPASS` aktiv olanda parol hash yoxlanılmır:

```python
# backend/app.py — api_login (parol yoxlaması)
    if INSECURE_SQL_DB and DEV_AUTH_BYPASS:
        pw_ok = True
    else:
        pw_ok = check_password_hash(row["password_hash"], password)
```

Bu, yalnız lab mühitində SQLi payload ilə sınaq üçün məntiqlidir; istehsalda **söndürülməlidir**.

### 6.3. Sorğu nəticəsinin cavabda qaytarılması

Əgər `user_get_by_id(row["id"])` boşdursa (məsələn saxta `id` ilə `UNION`), sessiya yazılmır, lakin cavabda sorğudan gələn sətir (və `sql_fragment`) qaytarılır — tədris üçün məlumat axını nümayişi:

```python
# backend/app.py — query_probe cavabı
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
```

### 6.4. Zəif admin idarəetməsi

Admin API yalnız sessiyadakı e-poçtun `admin@aviakassa.com` olması ilə məhdudlaşır — real RBAC və ya rol cədvəli yoxdur:

```python
# backend/app.py — api_admin_reports
@app.route("/api/admin/reports", methods=["GET"])
def api_admin_reports():
    """Hesabat: Admin hüququ yoxlanılır."""
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Daxil olun."}), 401
    
    # Sadə admin yoxlaması: Yalnız müəyyən email adminlik roluna sahibdir
    if session.get("email") != "admin@aviakassa.com":
        return jsonify({"ok": False, "error": "Bu səhifəyə daxil olmaq üçün admin hüququnuz yoxdur."}), 403

    ok, data = admin_reports_data()
```

### 6.5. IDOR-un müəyyən qədər aradan qaldırılması (müqayisə üçün)

Tək sifariş endpointi **cari istifadəçi** ilə məhdudlaşdır:

```python
# backend/app.py — api_transaction_by_id (IDOR mühafizəsi)
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
```

### 6.6. Profil / XSS konteksti (frontend)

`panel.js` içində imza mətni üçün `innerHTML` ilə önizlmə istifadə olunursa, saxlanmış XSS ssenariləri üçün risk müzakirə oluna bilər (məzmun serverdən gələndə sanitasiya vacibdir).

### 6.7. Fayl yükləmə

Yalnız müəyyən genişləmələrə icazə verilir (yama mətnində qeyd olunub); fayl adı təmizlənir, lakin istehsalda əlavə yoxlamalar tələb oluna bilər.

---

## 7. Təhlükəsizlik yamaları və yaxşı təcrübələr

- **Parametrləşdirilmiş sorğular** (`user_get_by_email`, `user_insert` və s.) lab söndürüldükdə istifadə olunur.
- **Parol hash** — `werkzeug.security`.
- **Sessiya** — Vercel-də `Secure` çərəz.
- **Statik fayl path traversal** — `relative_to` yoxlaması.
- **Frontend** — SQLi demo üçün məlumat `textContent` ilə verilir.

---

## 8. Deploy (Vercel və bulud PostgreSQL)

- `vercel.json` bütün sorğuları Flask funksiyasına yönləndirir.
- `api/index.py` `from backend.app import app` ixrac edir.
- Lokal PostgreSQL Vercel-dən əlçatan deyil; **Supabase/Neon** kimi bulud `DATABASE_URL` istifadə edilməlidir.
- Ətraflı: layihə `README.md` faylında.

---

## 9. Demo şəkilləri

Aşağıda hesabatda istifadə üçün **placeholder** bölmələr var. Öz ekran görüntülərinizi `docs/report-screenshots/` qovluğuna əlavə edin və fayl adlarını uyğunlaşdırın.

| № | Təsvir | Fayl (tövsiyə) |
|---|--------|----------------|
| 1 | Giriş səhifəsi (ümumi görünüş) | `docs/report-screenshots/01-giris.png` |
| 2 | Qeydiyyat səhifəsi | `docs/report-screenshots/02-qeydiyyat.png` |
| 3 | Uçuş axtarışı (`aviakassa.html`) | `docs/report-screenshots/03-aviakassa.png` |
| 4 | İstifadəçi paneli | `docs/report-screenshots/04-panel.png` |
| 5 | Admin hesabatı (icazəli hesabla) | `docs/report-screenshots/05-admin.png` |
| 6 | SQLi lab: cavabda “VB xətası” oxşar blok | `docs/report-screenshots/06-sqli-ui.png` |
| 7 | `/api/health` və ya şəbəkə tabında JSON cavab | `docs/report-screenshots/07-api-health.png` |
| 8 | Vercel layihə səhifəsi (istəyə bağlı) | `docs/report-screenshots/08-vercel.png` |

**Nümunə (Markdown):** şəkillər əlavə edildikdən sonra:

```markdown
![Giriş](docs/report-screenshots/01-giris.png)
*Şəkil 1. Giriş səhifəsi*
```

Hazırda fayllar mövcud olmadığı üçün yuxarıdakı cədvəl kifayətdir; PDF çap edərkən şəkilləri birbaşa Word/LaTeX-ə də daxil edə bilərsiniz.

---

## 10. Nəticə və tövsiyələr

Layihə Flask + PostgreSQL üzərində tamstack veb tətbiq və **tədris məqsədli** zəiflik nümunələrini birləşdirir. Real mühitdə:

- `DEV_INSECURE_SQL`, `DEV_AUTH_BYPASS`, `WEBSEC_LAB` **söndürülməli** və ya silinməlidir;
- bütün SQL sorğuları **parametrləşdirilməli**;
- admin və fayl yükləmə **RBAC**, audit log və məzmun təhlükəsizliyi** ilə möhkəmləndirilməlidir;
- sızmaların **ekranda göstərilməsi** aradan qaldırılmalıdır.

---

## 11. İstinadlar

- Flask: https://flask.palletsprojects.com/  
- PostgreSQL: https://www.postgresql.org/docs/  
- OWASP Top 10: https://owasp.org/www-project-top-ten/  
- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection  
- Vercel Flask: https://vercel.com/docs/frameworks/backend/flask  

---

*Hesabatın hazırlanma tarixi: 2026. Bu sənəd tədris məqsədilədir; kod nümunələri layihə fayllarından götürülüb.*
