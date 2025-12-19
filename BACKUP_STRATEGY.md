# Backup strategija - Kuhaona

## NF-005: Backup strategija i trajnost podataka

### Pregled

Kuhaona koristi Supabase (PostgreSQL) za pohranu podataka. Ova dokumentacija opisuje backup strategiju i proces oporavka podataka.

---

## Automatski backup (Supabase)

### Supabase Backup Features

Supabase automatski kreira backup-e:
- **Free tier:** Dnevni backup-e, čuvaju se 7 dana
- **Pro tier:** Dnevni backup-e, čuvaju se 30 dana
- **Team tier:** Dnevni backup-e, čuvaju se 30 dana + point-in-time recovery

### Pristup backup-ima

1. Prijavite se na [Supabase Dashboard](https://app.supabase.com)
2. Odaberite svoj projekt
3. Idi na **Settings** → **Database**
4. U sekciji **Backups** možete:
   - Pregledati dostupne backup-e
   - Preuzeti backup
   - Restaurirati backup

---

## Manual Backup

### Export baze podataka

#### Korak 1: Instaliraj pg_dump
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Preuzmi PostgreSQL installer
```

#### Korak 2: Export baze
```bash
# Export s Supabase connection string
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --schema=public \
  --file=backup_$(date +%Y%m%d_%H%M%S).sql

# Ili s .env varijablom
pg_dump $DATABASE_URL --schema=public --file=backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Korak 3: Kompresija (opcionalno)
```bash
gzip backup_20241219_120000.sql
```

### Backup struktura

Preporučena struktura backup datoteka:
```
backups/
  ├── daily/
  │   ├── backup_20241219.sql.gz
  │   ├── backup_20241220.sql.gz
  │   └── ...
  ├── weekly/
  │   ├── backup_2024_w50.sql.gz
  │   └── ...
  └── monthly/
      ├── backup_2024_12.sql.gz
      └── ...
```

---

## Restore proces

### Restore iz Supabase backup-a

1. Supabase Dashboard → Settings → Database → Backups
2. Odaberite backup datum
3. Kliknite "Restore"
4. Potvrdite restore

**Napomena:** Restore će zamijeniti trenutnu bazu podataka.

### Restore iz manual backup-a

```bash
# Dekompresiraj (ako je kompresirano)
gunzip backup_20241219_120000.sql.gz

# Restore
psql $DATABASE_URL < backup_20241219_120000.sql

# Ili s Supabase connection string
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < backup_20241219_120000.sql
```

---

## Backup skripta (automatski)

### Lokalna skripta

Kreiraj `scripts/backup.sh`:

```bash
#!/bin/bash

# Konfiguracija
BACKUP_DIR="./backups/daily"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Kreiraj direktorij ako ne postoji
mkdir -p $BACKUP_DIR

# Export baze
pg_dump $DATABASE_URL --schema=public --file=$BACKUP_FILE

# Kompresija
gzip $BACKUP_FILE

# Obriši backup-e starije od 30 dana
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup kreiran: $BACKUP_FILE.gz"
```

### Cron job za automatski backup

```bash
# Dodaj u crontab (svaki dan u 2:00)
0 2 * * * /path/to/scripts/backup.sh
```

---

## Video sadržaji

### YouTube video materijali

- Video materijali se ne pohranjuju lokalno
- Koriste se YouTube embed linkovi
- Backup nije potreban (YouTube upravlja backup-om)

### Ako koristiš vlastiti video hosting:

1. **S3/Cloud Storage Backup:**
   - Konfiguriraj lifecycle policy za automatski backup
   - Repliciraj na drugu regiju

2. **CDN Backup:**
   - Većina CDN-ova ima automatski backup
   - Provjeri dokumentaciju svog CDN providera

---

## Disaster Recovery Plan

### RTO (Recovery Time Objective): < 1 sat

### RPO (Recovery Point Objective): < 24 sata (dnevni backup)

### Recovery proces

1. **Identifikacija problema**
   - Provjeri Supabase status
   - Provjeri Vercel status
   - Provjeri logove

2. **Oporavak baze podataka**
   - Supabase Dashboard → Restore iz backup-a
   - Ili manual restore iz backup datoteke

3. **Verifikacija**
   - Provjeri da su podaci restaurirani
   - Testiraj kritične funkcionalnosti

4. **Komunikacija**
   - Obavijesti korisnike o eventualnim problemima
   - Status update na platformi

---

## Backup verifikacija

### Redovna provjera

**Tjedno:**
- Provjeri da backup-i postoje
- Testiraj restore proces (na test okruženju)

**Mjesečno:**
- Verificiraj integritet backup-a
- Provjeri da backup-i nisu korumpirani

### Test restore

```bash
# Kreiraj test bazu
createdb kuhaona_test

# Restore backup u test bazu
psql kuhaona_test < backup_20241219.sql

# Provjeri podatke
psql kuhaona_test -c "SELECT COUNT(*) FROM users;"
```

---

## Best Practices

1. **Redovni backup-i:**
   - Dnevni automatski backup-i (Supabase)
   - Tjedni manual backup-i (za kritične podatke)

2. **Off-site backup:**
   - Pohrani backup-e na drugu lokaciju
   - Cloud storage (AWS S3, Google Cloud Storage)

3. **Backup enkripcija:**
   - Enkriptiraj osjetljive backup-e
   ```bash
   gpg --encrypt --recipient your@email.com backup.sql
   ```

4. **Dokumentacija:**
   - Dokumentiraj backup proces
   - Drži evidenciju backup datuma

5. **Testiranje:**
   - Redovno testiraj restore proces
   - Provjeri da backup-i rade

---

## Monitoring

### Backup status monitoring

Postavi alerte za:
- Neuspjele backup-e
- Backup-e starije od 48 sati
- Nedostajuće backup-e

### Supabase monitoring

- Supabase Dashboard → Monitoring
- Pregledaj backup status
- Provjeri storage usage

---

## Kontakt za backup support

Za pitanja o backup strategiji:
- Pregledaj Supabase dokumentaciju
- Kontaktiraj Supabase support
- Provjeri Vercel dokumentaciju za deployment backup

---

**Zadnja ažurirana:** {new Date().toLocaleDateString("hr-HR")}
