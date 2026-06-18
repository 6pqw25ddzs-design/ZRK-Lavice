# ZRK Lavice — Digitalni Ekosistem

Kompletna digitalna platforma za ZRK Lavice Podgorica: web sajt, admin panel i mobilna aplikacija.

## Struktura projekta

```
zrk-lavice/
├── backend/          # Node.js + Express + Prisma API
├── frontend/         # Next.js 14 web sajt + admin panel
├── mobile/           # React Native + Expo mobilna app
└── docs/             # OpenAPI dokumentacija, wireframei
```

---

## Brzi start (lokalni razvoj)

### Preduslovi
- Node.js 20+
- PostgreSQL 16+
- pnpm ili npm

### 1. Backend API

```bash
cd backend
npm install
cp .env.example .env    # popuni varijable

# Migracija baze
npm run db:generate
npm run db:migrate
npm run db:seed         # placeholder podaci

# Pokretanje
npm run dev             # http://localhost:3001
```

### 2. Web sajt (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local

npm run dev             # http://localhost:3000
```

### 3. Mobilna aplikacija (Expo)

```bash
cd mobile
npm install

# iOS simulator
npm run ios

# Android emulator
npm run android

# EAS build za produkciju
npx eas build -p all
```

---

## Varijable okruženja

### backend/.env

```env
DATABASE_URL="postgresql://user:password@localhost:5432/zrk_lavice"
JWT_SECRET="vaš-tajni-ključ-minimum-32-karaktera"
PORT=3001
ALLOWED_ORIGINS="https://zrklavice.me,http://localhost:3000"

# Firebase (push notifikacije)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Cloudflare R2 (file storage)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="zrk-lavice"

# SendGrid (email)
SENDGRID_API_KEY="SG...."
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_URL="https://api.zrklavice.me"
```

### mobile/.env

```env
EXPO_PUBLIC_API_URL="https://api.zrklavice.me"
```

---

## Deployment (Produkcija)

### Backend → Render.com

1. Kreiraj novi Web Service na render.com
2. Poveži GitHub repo, odaberi `/backend` kao root
3. Build command: `npm install && npm run build && npm run db:migrate`
4. Start command: `npm run start`
5. Dodaj environment varijable u Render dashboard
6. Kreiraj PostgreSQL bazu u Render (Starter plan ~7 EUR/mj)

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
# Dodaj NEXT_PUBLIC_API_URL u Vercel dashboard
```

Vercel je besplatan za projekte ovog obima.

### Domena

1. Registruj `zrklavice.me` (~12 EUR/god) kod registrara poput Namecheap
2. Usmjeri DNS:
   - `zrklavice.me` → Vercel (CNAME)
   - `api.zrklavice.me` → Render (CNAME)

---

## Procjena troškova (mjesečno)

| Usluga | Plan | Cijena |
|--------|------|--------|
| Render.com (API) | Starter | ~7 EUR |
| Render.com (PostgreSQL) | Starter | ~7 EUR |
| Vercel (Next.js) | Hobby | **0 EUR** |
| Cloudflare R2 (storage) | Free tier 10GB | **0–2 EUR** |
| Firebase FCM | Free | **0 EUR** |
| SendGrid (email) | Free 100/dan | **0 EUR** |
| Upstash Redis (cache/sessions) | Free 10K req/dan | **0 EUR** |
| Domena .me | godišnje / 12 | ~1 EUR |
| **UKUPNO** | | **~15–18 EUR/mj** |

Daleko ispod limita od 50 EUR/mj. Ako baza poraste, Render Starter skalira na ~25 EUR/mj.

---

## Admin panel

Pristup: `https://zrklavice.me/admin`
Podrazumijevane uloge:
- `admin` — puni pristup
- `coach` — raspored, rezultati, vijesti, poruke
- `parent` — samo čitanje svog djeteta, poruke s trenerom

---

## Mobilna aplikacija

### TestFlight (iOS interni test)
```bash
npx eas build -p ios --profile preview
```

### Google Play Internal Testing (Android)
```bash
npx eas build -p android --profile preview
npx eas submit -p android
```

---

## API dokumentacija

OpenAPI spec: `docs/openapi.yaml`

Pregledaj lokalno:
```bash
npx @redocly/cli preview-docs docs/openapi.yaml
```

---

## Seed podaci (za testiranje)

`npm run db:seed` u backend direktoriju kreira:
- 3 ekipe (Mini, Pioniri, Prva liga)
- 15 igračica (5 po ekipi) s crnogorskim imenima
- 3 trenera s profilima
- Raspored za tekući i naredni mjesec
- 3 vijesti
- 2 sponzora (Zlatni, Srebrni)
- Admin korisnik: `admin@zrklavice.me` / `Admin1234!`

---

## Struktura baze podataka

Vidi `backend/prisma/schema.prisma` za kompletnu shemu.

Ključne tabele:
- `users` — svi korisnici (roditelji, treneri, admini)
- `teams` — 3 ekipe
- `players` — igračice, vezane za tim i roditelja
- `coaches` — treneri, vezani za korisnika i tim
- `schedule_events` — treninzi i utakmice
- `match_results` — rezultati utakmica
- `attendance` — evidencija prisustva
- `messages` — chat roditelj↔trener + grupne poruke
- `registrations` — prijave novih igračica (javno)
- `notifications` — historija push notifikacija
- `news_articles` — blog/vijesti
- `sponsors` — sponzori s nivoima (gold/silver/bronze)
- `documents` — grant prijave, finansijski dokumenti

---

## Push notifikacije — tok

1. Roditelj instalira mobilnu app → unosi FCM token via `/api/auth/fcm-token`
2. Trener kreira/mijenja termin via admin → backend automatski šalje FCM svim roditeljima ekipe
3. Notifikacija stiže u roku od ~5 sekundi (Firebase SLA)
4. Roditelje koji nisu instalirani primaju email fallback (SendGrid)

---

## Bezbjednost

- JWT tokeni expire za 7 dana
- Refresh token rotacija pri svakom zahtjevu
- Sve admin rute zaštićene `requireAuth + requireRole` middleware-om
- Rate limiting: 100 req / 15 min po IP adresi
- Helmet.js za HTTP security headere
- CORS ograničen na poznate origine
- Lozinke hashirane bcrypt-om (cost factor 12)
- SQL injection zaštićen Prisma ORM-om (prepared statements)
