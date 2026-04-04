# Aviakassa — Web təhlükəsizliyi layihəsi

Biletlər və istifadəçi hesabları ətrafında qurulmuş tamstack nümunə: statik frontend, Flask REST API və PostgreSQL verilənlər bazası.

## İmkanlar

- İstifadəçi **qeydiyyatı** və **girişi** (sessiya əsaslı)
- **Uçuş axtarışı** interfeysi (`aviakassa.html`)
- Giriş sonrası **şəxsi panel** (profil, yükləmələr, rezervasiyalar)
- **İdarəetmə hesabatı** səhifəsi (admin konteksti)

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
   pip install -r backend/requirements.txt
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
├── backend/
│   ├── app.py              # Flask tətbiqi və API
│   ├── requirements.txt
│   └── postgres_setup.sql  # PostgreSQL sxemi (istəyə bağlı)
├── frontend/               # Statik HTML, CSS, JS
├── uploads/                # Yüklənmiş fayllar (lokal, git-ə düşmür)
├── .env.example
└── README.md
```

## Təhlükəsizlik qeydi

Bu kod bazası tədris və təcrübə mühitində istifadə üçün nəzərdə tutula bilər. İstehsal mühitində işə salınmazdan əvvəl **müstəqil təhlükəsizlik auditindən** keçmək, parolları və açarları düzgün idarə etmək və yalnız etibarlı konfiqurasiya ilə deploy etmək vacibdir.

## Əlaqə

Repozitoriya: [github.com/MbarizPaayev2/WebSecurity](https://github.com/MbarizPaayev2/WebSecurity)
