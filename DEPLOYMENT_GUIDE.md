# Plan implementacije i Deployment Guide - Kuhaona

## NF-003: Plan implementacije

### 1. Preduvjeti

#### Softverski preduvjeti:
- Node.js 18+ ili 20+
- npm ili yarn
- PostgreSQL baza podataka (lokalno ili Supabase)
- Git

#### Environment varijable:
Kreirajte `.env` datoteku u root direktoriju:

```env
# Baza podataka
DATABASE_URL="postgresql://user:password@localhost:5432/kuhaona?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-here"  # Generirajte: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"  # Za produkciju: https://kuhaona.org

# OAuth (opcionalno)
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Email (opcionalno)
RESEND_API_KEY="re_your-api-key"
EMAIL_FROM="Kuhaona <noreply@kuhaona.org>"

# Cron jobs (opcionalno)
CRON_API_KEY="your-cron-api-key"
```

### 2. Lokalna instalacija

#### Korak 1: Kloniranje repozitorija
```bash
git clone https://github.com/IvanCundekovic/ProgiG06.1.git
cd ProgiG06.1
```

#### Korak 2: Instalacija dependencies
```bash
npm install
```

#### Korak 3: Postavljanje baze podataka

**Opcija A: Lokalni PostgreSQL**
```bash
# Kreiraj bazu podataka
createdb kuhaona

# Pokreni migracije
npm run db:migrate

# (Opcionalno) Popuni test podacima
npm run db:seed
```

**Opcija B: Supabase**
1. Kreiraj projekt na [supabase.com](https://supabase.com)
2. Kopiraj connection string u `DATABASE_URL`
3. Pokreni migracije:
```bash
npm run db:migrate
```

#### Korak 4: Generiranje Prisma Client
```bash
npm run db:generate
```

#### Korak 5: Pokretanje development servera
```bash
npm run dev
```

Aplikacija će biti dostupna na: **http://localhost:3000**

### 3. Produkcijski deployment (Vercel)

#### Korak 1: Priprema
1. Pushaj kod na GitHub
2. Prijavi se na [vercel.com](https://vercel.com)
3. Importuj GitHub repozitorij

#### Korak 2: Konfiguracija na Vercel
1. **Environment Variables:**
   - Dodaj sve varijable iz `.env` u Vercel dashboard
   - `DATABASE_URL` - Supabase connection string
   - `AUTH_SECRET` - generirani secret
   - `NEXTAUTH_URL` - `https://kuhaona.org`
   - OAuth credentials (ako koristiš)
   - `RESEND_API_KEY` (ako koristiš email)

2. **Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Database:**
   - Koristi Supabase ili Vercel Postgres
   - Pokreni migracije nakon prvog deploy-a:
   ```bash
   npx prisma migrate deploy
   ```

#### Korak 3: Prvi deployment
```bash
# Vercel će automatski deployati nakon push-a na main branch
git push origin main
```

#### Korak 4: Post-deployment
1. Pokreni migracije:
   ```bash
   npx prisma migrate deploy
   ```

2. (Opcionalno) Popuni seed podacima:
   ```bash
   npm run db:seed
   ```

### 4. Konfiguracija cron jobova (obavijesti)

#### Opcija 1: Vercel Cron (preporučeno)
Kreiraj `vercel.json` u root:
```json
{
  "crons": [
    {
      "path": "/api/notifications/workshop-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/notifications/weekly-summary",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

#### Opcija 2: External Cron Service
Postavi cron job koji poziva:
- `POST https://kuhaona.org/api/notifications/workshop-reminders`
- `POST https://kuhaona.org/api/notifications/weekly-summary`

S headerom: `x-api-key: YOUR_CRON_API_KEY`

### 5. Backup strategija

#### Supabase Backup:
- Supabase automatski kreira dnevne backup-e
- Backup se čuva 7 dana (free tier) ili 30 dana (pro tier)
- Manual backup: Export baze kroz Supabase dashboard

#### Manual Backup:
```bash
# Export baze podataka
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20241219.sql
```

### 6. Monitoring i logovi

#### Vercel Analytics:
- Automatski monitoring performansi
- Error tracking
- Analytics dashboard

#### Logovi:
- Vercel Functions logovi u dashboardu
- Prisma query logovi (development mode)

### 7. Troubleshooting

#### Problem: Build fails
- Provjeri environment varijable
- Provjeri da su svi dependencies instalirani
- Provjeri TypeScript greške: `npm run build`

#### Problem: Database connection error
- Provjeri `DATABASE_URL` format
- Provjeri da je baza dostupna
- Provjeri firewall rules (Supabase)

#### Problem: Auth ne radi
- Provjeri `AUTH_SECRET` je postavljen
- Provjeri `NEXTAUTH_URL` je točan
- Provjeri OAuth credentials (ako koristiš)

### 8. Production Checklist

- [ ] Sve environment varijable postavljene
- [ ] Database migracije pokrenute
- [ ] AUTH_SECRET generiran i postavljen
- [ ] NEXTAUTH_URL postavljen na produkcijsku URL
- [ ] OAuth credentials konfigurirani (ako koristiš)
- [ ] Email servis konfiguriran (ako koristiš)
- [ ] Cron jobovi postavljeni
- [ ] Backup strategija implementirana
- [ ] Monitoring postavljen
- [ ] SSL certifikat aktivan (Vercel automatski)
- [ ] Custom domain konfiguriran (ako koristiš)

### 9. Maintenance

#### Redovni zadaci:
- Tjedni: Provjeri logove za greške
- Mjesečno: Provjeri backup-e
- Po potrebi: Ažuriraj dependencies (`npm update`)

#### Ažuriranje:
```bash
# Pull najnovije promjene
git pull origin main

# Instaliraj nove dependencies
npm install

# Pokreni migracije ako postoje
npm run db:migrate

# Rebuild
npm run build
```

### 10. Support i dokumentacija

- **README.md** - Opća dokumentacija
- **NOTIFICATIONS_SETUP.md** - Setup obavijesti
- **FUNKCIONALNI_ZAHTJEVI_ANALIZA.md** - Analiza funkcionalnih zahtjeva
- **NEFUNKCIONALNI_ZAHTJEVI_ANALIZA.md** - Analiza nefunkcionalnih zahtjeva
