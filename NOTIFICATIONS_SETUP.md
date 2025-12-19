# Postavljanje automatskih obavijesti (F-017)

## Pregled

Sustav podržava tri vrste automatskih obavijesti:
1. **Obavijesti o novim lekcijama** - automatski se šalju kada instruktor objavi novu lekciju
2. **Podsjetnici za live radionice** - šalju se 24 sata prije početka radionice
3. **Tjedni sažetci napretka** - šalju se svaki tjedan aktivnim korisnicima

## Automatske obavijesti

### 1. Obavijesti o novim lekcijama
- **Kada se šalju**: Automatski kada instruktor kreira i objavi novu lekciju
- **Kome se šalju**: Svim korisnicima koji su započeli tečaj u kojem je lekcija dodana
- **API endpoint**: `/api/notifications/new-lesson` (poziva se automatski)

### 2. Podsjetnici za live radionice
- **Kada se šalju**: 24 sata prije početka radionice
- **Kome se šalju**: Svim registriranim korisnicima
- **API endpoint**: `/api/notifications/workshop-reminders`
- **Kako pokrenuti**: Postavite cron job ili scheduled task

### 3. Tjedni sažetci napretka
- **Kada se šalju**: Svaki tjedan (npr. ponedjeljak u 9:00)
- **Kome se šalju**: Aktivnim korisnicima (aktivnost u zadnjih 30 dana)
- **API endpoint**: `/api/notifications/weekly-summary`
- **Kako pokrenuti**: Postavite cron job ili scheduled task

## Postavljanje cron jobova

### Opcija 1: Vercel Cron Jobs (preporučeno za produkciju)

Dodajte `vercel.json` u root projekta:

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

### Opcija 2: External Cron Service (npr. cron-job.org)

1. Kreirajte cron job koji poziva:
   - `POST https://kuhaona.org/api/notifications/workshop-reminders`
   - `POST https://kuhaona.org/api/notifications/weekly-summary`

2. Dodajte header:
   - `x-api-key: YOUR_CRON_API_KEY`

3. Postavite schedule:
   - Workshop reminders: Svaki dan u 9:00
   - Weekly summary: Svaki ponedjeljak u 9:00

### Opcija 3: Node.js Cron (za development)

Instalirajte `node-cron`:
```bash
npm install node-cron
```

Kreirajte `src/app/cron.ts`:
```typescript
import cron from 'node-cron';

// Podsjetnici za radionice - svaki dan u 9:00
cron.schedule('0 9 * * *', async () => {
  await fetch('http://localhost:3000/api/notifications/workshop-reminders', {
    method: 'POST',
    headers: { 'x-api-key': process.env.CRON_API_KEY || '' },
  });
});

// Tjedni sažetak - svaki ponedjeljak u 9:00
cron.schedule('0 9 * * 1', async () => {
  await fetch('http://localhost:3000/api/notifications/weekly-summary', {
    method: 'POST',
    headers: { 'x-api-key': process.env.CRON_API_KEY || '' },
  });
});
```

## Environment varijable

Dodajte u `.env`:
```env
CRON_API_KEY=your-secret-api-key-here
```

## Sigurnost

Svi cron endpointi zahtijevaju `x-api-key` header ako je `CRON_API_KEY` postavljen u environment varijablama. Ovo sprječava neovlašteni pristup.

## Testiranje

Možete ručno testirati endpointove:

```bash
# Podsjetnici za radionice
curl -X POST http://localhost:3000/api/notifications/workshop-reminders \
  -H "x-api-key: your-api-key"

# Tjedni sažetak
curl -X POST http://localhost:3000/api/notifications/weekly-summary \
  -H "x-api-key: your-api-key"
```

## Napomene

- Email servis koristi Resend API
- Obavijesti se šalju samo ako je `RESEND_API_KEY` postavljen
- Ako email servis nije konfiguriran, obavijesti se neće slati (ali neće uzrokovati greške)

