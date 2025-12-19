# ⚡ Quick Fix - Login Problem

## Problem
"Server error" na `/api/auth/signin` - **najvjerojatnije nedostaje AUTH_SECRET**

## Rješenje (2 minute)

### 1. Provjeri .env datoteku

Otvori `.env` datoteku u root direktoriju i provjeri da li postoji:

```env
AUTH_SECRET="..."
```

### 2. Ako nema AUTH_SECRET, generiraj ga:

```bash
openssl rand -base64 32
```

### 3. Dodaj u .env:

```env
AUTH_SECRET="generirani-key-ovdje"
```

### 4. Restart servera:

```bash
# Zaustavi server (Ctrl+C)
npm run dev
```

## Ako i dalje ne radi

Provjeri da li `.env` datoteka sadrži:

```env
# Obavezno
AUTH_SECRET="tvoj-secret-key"
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
```

**Napomena:** Ako koristiš Supabase, `DATABASE_URL` bi trebao biti connection string iz Supabase dashboarda.

## Provjeri server logove

Kada pokreneš `npm run dev`, pogledaj konzolu - trebao bi vidjeti:
- ✅ "Ready" poruku
- ❌ Ako vidiš "AUTH_SECRET nije postavljen" - to je problem!
