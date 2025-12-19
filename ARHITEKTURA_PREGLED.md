# Pregled arhitekture - Backend, Frontend i Baza podataka

## 📊 Pregled: Što je gdje?

### 🔴 BACKEND (API rute - `/src/app/api/`)

Sve API rute su **backend** - rade na serveru i komuniciraju s bazom podataka:

#### **Korisnički profil i autentikacija:**
- ✅ `/api/profile` - GET/PUT korisnički profil
- ✅ `/api/profile/change-password` - POST promjena lozinke
- ✅ `/api/users/[id]/delete` - DELETE GDPR brisanje računa (danas kreirano)
- ✅ `/api/auth/providers` - GET dostupni OAuth provideri (danas kreirano)
- ✅ `/api/auth/[...nextauth]` - NextAuth.js autentikacija
- ✅ `/api/register` - POST registracija

#### **Tečajevi, lekcije i moduli:**
- ✅ `/api/courses` - GET/POST tečajevi (s caching - danas dodano)
- ✅ `/api/courses/[id]` - GET/PUT/DELETE pojedinačni tečaj
- ✅ `/api/lessons` - GET/POST lekcije
- ✅ `/api/lessons/[id]` - GET/PUT/DELETE pojedinačna lekcija
- ✅ `/api/modules` - GET/POST moduli (danas kreirano)
- ✅ `/api/modules/[id]` - GET/PUT/DELETE moduli (danas kreirano)

#### **Kvizovi i rezultati:**
- ✅ `/api/quizzes` - GET/POST kvizovi
- ✅ `/api/quizzes/[id]` - GET pojedinačni kviz
- ✅ `/api/quiz-results` - GET/POST rezultati kvizova

#### **Recenzije i Q&A:**
- ✅ `/api/lesson-reviews` - GET/POST recenzije lekcija
- ✅ `/api/lesson-reviews/[id]/respond` - POST odgovor instruktora
- ✅ `/api/lesson-questions` - GET/POST pitanja o lekcijama
- ✅ `/api/lesson-answers` - GET/POST odgovori na pitanja

#### **Live radionice:**
- ✅ `/api/workshops` - GET/POST live radionice
- ✅ `/api/workshops/[id]` - GET/PUT pojedinačna radionica
- ✅ `/api/workshops/[id]/status` - PUT promjena statusa
- ✅ `/api/workshop-registrations` - GET/POST registracije
- ✅ `/api/workshop-registrations/[id]` - DELETE odjava
- ✅ `/api/workshop-notifications/[registrationId]` - DELETE obavijesti

#### **Napredak i certifikati:**
- ✅ `/api/progress` - GET/POST praćenje napretka (danas kreirano)
- ✅ `/api/certificates` - GET/POST certifikati (danas kreirano)

#### **Preporuke:**
- ✅ `/api/recommendations` - GET personalizirane preporuke (danas popravljeno)

#### **Obavijesti:**
- ✅ `/api/notifications/new-lesson` - POST obavijest o novoj lekciji
- ✅ `/api/notifications/workshop-reminders` - POST podsjetnici za radionice
- ✅ `/api/notifications/weekly-summary` - POST tjedni sažetak

#### **Admin funkcionalnosti:**
- ✅ `/api/admin/users` - GET/PUT/DELETE upravljanje korisnicima
- ✅ `/api/admin/reviews` - GET/DELETE moderacija recenzija

#### **Instruktor funkcionalnosti:**
- ✅ `/api/instructors/[id]/verify` - POST/PUT verifikacija instruktora (danas kreirano)

#### **Helper funkcije:**
- ✅ `/src/app/lib/cache.ts` - Caching strategija (danas kreirano)
- ✅ `/src/app/lib/api-helpers.ts` - Helper funkcije za autentikaciju/autorizaciju
- ✅ `/src/app/lib/auth-utils.ts` - Auth utility funkcije
- ✅ `/src/app/lib/email-service.ts` - Email servis (Resend)

---

### 🟢 FRONTEND (Komponente i stranice - `/src/app/`)

Sve komponente i stranice su **frontend** - rade u browseru:

#### **Glavne stranice:**
- ✅ `/src/app/page.tsx` - Homepage
- ✅ `/src/app/Homepage/page.tsx` - Glavna stranica (danas: dark mode, responzivnost)
- ✅ `/src/app/LoginPage/page.tsx` - Prijava/Registracija (danas: OAuth provjera)
- ✅ `/src/app/profile/page.tsx` - Korisnički profil (danas: GDPR tab)
- ✅ `/src/app/admin/page.tsx` - Admin panel
- ✅ `/src/app/quiz-history/page.tsx` - Povijest kvizova
- ✅ `/src/app/privacy/page.tsx` - Privacy Policy (danas: X gumb)
- ✅ `/src/app/terms/page.tsx` - Terms of Service (danas: X gumb)

#### **Komponente:**
- ✅ `/src/app/Components/VideoLectures.tsx` - Video lekcije (danas: API povezivanje)
- ✅ `/src/app/Components/LiveWorkshops.tsx` - Live radionice
- ✅ `/src/app/Components/CookingRecipes.tsx` - Recepti (danas: API povezivanje)
- ✅ `/src/app/Components/Extra.tsx` - Kvizovi i preporuke
- ✅ `/src/app/Components/QuizDialog.tsx` - Dialog za kvizove
- ✅ `/src/app/Components/Recommendations.tsx` - Preporuke (danas: popravljeno)

#### **Providers i konfiguracija:**
- ✅ `/src/app/providers.tsx` - Theme provider (danas: dark mode)
- ✅ `/src/app/layout.tsx` - Root layout
- ✅ `/src/app/auth.ts` - NextAuth konfiguracija (danas: OAuth provjera)

#### **Custom hooks:**
- ✅ `/src/app/functions/useLessonFeedback.ts` - Hook za feedback
- ✅ `/src/app/functions/useLiveWorkshops.ts` - Hook za radionice
- ✅ `/src/app/functions/useLocalStorage.ts` - Hook za localStorage

---

### 🟡 BAZA PODATAKA (Prisma Schema - `/prisma/schema.prisma`)

Sve modele i relacije definira **Prisma schema**:

#### **Korisnici i autentikacija:**
- ✅ `User` - Korisnici (s poljima za GDPR, verifikaciju)
- ✅ `Account` - OAuth računi
- ✅ `Session` - Sesije
- ✅ `VerificationToken` - Tokeni za verifikaciju

#### **Profil:**
- ✅ `UserProfile` - Korisnički profil (preferencije, alergije, itd.)
- ✅ `InstructorProfile` - Profil instruktora
- ✅ `InstructorReview` - Recenzije instruktora

#### **Tečajevi i lekcije:**
- ✅ `Course` - Tečajevi
- ✅ `Module` - Moduli (danas dodano)
- ✅ `Lesson` - Lekcije (s poljima za filtriranje)
- ✅ `Quiz` - Kvizovi
- ✅ `Question` - Pitanja u kvizovima
- ✅ `QuizResult` - Rezultati kvizova

#### **Recenzije i Q&A:**
- ✅ `LessonReview` - Recenzije lekcija
- ✅ `LessonQuestion` - Pitanja o lekcijama
- ✅ `LessonAnswer` - Odgovori na pitanja

#### **Live radionice:**
- ✅ `LiveWorkshop` - Live radionice
- ✅ `WorkshopRegistration` - Registracije na radionice
- ✅ `WorkshopNotification` - Obavijesti o radionicama

#### **Napredak i certifikati:**
- ✅ `Progress` - Praćenje napretka (danas dodano)
- ✅ `Certificate` - Certifikati (danas dodano)

#### **Ostalo:**
- ✅ `GoogleCalendarSettings` - Google Calendar integracija

---

## 🔗 Kako sve radi zajedno?

### **Primjer: Preporuke (danas popravljeno)**

1. **Frontend** (`Recommendations.tsx`):
   ```typescript
   fetch("/api/recommendations")  // Poziva backend API
   ```

2. **Backend** (`/api/recommendations/route.ts`):
   ```typescript
   const user = await prisma.user.findUnique({...})  // Čita iz baze
   const courses = await prisma.course.findMany({...})  // Čita iz baze
   return NextResponse.json({recommendations})  // Vraća podatke
   ```

3. **Baza podataka** (PostgreSQL):
   - Prisma ORM komunicira s bazom
   - SQL upiti se izvršavaju
   - Podaci se vraćaju kroz Prisma

### **Primjer: GDPR brisanje računa (danas kreirano)**

1. **Frontend** (`profile/page.tsx`):
   ```typescript
   fetch(`/api/users/${userId}/delete`, {method: "DELETE"})
   ```

2. **Backend** (`/api/users/[id]/delete/route.ts`):
   ```typescript
   await prisma.user.delete({where: {id}})  // Briše iz baze (cascade)
   ```

3. **Baza podataka**:
   - Cascade briše sve povezane podatke (progress, certificates, reviews, itd.)

---

## 📝 Što je danas kreirano/modificirano?

### **Backend (API rute):**
- ✅ `/api/users/[id]/delete` - GDPR brisanje računa
- ✅ `/api/auth/providers` - OAuth provider provjera
- ✅ `/api/courses` - Dodan caching
- ✅ `/src/app/lib/cache.ts` - Caching helper

### **Frontend:**
- ✅ `Recommendations.tsx` - Popravljeno (provjera autentikacije)
- ✅ `CookingRecipes.tsx` - Povezano s API-jem
- ✅ `providers.tsx` - Dark mode
- ✅ `Homepage/page.tsx` - Responzivnost, dark mode toggle
- ✅ `LoginPage/page.tsx` - OAuth provjera
- ✅ `profile/page.tsx` - GDPR tab
- ✅ `privacy/page.tsx` - X gumb
- ✅ `terms/page.tsx` - X gumb

### **Baza podataka:**
- ✅ Već postojeći modeli (UserProfile, Progress, Certificate, Module)
- ✅ Nema novih migracija danas

---

## ✅ Zaključak

**Sve je povezano:**
- ✅ **Backend** (API rute) komunicira s **bazom podataka** (Prisma)
- ✅ **Frontend** (komponente) poziva **backend** (API rute)
- ✅ **Baza podataka** pohranjuje sve podatke

**Arhitektura:**
```
Frontend (React/Next.js) 
    ↓ fetch()
Backend (Next.js API Routes)
    ↓ Prisma ORM
Baza podataka (PostgreSQL)
```

Sve funkcionalnosti koje smo danas dodali su **potpuno povezane** - frontend poziva backend, backend čita/piše u bazu podataka!
