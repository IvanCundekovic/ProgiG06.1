# Login Fix - Rješavanje problema s prijavom

## Problem
"Server error" na `/api/auth/signin` endpoint-u.

## Rješenje

### 1. Popravljena NextAuth konfiguracija
- `NextAuth()` se sada poziva samo u route handleru (`/api/auth/[...nextauth]/route.ts`)
- Uklonjen dupli poziv `NextAuth()` u `auth.ts`
- Export `auth`, `signIn`, `signOut` iz route handlera

### 2. AUTH_SECRET provjera
- Dodan fallback secret za development
- **VAŽNO:** Postavi `AUTH_SECRET` u `.env` datoteci:

```env
AUTH_SECRET="tvoj-secret-key-ovdje"
```

Za generiranje secret key-a:
```bash
openssl rand -base64 32
```

### 3. Provjeri environment varijable

U `.env` datoteci moraš imati:
```env
# Obavezno
AUTH_SECRET="generirani-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Baza podataka
DATABASE_URL="postgresql://..."

# OAuth (opcionalno)
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."
```

### 4. Restart development servera

Nakon promjena u `.env`:
```bash
# Zaustavi server (Ctrl+C)
# Pokreni ponovno
npm run dev
```

## Ako i dalje ne radi

1. Provjeri da li je `AUTH_SECRET` postavljen u `.env`
2. Provjeri da li je `DATABASE_URL` točan
3. Provjeri da li baza podataka radi
4. Provjeri server logove za detaljne greške
