# Analiza funkcionalnih zahtjeva - Kuhaona

## Pregled implementacije funkcionalnih zahtjeva

### ✅ IMPLEMENTIRANO (11/17)

#### F-001: Registracija pomoću e-maila ili OAuth 2.0 ✅
**Status:** ✅ **IMPLEMENTIRANO**
- ✅ Registracija putem e-maila i lozinke (`/api/register`, `LoginPage`)
- ✅ OAuth 2.0: Google i GitHub (`auth.ts`)
- ❌ Apple OAuth - **NEDOSTAJE**
- ❌ Microsoft OAuth - **NEDOSTAJE**

**Implementacija:**
- `src/app/api/register/route.ts` - registracija
- `src/app/auth.ts` - OAuth providers (Google, GitHub)
- `src/app/LoginPage/page.tsx` - UI za registraciju i prijavu

---

#### F-002: Prijava i odjava ✅
**Status:** ✅ **IMPLEMENTIRANO**
- ✅ Prijava registriranih korisnika
- ✅ Odjava iz sustava
- ✅ NextAuth.js session management

**Implementacija:**
- `src/app/auth.ts` - Credentials provider
- `src/app/LoginPage/page.tsx` - Login UI
- `src/app/Homepage/page.tsx` - Sign out funkcionalnost

---

#### F-003: Granularne i audit uloge ✅
**Status:** ✅ **IMPLEMENTIRANO**
- ✅ Role enum: STUDENT, INSTRUCTOR, ADMINISTRATOR
- ✅ Granularne provjere uloga u API rutama
- ⚠️ Audit log - **DJELOMIČNO** (ima `createdAt`, `updatedAt`, ali nema eksplicitni audit log)

**Implementacija:**
- `prisma/schema.prisma` - Role enum
- `src/app/lib/api-helpers.ts` - `requireRole()` funkcija
- Sve API rute provjeravaju uloge

---

#### F-008: Struktura Tečaj → Modul → Lekcija ⚠️
**Status:** ⚠️ **DJELOMIČNO IMPLEMENTIRANO**
- ✅ Tečaj (Course) model postoji
- ✅ Lekcija (Lesson) model postoji
- ❌ **Modul (Module) model NEDOSTAJE** - struktura je Tečaj → Lekcija (bez modula)

**Implementacija:**
- `prisma/schema.prisma` - Course i Lesson modeli
- `src/app/api/courses/` - API za tečajeve
- `src/app/api/lessons/` - API za lekcije

**Nedostaje:**
- Module model u bazi
- API rute za module
- Frontend prikaz modula

---

#### F-009: Lekcija sa video i receptom ✅
**Status:** ✅ **IMPLEMENTIRANO**
- ✅ Video materijal (videoUrl u Lesson modelu)
- ✅ Recept sa sastojcima (ingredients)
- ✅ Količine i opis koraka (steps)
- ✅ Razina težine (difficultyLevel u LiveWorkshop, ali ne u Lesson)
- ⚠️ Generiranje kupovne liste - **DJELOMIČNO** (ingredients postoji, ali nema eksplicitna generacija liste)

**Implementacija:**
- `prisma/schema.prisma` - Lesson model (videoUrl, ingredients, steps, nutrition)
- `src/app/Components/VideoLectures.tsx` - prikaz videa i recepta
- YouTube embed podrška

**Nedostaje:**
- Eksplicitna generacija kupovne liste (PDF/print)
- difficultyLevel u Lesson modelu (ima samo u LiveWorkshop)

---

#### F-010: Kvizovi i zadaci ✅
**Status:** ✅ **IMPLEMENTIRANO**
- ✅ Dodavanje kvizova na lekcije
- ✅ Provjera znanja kroz kvizove
- ✅ Bilježenje rezultata
- ✅ Povijest kvizova

**Implementacija:**
- `prisma/schema.prisma` - Quiz, Question, QuizResult modeli
- `src/app/api/quizzes/` - API za kvizove
- `src/app/api/quiz-results/` - API za rezultate
- `src/app/Components/QuizDialog.tsx` - UI za kvizove
- `src/app/quiz-history/page.tsx` - povijest rezultata

---

#### F-011: Ocjene, recenzije, Q&A ✅
**Status:** ✅ **IMPLEMENTIRANO**
- ✅ Ocjenjivanje lekcija (1-5 zvjezdica)
- ✅ Recenzije sa komentarima
- ✅ Dodavanje fotografija u recenzije
- ✅ Q&A sustav (pitanja i odgovori)
- ✅ Odgovori instruktora na recenzije
- ✅ Prikaz prosjeka i recenzija

**Implementacija:**
- `prisma/schema.prisma` - LessonReview, LessonQuestion, LessonAnswer modeli
- `src/app/api/lesson-reviews/` - API za recenzije
- `src/app/api/lesson-questions/` - API za pitanja
- `src/app/api/lesson-answers/` - API za odgovore
- `src/app/functions/useLessonFeedback.ts` - frontend logika

**Nedostaje:**
- Ocjenjivanje tečajeva (samo lekcije)
- Ocjenjivanje instruktora (samo lekcije)

---

#### F-012: Live radionice ✅
**Status:** ✅ **IMPLEMENTIRANO**
- ✅ Definiranje rasporeda
- ✅ Broj mjesta (maxParticipants)
- ✅ Trajanje (duration)
- ✅ Preduvjeti (prerequisites)
- ✅ Status radionice (UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED)
- ✅ Registracije korisnika
- ✅ Notifikacije

**Implementacija:**
- `prisma/schema.prisma` - LiveWorkshop, WorkshopRegistration, WorkshopNotification modeli
- `src/app/api/workshops/` - API za radionice
- `src/app/api/workshop-registrations/` - API za registracije
- `src/app/Components/LiveWorkshops.tsx` - UI za radionice
- `src/app/functions/useLiveWorkshops.ts` - frontend logika

**Nedostaje:**
- Integracija sa streaming servisom (ima polja, ali nema implementaciju)
- Google Calendar sinkronizacija (ima model, ali nema implementaciju)

---

#### F-013: Administrator upravljanje ⚠️
**Status:** ⚠️ **DJELOMIČNO IMPLEMENTIRANO**
- ✅ Provjere uloga u API rutama (ADMINISTRATOR može sve)
- ✅ Administrator može upravljati tečajevima
- ✅ Administrator može upravljati lekcijama
- ✅ Administrator može upravljati kvizovima
- ✅ Administrator može odgovarati na recenzije
- ❌ **Nedostaje admin UI/panel**
- ❌ **Nedostaje upravljanje korisnicima**
- ❌ **Nedostaje moderacija recenzija**

**Implementacija:**
- `src/app/lib/api-helpers.ts` - `requireRole()` sa ADMINISTRATOR provjerom
- Sve API rute imaju admin provjere

**Nedostaje:**
- Admin dashboard/panel
- API za upravljanje korisnicima
- UI za moderaciju sadržaja

---

### ❌ NEDOSTAJE (6/17)

#### F-004: Kreiranje i uređivanje korisničkog profila ❌
**Status:** ❌ **NEDOSTAJE**
- ❌ API za kreiranje/uređivanje profila
- ❌ Polja u User modelu: razina vještine, kulinarske preferencije, alergije, omiljene kuhinje, povijest tečajeva, bilješke
- ❌ Frontend za profil

**Trenutno:**
- User model ima samo: id, email, name, role, image
- Nema polja za preferencije, alergije, itd.

---

#### F-005: Profil instruktora ❌
**Status:** ❌ **NEDOSTAJE**
- ❌ Biografija instruktora
- ❌ Specijalizacije
- ❌ Popis recepata
- ❌ Prosječna ocjena
- ❌ Recenzije instruktora

**Trenutno:**
- Instruktor je samo User sa role=INSTRUCTOR
- Nema dodatnih polja za instruktora

---

#### F-006: Promjena lozinke pri prvom prijavljivanju ❌
**Status:** ❌ **NEDOSTAJE**
- ❌ Provjera je li prva prijava
- ❌ Force password change
- ❌ API za promjenu lozinke

---

#### F-007: Verifikacija instruktora ❌
**Status:** ❌ **NEDOSTAJE**
- ❌ Upload identifikacijskih dokumenata
- ❌ Admin odobrenje
- ❌ Status verifikacije u User modelu

**Trenutno:**
- Nema polje za verifikaciju u User modelu
- Nema API za upload dokumenata
- Nema admin UI za odobrenje

---

#### F-014: Personalizirane preporuke ❌
**Status:** ❌ **NEDOSTAJE**
- ❌ Algoritam preporuke
- ❌ API za preporuke
- ❌ Frontend prikaz preporuka

**Trenutno:**
- Nema implementacije preporuka

---

#### F-015: Pretraga i filtriranje ❌
**Status:** ❌ **NEDOSTAJE**
- ❌ Pretraga po sastojcima
- ❌ Filtriranje po alergenima
- ❌ Filtriranje po kuhinji
- ❌ Filtriranje po razini težine
- ❌ Filtriranje po trajanju
- ❌ Filtriranje po ocjeni
- ❌ Filtriranje po tipu
- ❌ Prehrambeni planovi (vegan, keto, bez glutena)

**Trenutno:**
- VideoLectures prikazuje sve lekcije bez pretrage/filtriranja
- Nema search input
- Nema filter komponente

---

#### F-016: Napredak, zadatci i certifikat ❌
**Status:** ❌ **NEDOSTAJE**
- ❌ Praćenje napretka po lekciji (% dovršenosti)
- ❌ Praćenje napretka po tečaju (% dovršenosti)
- ❌ Generiranje digitalnog certifikata (PDF)
- ❌ Oznaka na profilu

**Trenutno:**
- Nema model za praćenje napretka
- Nema API za napredak
- Nema generiranje PDF certifikata

---

#### F-017: Obavijesti ❌
**Status:** ⚠️ **DJELOMIČNO IMPLEMENTIRANO**
- ✅ Email servis postavljen (`email-service.ts`)
- ✅ Dobrodošli emaili pri registraciji
- ✅ Workshop notifikacije (model postoji)
- ❌ Obavijesti o novim lekcijama
- ❌ Podsjetnici za live radionice
- ❌ Tjedni sažetci napretka
- ❌ Push obavijesti

**Trenutno:**
- `src/app/lib/email-service.ts` - email servis
- WorkshopNotification model postoji
- Nema scheduler/cron za automatske obavijesti
- Nema push notification servis

---

## Sažetak

### Statistika implementacije:
- ✅ **Potpuno implementirano:** 6/17 (35%)
- ⚠️ **Djelomično implementirano:** 5/17 (29%)
- ❌ **Nedostaje:** 6/17 (35%)

### Prioriteti za daljnji razvoj:

**Visoki prioritet (nedostaju):**
1. F-004: Korisnički profil (razina vještine, preferencije, alergije)
2. F-005: Profil instruktora (biografija, specijalizacije, ocjene)
3. F-006: Promjena lozinke pri prvom prijavljivanju
4. F-007: Verifikacija instruktora

**Srednji prioritet:**
5. F-008: Dodati Module model (Tečaj → Modul → Lekcija)
6. F-013: Admin UI panel
7. F-015: Pretraga i filtriranje

**Nizak prioritet:**
8. F-014: Personalizirane preporuke
9. F-016: Napredak i certifikati
10. F-017: Automatske obavijesti (scheduler)

### Napomene:
- OAuth: Google i GitHub su implementirani, ali nedostaju Apple i Microsoft
- Struktura: Nedostaje Module sloj između Course i Lesson
- Profili: User model je minimalan, nedostaju svi detalji profila
- Admin: Backend provjere postoje, ali nema admin UI
