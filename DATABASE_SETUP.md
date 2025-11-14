# Postavljanje baze podataka - Kuhaona

## Problem je riješen! ✅

Prisma sada vidi `DATABASE_URL` varijablu u `.env` datoteci. Međutim, migracija ne može proći jer baza podataka nije dostupna ili podaci nisu točni.

## Opcije za postavljanje baze podataka

### Opcija 1: Lokalni PostgreSQL (Preporučeno za razvoj)

#### 1. Instaliraj PostgreSQL (ako nije instaliran)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# ili koristi Docker
docker run --name postgres-kuhaona -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kuhaona -p 5432:5432 -d postgres
```

#### 2. Kreiraj bazu podataka
```bash
# Pristupi PostgreSQL-u
sudo -u postgres psql

# U PostgreSQL konzoli:
CREATE DATABASE kuhaona;
CREATE USER kuhaona_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kuhaona TO kuhaona_user;
\q
```

#### 3. Ažuriraj .env datoteku
```bash
DATABASE_URL=postgresql://kuhaona_user:your_password@localhost:5432/kuhaona?schema=public
```

### Opcija 2: Supabase (Cloud - Preporučeno za produkciju)

#### 1. Kreiraj Supabase projekt
- Idi na https://supabase.com
- Kreiraj novi projekt
- Idi na Settings > Database
- Kopiraj "Connection string" (URI format)

#### 2. Ažuriraj .env datoteku
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
```

### Opcija 3: Docker PostgreSQL (Najlakše za brzi start)

#### 1. Pokreni PostgreSQL u Dockeru
```bash
docker run --name postgres-kuhaona \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kuhaona \
  -p 5432:5432 \
  -d postgres:15
```

#### 2. .env datoteka (već postavljeno)
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kuhaona?schema=public
```

## Pokretanje migracije

Nakon što je baza postavljena:

```bash
# Provjeri vezu
npx prisma db pull

# Pokreni migraciju
npx prisma migrate dev --name add_all_models

# Generiraj Prisma Client
npx prisma generate
```

## Provjera statusa

```bash
# Provjeri da li baza radi
npx prisma db push --preview-feature

# Ili koristi Prisma Studio za pregled podataka
npx prisma studio
```

## Troubleshooting

### Greška: "Authentication failed"
- Provjeri da li je PostgreSQL pokrenut: `sudo systemctl status postgresql`
- Provjeri korisničko ime i lozinku u DATABASE_URL
- Provjeri da li baza postoji

### Greška: "Database does not exist"
- Kreiraj bazu: `CREATE DATABASE kuhaona;`
- Ili koristi `npx prisma db push` da automatski kreira bazu

### Greška: "Connection refused"
- Provjeri da li je PostgreSQL pokrenut
- Provjeri port (default: 5432)
- Provjeri firewall postavke

## Trenutna konfiguracija

Trenutno je u `.env` datoteci postavljeno:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kuhaona?schema=public
```

To znači:
- **Host**: localhost
- **Port**: 5432
- **Database**: kuhaona
- **User**: postgres
- **Password**: postgres

Ako koristiš drugačije podatke, ažuriraj `.env` datoteku!

