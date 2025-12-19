# NextAuth v5 Fix - ClientFetchError Rješenje

## Problem
"ClientFetchError: There was a problem with the server configuration" na NextAuth v5 beta s Next.js 15.

## Rješenje

### 1. Ispravljena konfiguracija

**Route handler** (`/api/auth/[...nextauth]/route.ts`):
```typescript
const handler = NextAuth(authOptions);
export const {handlers, auth, signIn, signOut} = handler;
export const {GET, POST} = handlers;
```

**SessionProvider** (`providers.tsx`):
```typescript
<SessionProvider
    basePath="/api/auth"
    refetchInterval={0}
    refetchOnWindowFocus={false}
    refetchWhenOffline={false}
>
```

### 2. Dodane provjere

- ✅ Error handling u route handleru
- ✅ Debug mode u development
- ✅ Provjera AUTH_SECRET prije inicijalizacije

### 3. Environment varijable

Provjeri da li `.env` sadrži:
```env
AUTH_SECRET="tvoj-secret-key"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://..."
```

### 4. Restart servera

```bash
# Zaustavi server (Ctrl+C)
npm run dev
```

## Ako i dalje ne radi

1. **Provjeri server logove** - pogledaj konzolu za detaljne greške
2. **Provjeri da li baza podataka radi:**
   ```bash
   npm run db:studio
   ```
3. **Provjeri Prisma migracije:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

## NextAuth v5 specifičnosti

- NextAuth v5 beta koristi drugačiju konfiguraciju
- `basePath` mora biti postavljen u SessionProvider
- `trustHost: true` je potreban za development
- Handlers se exportuju direktno iz `NextAuth()` poziva

## Troubleshooting

### Greška: "ClientFetchError"
- **Rješenje:** Provjeri da li je `AUTH_SECRET` postavljen i da li server radi

### Greška: "Database connection error"
- **Rješenje:** Provjeri `DATABASE_URL` i da li baza radi

### Greška: "Adapter error"
- **Rješenje:** Provjeri da li su Prisma migracije primijenjene
