# Disaster Recovery Plan - Kuhaona

## NF-012: Disaster Recovery Plan

### Pregled

Ovaj dokument opisuje plan oporavka u slučaju katastrofe. Cilj je oporavak unutar 1 sata od kvara glavnog poslužitelja.

---

## Recovery Time Objective (RTO)

**Cilj:** < 1 sat od identifikacije problema

## Recovery Point Objective (RPO)

**Cilj:** < 24 sata (dnevni backup)

---

## Identifikacija problema

### Kategorije problema

#### 1. Database Failure
- **Simptomi:**
  - Connection errors u aplikaciji
  - 500 errors na API rutama
  - Supabase status page pokazuje probleme

- **Akcije:**
  1. Provjeri Supabase status: https://status.supabase.com
  2. Provjeri Supabase dashboard za detalje
  3. Kontaktiraj Supabase support ako je potrebno

#### 2. Application Failure (Vercel)
- **Simptomi:**
  - Aplikacija ne učitava
  - Build failures
  - Deployment errors

- **Akcije:**
  1. Provjeri Vercel status: https://www.vercel-status.com
  2. Provjeri Vercel dashboard za deployment status
  3. Provjeri build logove

#### 3. DNS/Network Failure
- **Simptomi:**
  - Aplikacija nedostupna
  - DNS resolution errors

- **Akcije:**
  1. Provjeri DNS konfiguraciju
  2. Provjeri domain provider status
  3. Provjeri SSL certifikat

---

## Recovery procesi

### Scenario 1: Database Failure

#### Korak 1: Identifikacija
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### Korak 2: Restore iz backup-a
1. Prijavi se na Supabase Dashboard
2. Settings → Database → Backups
3. Odaberite najnoviji backup prije kvara
4. Kliknite "Restore"
5. Potvrdite restore

#### Korak 3: Verifikacija
```bash
# Provjeri da baza radi
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM courses;"
```

#### Korak 4: Ažuriranje aplikacije
- Ako je potrebno, redeploy aplikaciju na Vercel
- Provjeri da sve API rute rade

**Vrijeme oporavka:** ~15-30 minuta

---

### Scenario 2: Application Failure

#### Korak 1: Identifikacija
- Provjeri Vercel dashboard
- Pregledaj build logove
- Provjeri environment varijable

#### Korak 2: Rollback deployment
1. Vercel Dashboard → Deployments
2. Odaberite prethodni uspješan deployment
3. Kliknite "Promote to Production"

#### Korak 3: Fix problema
1. Identificiraj grešku u kodu
2. Fix grešku lokalno
3. Testiraj lokalno
4. Push i redeploy

**Vrijeme oporavka:** ~10-20 minuta (rollback) ili ~30-60 minuta (fix + deploy)

---

### Scenario 3: Complete System Failure

#### Korak 1: Failover na backup okruženje
1. Ako postoji backup okruženje, aktiviraj ga
2. Ažuriraj DNS da pokazuje na backup okruženje

#### Korak 2: Restore baze podataka
1. Restore iz najnovijeg backup-a
2. Verificiraj podatke

#### Korak 3: Redeploy aplikacije
1. Deploy aplikaciju na novi server
2. Konfiguriraj environment varijable
3. Pokreni migracije

**Vrijeme oporavka:** ~45-60 minuta

---

## Backup strategija za recovery

### Database Backup
- **Frekvencija:** Dnevno (Supabase automatski)
- **Retention:** 7-30 dana (ovisno o tieru)
- **Lokacija:** Supabase managed

### Application Backup
- **Git repository:** GitHub (glavni backup)
- **Deployment history:** Vercel čuva deployment history
- **Environment variables:** Backup u Vercel dashboard

### Manual Backup
- **Frekvencija:** Tjedno
- **Lokacija:** Lokalni server ili cloud storage
- **Format:** SQL dump + kompresija

---

## Testiranje recovery procesa

### Redovno testiranje

**Mjesečno:**
1. Test restore baze podataka u test okruženje
2. Verificiraj da su svi podaci prisutni
3. Testiraj kritične funkcionalnosti

**Kvartalno:**
1. Full disaster recovery test
2. Simuliraj potpuni kvar
3. Mjeri vrijeme oporavka
4. Dokumentiraj rezultate

### Test checklist

- [ ] Database restore funkcionira
- [ ] Aplikacija se može redeploy-ati
- [ ] Environment varijable su backup-ane
- [ ] DNS se može promijeniti
- [ ] SSL certifikati su validni
- [ ] Svi API endpointi rade nakon recovery-ja

---

## Komunikacija tijekom incidenta

### Status updates

1. **Identifikacija problema** (0-5 min)
   - Obavijesti tim
   - Postavi status page (ako postoji)

2. **Tijek oporavka** (5-30 min)
   - Redovni status update-i
   - Komunikacija s korisnicima (ako je potrebno)

3. **Završetak oporavka** (30-60 min)
   - Potvrda da sve radi
   - Finalni status update
   - Post-mortem analiza

### Komunikacijski kanali

- **Interno:** Slack/Discord tim
- **Eksterno:** Status page, Email obavijesti
- **Korisnici:** In-app notifications (ako je moguće)

---

## Post-mortem proces

### Nakon recovery-ja

1. **Dokumentiraj incident:**
   - Što se dogodilo?
   - Kada se dogodilo?
   - Kako je identificiran?
   - Kako je riješen?

2. **Analiza:**
   - Uzrok problema
   - Zašto se dogodilo?
   - Kako spriječiti u budućnosti?

3. **Poboljšanja:**
   - Što možemo poboljšati?
   - Dodatne mjere zaštite
   - Ažuriranje dokumentacije

---

## Kontakt informacije

### Kritični kontakti

- **Supabase Support:** support@supabase.com
- **Vercel Support:** support@vercel.com
- **Tim lead:** [kontakt informacije]

### Escalation proces

1. **Level 1:** Tim developer
2. **Level 2:** Tim lead
3. **Level 3:** External support (Supabase/Vercel)

---

## Monitoring i alerting

### Monitoring tools

- **Vercel Analytics:** Performance monitoring
- **Supabase Dashboard:** Database monitoring
- **Uptime monitoring:** External service (npr. UptimeRobot)

### Alerti

Postavi alerte za:
- Database connection errors
- High error rate
- Deployment failures
- SSL certificate expiration

---

## Preventivne mjere

### Redovno održavanje

- **Tjedno:** Provjeri logove, backup status
- **Mjesečno:** Test restore, security audit
- **Kvartalno:** Full disaster recovery test

### Best practices

1. Redovni backup-i
2. Monitoring i alerting
3. Dokumentacija procesa
4. Redovno testiranje recovery procesa
5. Ažuriranje dependencies
6. Security patches

---

**Zadnja ažurirana:** {new Date().toLocaleDateString("hr-HR")}
