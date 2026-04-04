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
6. [Nəzərdə tutulmuş təhlükəsizlik “boşluqları” (lab)](#6-nəzərdə-tutulmuş-təhlükəsizlik-boşluqları-lab) — risklər, mitiqasiya, təhlükəsiz kod nümunələri  
7. [Təhlükəsizlik yamaları və yaxşı təcrübələr](#7-təhlükəsizlik-yamaları-və-yaxşı-təcrübələr) — xülasə cədvəl  
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

**Nəzərdə tutulmuş “boşluqlar” nədir?** Bu, tədris üçün **bilərəkdən** saxlanılan zəifliklər və ya məhdud müdafiədir: məqsəd real kodda hücum vektorunu və **düzgün yama** (parametrləşdirmə, sanitasiya, RBAC) arasındakı fərqi göstərməkdir. `WEBSEC_LAB=0` və ya ayrıca `DEV_INSECURE_SQL=0`, `DEV_AUTH_BYPASS=0` ilə lab söndürüldükdə tətbiq əsasən təhlükəsiz yolları istifadə edir.

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

| Tərəf | Texnologiya |
|---------|---------------|
| Backend | Python 3, Flask |
| Verilənlər bazası | PostgreSQL (`psycopg2`, `RealDictCursor`) |
| Frontend | Vanilla JS, HTML (`login`, `register`, `panel`, `admin`, `aviakassa`), `lang.js` (AZ/RU/EN) |
| Konfiqurasiya | `.env`, `python-dotenv` |
| Deploy (istəyə bağlı) | Vercel serverless, `api/index.py` girişi |

---

## 3. Layihənin qurulması

### 3.1. Qovluq strukturu

```
WebSec/
├── api/index.py
├── backend/app.py
├── backend/neon_rebuild_public_schema.sql   # istəyə bağlı DB reset
├── frontend/
├── uploads/                  # lokal; git-ə düşmür
├── vercel.json
├── requirements.txt
├── .env.example
├── README.md
└── REPORT.md
```

### 3.2. İşə salma (lokal)

Asılılıqlar:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
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

Bu bölmədə **boşluq** dedikdə OWASP kontekstində risk (zəiflik və ya məhdud müdafiə) nəzərdə tutulur. Layihənin məqsədi bu riskləri **şərh etmək**, **mitiqasiya** üsullarını göstərmək və **təhlükəsiz kod** nümunələri ilə müqayisə etməkdir — **istehsal üçün təkrarlanan nümunə deyil**.

### 6.0. Lab rejimi: mühit dəyişənləri

| Dəyişən | Təsir |
|--------|--------|
| `WEBSEC_LAB=1` (defolt) | Ümumi lab rejimi; `DEV_INSECURE_SQL` / `DEV_AUTH_BYPASS` ilə birləşə bilər |
| `WEBSEC_LAB=0` | Ümumi lab söndürülür (ətraflı bayraqlar `.env.example`-da) |
| `DEV_INSECURE_SQL` | `True` olanda `_user_lookup_concat` / `_user_insert_concat` aktiv |
| `DEV_AUTH_BYPASS` | `True` olanda (yalnız zəif SQL yolu ilə) parol hash yoxlanılmır |

**Mitiqasiya (ümumi):** istehsalda `WEBSEC_LAB=0`, `DEV_INSECURE_SQL=0`, `DEV_AUTH_BYPASS=0` və bütün sorğuların parametrləşdirilmiş yolu ilə işləməsi.

### 6.1. SQL injection (dinamik SQL / sətir birləşdirməsi)

**Təsvir:** İstifadəçi girişi sorğu mətninə birbaşa birləşdirilir (`WHERE email = '` + `email` + `'`). Bu, **OWASP A03:2021 — Injection** sinfinə düşür.

**Hücum ssenarisi (qısa):** Giriş sahəsinə `'` ilə sintaksı pozmaq, `OR 1=1--`, `UNION SELECT ...` ilə əlavə sətirlər çıxarmaq və s.

**Layihədə niyə var:** `_user_lookup_concat` və `_user_insert_concat` yalnız `DEV_INSECURE_SQL` aktiv olanda işləyir; təhlükəsiz yol `user_get_by_email` / `user_insert`-dir.

**Zəif kod (lab):**

```python
# backend/app.py — yalnız lab üçün
sql = "SELECT ... WHERE email = '" + email + "'"
cur.execute(sql)
```

**Təhlükəsiz kod (parametrləşdirmə — psycopg2):**

```python
cur.execute(
    "SELECT id, email, password_hash, full_name FROM users WHERE lower(email) = %s",
    (email_lower,),
)
```

**Əlavə mitiqasiya:** heç vaxt istifadəçi mətnini sorğuya formatlaşdırma ilə tökməyin; prepared statement / `%s` placeholder; ORM (SQLAlchemy) ilə avtomatik parametrləşmə.

Qeydiyyatda eyni prinsip: lab-da `_user_insert_concat`, təhlükəsiz yolda `user_insert(..., (email_lower, password_hash, full_name))`.

### 6.2. Autentifikasiyanın lab üzrə zəiflədilməsi (parol bypass)

**Təsvir:** `INSECURE_SQL_DB and DEV_AUTH_BYPASS` olanda `pw_ok = True` — parol yoxlanılmır. Bu, SQLi ilə saxta sətir gətirdikdə sessiyanın təhlükəsizliyini tam sındırmaq üçün **yalnız lab** üçündür.

**Mitiqasiya:** istehsalda bu şərti **silin** və ya heç vaxt `True` olmayın; hər uğurlu girişdə `check_password_hash` məcbur olsun. İki faktorlu autentifikasiya (2FA) əlavə etmək ayrıca möhkəmləndirmədir.

```python
# Təhlükəsiz nümunə (məntiqi)
ph = row.get("password_hash")
pw_ok = bool(ph) and check_password_hash(str(ph), password)
```

### 6.3. Məlumatın ifşası (information disclosure) — `query_probe`

**Təsvir:** `UNION` nəticəsində `user_get_by_id` boş qalarsa, API JSON-da `user`, `sql_fragment`, `query_probe` qaytarılır — bu, real sistemdə **xəta mesajı / debug** sızması kimidir.

**Mitiqasiya:**

- İstehsalda ümumi mesaj: *“Giriş uğursuzdur”*; texniki detal yalnız server loqunda (və PII-siz).
- `sql_fragment` və saxta `user` obyektini cavabdan çıxarmaq.
- `DEBUG=False`, xəta idarəetməsi ilə HTML trace-in istifadəçiyə düşməməsi.

### 6.4. Zəif idarəetmə / “admin” yoxlaması

**Təsvir:** `session.get("email") == "admin@aviakassa.com"` — tək e-poçt üzrə adminlik; **rol cədvəli**, icazə siyahısı, audit yoxdur (OWASP **Broken Access Control** riski).

**Mitiqasiya (nümunə məntiqi):**

```sql
-- users və ya ayrıca cədvəl
-- role IN ('admin','user') yoxlaması server tərəfdə
```

```python
# Pseudokod
def user_has_role(user_id: int, role: str) -> bool:
    cur.execute("SELECT 1 FROM user_roles WHERE user_id = %s AND role = %s", (user_id, role))
    return cur.fetchone() is not None
```

Həmçinin admin əməliyyatları üçün **ayrı sessiya müddəti**, **IP məhdudiyyəti** və **log** tövsiyə olunur.

### 6.5. IDOR-un aradan qaldırılması (nümunə — düzgün nümunə)

`/api/transactions/<id>` sorğusunda `WHERE t.id = %s AND t.user_id = %s` ilə yalnız **cari sessiya** istifadəçisinin sifarişi qaytarılır. Bu, **pozitiv nümunədir**: başqa istifadəçinin `id`-si ilə məlumat sızmır.

### 6.6. Saxlanmış XSS (profil / `about_me` + `innerHTML`)

**Təsvir:** `about_me` serverdə saxlanılır, `api_me_profile` HTML sanitasiya etmir; `panel.js`-də `renderPreview` üçün `previewEl.innerHTML = html` istifadə olunarsa, `<script>` və ya hadisə atributları ilə **XSS** mümkündür (OWASP **A03** / **CWE-79**).

**Mitiqasiya — server tərəfi (məzmunu saxlamazdan əvvəl):**

```python
import bleach

ALLOWED_TAGS = ["b", "i", "em", "strong", "a", "p", "br"]
ALLOWED_ATTRS = {"a": ["href", "title"]}

def sanitize_profile_html(raw: str) -> str:
    return bleach.clean(raw, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)
```

Sonra `user_update_about_me(..., sanitize_profile_html(about))`.

**Mitiqasiya — client tərəfi:** önizlmə üçün `textContent` və ya `DOMPurify.sanitize()`; istifadəçi mətnini heç vaxt təmizlənməmiş `innerHTML`-ə yazmayın.

### 6.7. Fayl yükləmə

**Təsvir:** Genişləmə yoxlaması var (`.png`, `.jpg`, `.jpeg`, `.pdf`), lakin fayl adı istifadəçidən gəlir və saxlanma adı ilə toqquşma riski qalır; PDF/HTML faylın özündə skriptlər ola bilər (kontekstdən asılı təhlükə).

**Mitiqasiya:**

- Saxlanma adı: `uuid.uuid4().hex + ext` — orijinal ad yalnız metadata.
- Məzmun yoxlaması: `python-magic` və ya PIL ilə şəkil açma testi.
- `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`, mümkünsə ayrı domen (upload CDN).

---

## 7. Təhlükəsizlik yamaları və yaxşı təcrübələr (xülasə)

Aşağıdakılar layihədə **artıq qismən** tətbiq olunub; tam istehsal siyahısı daha genişdir.

| Tədbir | Layihədə | Tövsiyə |
|--------|----------|---------|
| Parametrləşdirilmiş SQL | `user_get_by_email`, `user_insert`, əksər sorğular | Lab söndür; bütün sorğular `%s` / ORM |
| Parol hash | `werkzeug.security` | Bcrypt/Argon2 müzakirəsi; heç vaxt plain text |
| Sessiya çərəzi | Vercel-də `Secure`, `HttpOnly`, `SameSite` | `SESSION_COOKIE_SECURE` yalnız HTTPS |
| Statik fayl | `relative_to(FRONTEND_DIR)` | Fayl siyahısı whitelist |
| SQLi UI demo | `auth.js`-də `textContent` ilə sızıntı mətni | İstehsalda belə blok olmamalı |
| Profil mətni | Sanitasiya yoxdur (lab) | `bleach` və ya yalnız mətn |
| Admin | E-poçt siyahısı | Rol + icazə modeli |

**Nümunə — yalnız təhlükəsiz yol ilə giriş (məntiqi bərpa):**

```python
# Login axını — lab olmadan
row = user_get_by_email(email)  # daxildə parametrləşdirilmiş SELECT
if row is None or not check_password_hash(row["password_hash"], password):
    return jsonify({"ok": False, "error": "..."}), 401
session["user_id"] = row["id"]
# query_probe və ya sql_fragment cavabda olmamalıdır
```

---

## 8. Deploy (Vercel və bulud PostgreSQL)

- `vercel.json` bütün sorğuları Flask funksiyasına yönləndirir.
- `api/index.py` `from backend.app import app` ixrac edir.
- Lokal PostgreSQL Vercel-dən əlçatan deyil; **Supabase/Neon** kimi bulud `DATABASE_URL` istifadə edilməlidir.
- Ətraflı: layihə `README.md` faylında.

---

## 9. Demo şəkilləri

Hesabat üçün lazım olan ekran görüntülərini (giriş, qeydiyyat, `aviakassa`, panel, admin, lab nümunəsi, `/api/health`, və s.) öz üzrənizə əlavə edin — Markdown-da `![Alt](fayl.png)` istifadə edə bilərsiniz.

---

## 10. Nəticə və tövsiyələr

Layihə Flask + PostgreSQL üzərində tamstack veb tətbiq və **tədris məqsədli** zəiflik nümunələrini birləşdirir. Real mühitdə:

- `DEV_INSECURE_SQL`, `DEV_AUTH_BYPASS`, `WEBSEC_LAB` **söndürülməli** və ya silinməlidir;
- bütün SQL sorğuları **parametrləşdirilməli**;
- admin və fayl yükləmə **RBAC**, audit log və məzmun təhlükəsizliyi ilə möhkəmləndirilməlidir;
- sızmaların **ekranda göstərilməsi** aradan qaldırılmalıdır.

---

## 11. İstinadlar

- Flask: https://flask.palletsprojects.com/  
- PostgreSQL: https://www.postgresql.org/docs/  
- OWASP Top 10: https://owasp.org/www-project-top-ten/  
- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection  
- OWASP XSS: https://owasp.org/www-community/attacks/xss/  
- Vercel Flask: https://vercel.com/docs/frameworks/backend/flask  

---

*Hesabatın hazırlanma tarixi: 2026. Bu sənəd tədris məqsədilədir; kod nümunələri layihə fayllarından götürülüb.*
