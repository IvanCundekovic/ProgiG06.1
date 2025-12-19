# NextAuth Fix - Rješavanje "Server error" problema

## Problem
"Server error" na `/api/auth/signin` endpoint-u.

## Rješenje

### 1. Ispravljena NextAuth v5 konfiguracija

**Route handler** (`/api/auth/[...nextauth]/route.ts`):
```typescript
import {authOptions} from "@/app/auth"
import NextAuth from "next-auth"

const handler = NextAuth(authOptions);
export const {handlers, auth, signIn, signOut} = handler;
export const GET = handlers.GET;
export const POST = handlers.POST;
```

### 2. Provjeri AUTH_SECRET

**KRITIČNO:** `AUTH_SECRET` mora biti postavljen u `.env` datoteci!

```env
AUTH_SECRET="tvoj-secret-key-ovdje"
```

**Za generiranje secret key-a:**
```bash
openssl rand -base64 32
```

### 3. Provjeri DATABASE_URL

Baza podataka mora biti dostupna:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### 4. Provjeri NEXTAUTH_URL (opcionalno)

Za development:
```env
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Restart servera

Nakon promjena u `.env`:
```bash
# Zaustavi server (Ctrl+C)
npm run dev
```

## Ako i dalje ne radi

1. **Provjeri server logove:**
   ```bash
   npm run dev
   # Pogledaj greške u konzoli
   ```

2. **Provjeri da li je AUTH_SECRET postavljen:**
   ```bash
   # U .env datoteci mora biti:
   AUTH_SECRET="..."
   ```

3. **Provjeri da li baza podataka radi:**
   ```bash
   npm run db:studio
   # Ili provjeri DATABASE_URL u .env
   ```

4. **Provjeri Prisma migracije:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

## NextAuth v5 specifičnosti

- NextAuth v5 beta koristi drugačiju konfiguraciju od v4
- `handlers` se exportuju direktno iz `NextAuth()` poziva
- `auth`, `signIn`, `signOut` se također exportuju iz handlera
- `trustHost: true` je potreban za development

## Troubleshooting

### Greška: "Missing secret"
- **Rješenje:** Postavi `AUTH_SECRET` u `.env`

### Greška: "Database connection error"
- **Rješenje:** Provjeri `DATABASE_URL` i da li baza radi

### Greška: "Adapter error"
- **Rješenje:** Provjeri da li su Prisma migracije primijenjene
