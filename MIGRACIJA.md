# Migracija na sopstveni server (Hetzner + Coolify)

## Cilj
Sav compute (API-ji + sajtovi) na jedan Hetzner VPS pod Coolify-jem.
Podaci OSTAJU na Supabase-u. Mobilne app ostaju na EAS-u.

## Server
- Hetzner CPX41 (8 vCPU / 16 GB / 240 GB NVMe), Ubuntu 24.04, lokacija FSN/NBG
- Obavezno: SSH ključ pri kreiranju, uključiti automatske snapshote
- Poslije zakupa: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash` (radi Claude preko SSH)

## Redosljed selidbe (svaki korak reverzibilan)
1. zrk-lavice-api  → api.zrklavice.me   (rješava zaključani Render nalog)
   - env: DATABASE_URL (Supabase ZRK Lavice → Settings → Database → URI),
     JWT_SECRET (mora ISTI kao na Renderu da tokeni prežive!), PORT=3001
   - test rute prije preklopa: /api/teams, /api/auth/login, /api/stats, Monri callback
   - preklop: API adresa u web/lib + mobile-final/lib/api.ts + Monri WebPay panel (Callback URL)
2. handscouting-api (već ima Dockerfile)
3. Sajtovi redom: rr-liga.com → zrklavice.me → obećano → livestats → ostali
   - svaki: deploy na server → test na *.coolify domenu → DNS preklop → Vercel rezerva 7 dana
4. ZRK cron: Vercel cron ostaje dok je web na Vercelu; kad se web preseli → Coolify scheduled job
5. Gašenje: Render pretplate (uklj. zaključani nalog preko supporta), Vercel projekti

## Rollback
DNS/adresa nazad na staru platformu — stare instance se ne gase do +7 dana stabilnosti.
