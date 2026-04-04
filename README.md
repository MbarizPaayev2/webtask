# Aviakassa — Web təhlükəsizliyi layihəsi

Flask + PostgreSQL + statik frontend (giriş, uçuş axtarışı, panel, admin). Çoxdilli UI: `frontend/lang.js` (`aviakassa_lang`).

## Texnologiya

Python 3.10+, Flask, PostgreSQL (`psycopg2`), HTML/CSS/JS.

## Quraşdırma

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Layihə kökündə `.env` (nümunə: `.env.example`):

- `DATABASE_URL` — PostgreSQL
- `FLASK_SECRET_KEY` — təsadüfi uzun mətn

Sxem əsasən ilk işə salınmada `backend/app.py` tərəfindən yaradılır. Köhnə Neon sxemini təmizləmək üçün (diqqət: məlumat silinir): `backend/neon_rebuild_public_schema.sql`.

## Lokal işə salma

```bash
python backend/app.py
```

→ `http://127.0.0.1:5000/` · Sağlamlıq: `GET /api/health`

## Struktur

```
WebSec/
├── api/index.py          # Vercel: Flask ixracı
├── backend/app.py
├── backend/neon_rebuild_public_schema.sql   # istəyə bağlı DB reset
├── frontend/
├── requirements.txt
├── vercel.json
├── .env.example
├── README.md
└── REPORT.md
```

## Vercel

1. Bulud PostgreSQL (Neon və s.) — `DATABASE_URL` + `FLASK_SECRET_KEY` layihə **Environment Variables**-də.
2. `vercel.json` bütün sorğuları serverless Flask-a yönləndirir.
3. Serverlessdə fayl yükləmələri davamlı deyil (yalnız `/tmp`).

Ətraflı CLI: `vercel dev` (lokalda `.env` işləyir).

## Təhlükəsizlik

Tədris/lab mühit üçündür; istehsal üçün uyğun deyil.

## Hesabat

[REPORT.md](REPORT.md)

**Repo:** [github.com/MbarizPaayev2/webtask](https://github.com/MbarizPaayev2/webtask)
