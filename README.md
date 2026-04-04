# Aviakassa — Web təhlükəsizliyi layihəsi

Biletlər və istifadəçi hesabları ətrafında qurulmuş tamstack nümunə: statik frontend, Flask REST API və PostgreSQL verilənlər bazası.

## İmkanlar

- İstifadəçi **qeydiyyatı** və **girişi** (sessiya əsaslı)
- **Uçuş axtarışı** interfeysi (`aviakassa.html`)
- Giriş sonrası **şəxsi panel** (profil, yükləmələr, rezervasiyalar)
- **İdarəetmə hesabatı** səhifəsi (`admin.html`)
- **Çoxdilli interfeys**: Azərbaycan, rus, ingilis (`frontend/lang.js`, `localStorage` açarı `aviakassa_lang`)

## Texnologiyalar

| Tərəf | Texnologiya |
|--------|-------------|
| Backend | Python 3, Flask |
| Verilənlər bazası | PostgreSQL (`psycopg2`) |
| Frontend | HTML, CSS, JavaScript (səhifə əsaslı) |

## Tələblər

- Python 3.10+ tövsiyə olunur
- PostgreSQL server və boş verilənlər bazası

## Quraşdırma

1. Repozitoriyanı klonlayın.

2. Virtual mühit (tövsiyə olunur):

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Layihə kökündə `.env` yaradın (nümunə üçün `.env.example`-a baxın):

   - `DATABASE_URL` — PostgreSQL qoşum sətri (məsələn `postgresql://istifadəçi:parol@localhost:5432/verilənlər_adı`)
   - `FLASK_SECRET_KEY` — təsadüfi uzun mətn

4. PostgreSQL-də sxemi tətbiq etmək üçün `backend/postgres_setup.sql` faylından istifadə edə bilərsiniz; ilk işə salınmada tətbiq lazım olan cədvəlləri də yarada bilər.

## İşə salma

Layihə kökündən:

```bash
python backend/app.py
```

Brauzerdə: `http://127.0.0.1:5000/login.html` və ya `http://127.0.0.1:5000/`

Sağlamlıq yoxlaması: `GET /api/health`

## Layihə strukturu

```
WebSec/
├── api/
│   └── index.py            # Vercel serverless girişi (Flask app ixracı)
├── backend/
│   ├── app.py              # Flask tətbiqi və API
│   ├── postgres_setup.sql
│   └── neon_rebuild_public_schema.sql   # Neon üçün sxem (istəyə bağlı)
├── frontend/               # HTML, CSS, JS, lang.js (Flask statik qovluğu)
├── docs/report-screenshots/# Hesabat üçün demo şəkillər
├── uploads/                # Lokal yükləmələr (git-ə düşmür; serverlessdə /tmp)
├── requirements.txt
├── vercel.json             # Sorğuları Flask serverless-ə yönləndirir
├── .env.example
├── README.md
└── REPORT.md               # Kurs hesabatı (əlavə)
```

## Vercel ilə deploy (frontend + backend birlikdə)

Backend Flask və `frontend/` eyni tətbiqdədir; Vercel-də **tək Python funksiyası** kimi işləyir, bütün URL-lər `vercel.json` vasitəsilə `/api/index`-ə yönləndirilir.

### 1. PostgreSQL (bulud)

Vercel özündə fayl tipli DB saxlamır. **Neon**, **Supabase Postgres**, **Railway** və s. ilə ayrıca PostgreSQL yaradın və **qoşum sətri**ni götürün (`postgresql://...`).

### 2. Vercel layihəsi

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub repozitoriyasını birləşdirin.
2. **Root Directory** layihə kökü qalsın (dəyişməyin).
3. **Environment Variables** bölməsində ən azı bunları əlavə edin:

| Dəyişən | İzah |
|--------|------|
| `DATABASE_URL` | Bulud PostgreSQL qoşum sətri (mütləq) — Neon/Supabase panelindən kopyalayın |
| `FLASK_SECRET_KEY` | Uzun təsadüfi mətn — sessiyanın deploy arası itməməsi üçün **mütləq** |

**Verilənlər bazasına qoşulma:** Tətbiq Vercel mühitində (`VERCEL`) avtomatik olaraq qoşum sətirinə `sslmode=require` əlavə edir (əgər siz artıq verməmisinizsə). Bulud Postgres üzrə məlumatın çəkilməsi üçün bu vacibdir.

Lokal `.env` faylı Vercel-ə köçürülmür; bütün sirli dəyərlər burada verilməlidir.

### 3. Deploy

`main` branch-ına push etdikdən sonra Vercel avtomatik build edəcək. Hazır olanda verilən **Production URL** üzrə `https://.../login.html` və ya `https://.../` açın.

Yoxlama: `GET https://sizin-domain.vercel.app/api/health`

### 4. Məhdudiyyətlər (serverless)

- **Yükləmələr** (`/uploads/`): serverless fayl sistemi **davamlı deyil** — davamlı saxlama üçün S3, Vercel Blob və s. ayrıca qoşulmalıdır.
- Əsas məqsəd — **PostgreSQL-dən oxuma/yazma** düzgün `DATABASE_URL` ilə işləyir; bulud DB ünvanının firewall-da Vercel çıxışlarına açıq olduğuna əmin olun (Neon/Supabase adətən hamıya açıqdır).

### Lokal olaraq Vercel CLI

```bash
npm i -g vercel
vercel login
vercel dev
```

Ən azı **Vercel CLI 48.2.10+** tövsiyə olunur. `vercel dev` zamanı `.env` lokalda işləyir.

## Təhlükəsizlik qeydi

Bu kod bazası tədris və təcrübə mühitində istifadə üçün nəzərdə tutula bilər. İstehsal mühitində işə salınmazdan əvvəl **müstəqil təhlükəsizlik auditindən** keçmək, parolları və açarları düzgün idarə etmək və yalnız etibarlı konfiqurasiya ilə deploy etmək vacibdir.

## Universitet hesabatı

Ətraflı texniki hesabat (arxiv, kod nümunələri, lab təsviri): [REPORT.md](REPORT.md). Demo şəkilləri üçün: `docs/report-screenshots/`.

## Əlaqə

Repozitoriya: [github.com/MbarizPaayev2/WebSecurity](https://github.com/MbarizPaayev2/WebSecurity)
