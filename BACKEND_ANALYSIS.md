# Analiza Backend Zahtjeva - Kuhaona Platforma

## 📊 Trenutno Stanje

### Postojeći Modeli u Prisma Shemi:
- ✅ `User` - Korisnici (STUDENT, INSTRUCTOR, ADMINISTRATOR)
- ✅ `Account`, `Session`, `VerificationToken` - NextAuth.js moduli
- ✅ `GoogleCalendarSettings` - Google Calendar integracija
- ✅ `LiveWorkshop` - Live radionice (djelomično implementirano)

### Postojeći API Endpointi:
- ✅ `POST /api/register` - Registracija korisnika
- ✅ `GET/POST /api/auth/[...nextauth]` - Autentifikacija (NextAuth.js)

---

## ❌ Što Nedostaje u Bazi Podataka

### 1. **Course (Kursevi)**
Frontend koristi `Course` type ali nema modela u bazi:
- `id`, `title`, `description`
- `instructorId`, `instructorName` (relacija na User)
- `lessons` (relacija na Lesson[])
- `createdAt`

### 2. **Lesson (Lekcije)**
Frontend koristi `Lesson` type ali nema modela u bazi:
- `id`, `title`, `description`
- `courseId` (relacija na Course)
- `videoUrl`, `content`
- `steps` (JSON array)
- `ingredients` (JSON array)
- `nutrition` (JSON array)
- `quiz` (relacija na Quiz - opcionalno)
- `published` (boolean)
- `createdAt`

### 3. **Quiz (Kvizovi)**
Frontend koristi `Quiz` type ali nema modela u bazi:
- `id`, `title`, `description`
- `lessonId` (relacija na Lesson - opcionalno)
- `questions` (relacija na Question[])
- `createdAt`

### 4. **Question (Pitanja u kvizovima)**
Frontend koristi `Question` type ali nema modela u bazi:
- `id`, `text`
- `quizId` (relacija na Quiz)
- `options` (JSON array)
- `correctAnswer` (number - index)

### 5. **QuizResult (Rezultati kvizova)**
Frontend koristi `QuizResult` type ali nema modela u bazi:
- `id`, `quizId`, `quizTitle`
- `lessonId`, `lessonTitle`
- `courseId`, `courseTitle`
- `userId` (relacija na User)
- `userName`
- `answers` (JSON array - QuizAnswer[])
- `score`, `totalQuestions`, `percentage`
- `completedAt`
- `isCompleted` (boolean)

### 6. **LessonReview (Recenzije lekcija)**
Frontend koristi `LessonReview` type ali nema modela u bazi:
- `id`
- `courseId`, `lessonId` (relacije)
- `userId` (relacija na User)
- `userName`
- `rating` (number 1-5)
- `comment` (text - opcionalno)
- `photoDataUrl` (text - opcionalno, base64 slika)
- `createdAt`
- `instructorResponse` (text - opcionalno)
- `responseAt`, `responseAuthorId`, `responseAuthorName`

### 7. **LessonQuestion (Pitanja o lekcijama)**
Frontend koristi `LessonQuestion` type ali nema modela u bazi:
- `id`
- `courseId`, `lessonId` (relacije)
- `userId` (relacija na User)
- `userName`
- `question` (text)
- `createdAt`
- `answers` (relacija na LessonAnswer[])

### 8. **LessonAnswer (Odgovori na pitanja o lekcijama)**
Frontend koristi `LessonAnswer` type ali nema modela u bazi:
- `id`
- `questionId` (relacija na LessonQuestion)
- `responderId` (relacija na User)
- `responderName`
- `message` (text)
- `createdAt`

### 9. **WorkshopRegistration (Registracije za radionice)**
Frontend koristi `WorkshopRegistration` type ali nema modela u bazi:
- `id`
- `workshopId` (relacija na LiveWorkshop)
- `userId` (relacija na User)
- `userName`
- `registeredAt`
- `notifications` (relacija na WorkshopNotification[])

### 10. **WorkshopNotification (Notifikacije za radionice)**
Frontend koristi `WorkshopNotification` type ali nema modela u bazi:
- `id`
- `registrationId` (relacija na WorkshopRegistration)
- `message` (text)
- `type` (enum: "schedule_change" | "reconnection" | "general")
- `createdAt`

### 11. **WorkshopRequirement (Preduvjeti za radionice)**
Frontend koristi `WorkshopRequirement` type ali trenutno je samo JSON u LiveWorkshop:
- Treba li biti zasebni model ili ostati JSON?
- `id`, `description`
- `type` (enum: "completedLesson" | "completedCourse" | "custom")
- `lessonId`, `courseId` (opcionalno)

---

## 🔧 Dodatna Poboljšanja za LiveWorkshop

Trenutni `LiveWorkshop` model već postoji, ali možda treba:
- ✅ Relacija na `WorkshopRegistration[]`
- ✅ Relacija na `WorkshopNotification[]` (preko WorkshopRegistration)
- ⚠️ `requirements` trenutno je `String? @db.Text` - možda treba biti JSON ili zasebni model
- ✅ `googleCalendarEventId` već postoji

---

## 🚀 Potrebni API Endpointi

### Courses (Kursevi)
- `GET /api/courses` - Dohvati sve kurseve
- `GET /api/courses/:id` - Dohvati kurs po ID
- `POST /api/courses` - Kreiraj novi kurs (INSTRUCTOR/ADMIN)
- `PUT /api/courses/:id` - Ažuriraj kurs (INSTRUCTOR/ADMIN)
- `DELETE /api/courses/:id` - Obriši kurs (INSTRUCTOR/ADMIN)

### Lessons (Lekcije)
- `GET /api/lessons` - Dohvati sve lekcije (možda filtrirati po courseId)
- `GET /api/lessons/:id` - Dohvati lekciju po ID
- `POST /api/lessons` - Kreiraj novu lekciju (INSTRUCTOR/ADMIN)
- `PUT /api/lessons/:id` - Ažuriraj lekciju (INSTRUCTOR/ADMIN)
- `DELETE /api/lessons/:id` - Obriši lekciju (INSTRUCTOR/ADMIN)

### Quizzes (Kvizovi)
- `GET /api/quizzes` - Dohvati sve kvizove
- `GET /api/quizzes/:id` - Dohvati kviz po ID
- `GET /api/quizzes/lesson/:lessonId` - Dohvati kviz za lekciju
- `POST /api/quizzes` - Kreiraj novi kviz (INSTRUCTOR/ADMIN)
- `PUT /api/quizzes/:id` - Ažuriraj kviz (INSTRUCTOR/ADMIN)
- `DELETE /api/quizzes/:id` - Obriši kviz (INSTRUCTOR/ADMIN)

### Quiz Results (Rezultati kvizova)
- `GET /api/quiz-results` - Dohvati sve rezultate korisnika
- `GET /api/quiz-results/:id` - Dohvati rezultat po ID
- `GET /api/quiz-results/user/:userId` - Dohvati rezultate korisnika
- `POST /api/quiz-results` - Predaj kviz i kreiraj rezultat (STUDENT)
- ⚠️ `DELETE` možda nije potreban (arhiviranje?)

### Lesson Reviews (Recenzije lekcija)
- `GET /api/lesson-reviews` - Dohvati sve recenzije (možda filtrirati po lessonId)
- `GET /api/lesson-reviews/:id` - Dohvati recenziju po ID
- `POST /api/lesson-reviews` - Kreiraj novu recenziju (STUDENT)
- `PUT /api/lesson-reviews/:id` - Ažuriraj recenziju (STUDENT - samo svoju)
- `POST /api/lesson-reviews/:id/respond` - Odgovori na recenziju (INSTRUCTOR)
- `DELETE /api/lesson-reviews/:id` - Obriši recenziju (STUDENT - samo svoju, ADMIN - sve)

### Lesson Questions (Pitanja o lekcijama)
- `GET /api/lesson-questions` - Dohvati sva pitanja (možda filtrirati po lessonId)
- `GET /api/lesson-questions/:id` - Dohvati pitanje po ID
- `POST /api/lesson-questions` - Postavi novo pitanje (STUDENT)
- `DELETE /api/lesson-questions/:id` - Obriši pitanje (STUDENT - samo svoje, ADMIN - sve)

### Lesson Answers (Odgovori na pitanja)
- `GET /api/lesson-answers` - Dohvati sve odgovore (možda filtrirati po questionId)
- `GET /api/lesson-answers/:id` - Dohvati odgovor po ID
- `POST /api/lesson-answers` - Odgovori na pitanje (INSTRUCTOR/STUDENT)
- `PUT /api/lesson-answers/:id` - Ažuriraj odgovor (samo svoj)
- `DELETE /api/lesson-answers/:id` - Obriši odgovor (samo svoj, ADMIN - sve)

### Workshop Registrations (Registracije za radionice)
- `GET /api/workshop-registrations` - Dohvati sve registracije (možda filtrirati po workshopId)
- `GET /api/workshop-registrations/:id` - Dohvati registraciju po ID
- `POST /api/workshop-registrations` - Prijavi se na radionicu (STUDENT)
- `DELETE /api/workshop-registrations/:id` - Odjavi se s radionice (STUDENT - samo svoju)
- `GET /api/workshop-registrations/workshop/:workshopId` - Dohvati sve registracije za radionicu

### Workshop Notifications (Notifikacije za radionice)
- `GET /api/workshop-notifications` - Dohvati sve notifikacije (možda filtrirati po registrationId)
- `POST /api/workshop-notifications` - Kreiraj notifikaciju (sistem/INSTRUCTOR)
- `DELETE /api/workshop-notifications/:id` - Obriši notifikaciju
- `PUT /api/workshop-notifications/:registrationId/clear` - Obriši sve notifikacije za registraciju

### Live Workshops (Ažuriranje postojećeg)
- `GET /api/workshops` - Dohvati sve radionice (već postoji?)
- `GET /api/workshops/:id` - Dohvati radionicu po ID
- `POST /api/workshops` - Kreiraj novu radionicu (INSTRUCTOR/ADMIN)
- `PUT /api/workshops/:id` - Ažuriraj radionicu (INSTRUCTOR/ADMIN)
- `PUT /api/workshops/:id/status` - Ažuriraj status radionice
- `POST /api/workshops/:id/sync-calendar` - Sinkroniziraj s Google Calendarom

---

## 📋 Plan Implementacije

### Faza 1: Prisma Schema
1. ✅ Dodati `Course` model
2. ✅ Dodati `Lesson` model
3. ✅ Dodati `Quiz` model
4. ✅ Dodati `Question` model
5. ✅ Dodati `QuizResult` model
6. ✅ Dodati `LessonReview` model
7. ✅ Dodati `LessonQuestion` model
8. ✅ Dodati `LessonAnswer` model
9. ✅ Dodati `WorkshopRegistration` model
10. ✅ Dodati `WorkshopNotification` model
11. ✅ Ažurirati `LiveWorkshop` model (dodati relacije)
12. ✅ Kreirati migraciju
13. ✅ Pokrenuti migraciju

### Faza 2: API Endpointi
1. ✅ Courses API
2. ✅ Lessons API
3. ✅ Quizzes API
4. ✅ Quiz Results API
5. ✅ Lesson Reviews API
6. ✅ Lesson Questions API
7. ✅ Lesson Answers API
8. ✅ Workshop Registrations API
9. ✅ Workshop Notifications API
10. ✅ Live Workshops API (ažuriranje)

### Faza 3: Autentifikacija i Autorizacija
1. ✅ Provjera uloga korisnika (STUDENT, INSTRUCTOR, ADMINISTRATOR)
2. ✅ Middleware za zaštitu endpointa
3. ✅ Provjera vlasništva (korisnik može mijenjati samo svoje podatke)

### Faza 4: Validacija i Error Handling
1. ✅ Validacija inputa (Zod schema?)
2. ✅ Error handling
3. ✅ Status kodovi (200, 201, 400, 401, 403, 404, 500)

### Faza 5: Integracija s Frontendom
1. ✅ Zamijeniti mock podatke pravim API pozivima
2. ✅ Zamijeniti localStorage pravim API pozivima
3. ✅ Testiranje integracije

---

## ⚠️ Pitanja za Razmatranje

1. **WorkshopRequirement**: Treba li biti zasebni model ili ostati JSON u LiveWorkshop?
   - Prednost zasebnog modela: lakše filtriranje, pretraga, validacija
   - Prednost JSON: jednostavnije, fleksibilnije

2. **Foto u LessonReview**: Spremati kao base64 u bazi ili upload na storage (S3, Cloudinary)?
   - Base64: jednostavnije, ali veća baza
   - Storage: bolje performanse, ali dodatna infrastruktura

3. **Arhiviranje podataka**: Treba li soft delete ili hard delete?
   - Soft delete: `deletedAt` field
   - Hard delete: trajno brisanje

4. **Paginacija**: Kako implementirati paginaciju za liste?
   - Offset pagination
   - Cursor pagination

5. **Caching**: Treba li caching za česte upite?
   - Redis?
   - Next.js cache?

---

## ✅ Izvedivost

**DA, potpuno izvedivo!**

Svi zahtjevi su standardni CRUD operacije koje se mogu implementirati s:
- Prisma ORM (već postavljen)
- Next.js API Routes (već postavljen)
- PostgreSQL baza (već postavljena)
- NextAuth.js autentifikacija (već postavljena)

**Procijenjeno vrijeme:**
- Prisma Schema + Migracije: 2-3 sata
- API Endpointi: 8-12 sati
- Autentifikacija i Autorizacija: 2-3 sata
- Validacija i Error Handling: 2-3 sata
- Integracija s Frontendom: 4-6 sati

**Ukupno: ~18-27 sati rada**

---

## 🎯 Sljedeći Koraci

1. **Potvrditi plan** s timom
2. **Odlučiti o pitanjima** iz gornjeg odjeljka
3. **Krenuti s implementacijom** Prisma Schema
4. **Kreirati migracije** i testirati
5. **Implementirati API endpointi** postupno
6. **Testirati** sve endpointi
7. **Integrirati s frontendom**

---

## 📝 Napomene

- Frontend trenutno koristi mock podatke i localStorage
- Treba zamijeniti sve mock pozive pravim API pozivima
- Treba paziti na autentifikaciju i autorizaciju
- Treba implementirati error handling na frontendu
- Treba testirati sve scenarije

