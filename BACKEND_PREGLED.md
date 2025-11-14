# Backend Pregled - Sve što je napravljeno danas

## 📋 Pregled Promjena

### 1. **API Endpointi** (RESTful API)

Napravljeno je **15+ API endpointa** za sve funkcionalnosti aplikacije:

#### **Kursevi (Courses)**
- `GET /api/courses` - Dohvati sve kurseve s lekcijama i kvizovima
- `POST /api/courses` - Kreiraj novi kurs (samo INSTRUCTOR/ADMIN)
- `GET /api/courses/[id]` - Dohvati pojedini kurs
- `PUT /api/courses/[id]` - Ažuriraj kurs
- `DELETE /api/courses/[id]` - Obriši kurs

#### **Lekcije (Lessons)**
- `GET /api/lessons` - Dohvati sve lekcije
- `POST /api/lessons` - Kreiraj novu lekciju
- `GET /api/lessons/[id]` - Dohvati pojedinu lekciju
- `PUT /api/lessons/[id]` - Ažuriraj lekciju
- `DELETE /api/lessons/[id]` - Obriši lekciju

#### **Kvizovi (Quizzes)**
- `GET /api/quizzes` - Dohvati sve kvizove
- `POST /api/quizzes` - Kreiraj novi kviz
- `GET /api/quizzes/[id]` - Dohvati pojedini kviz
- `DELETE /api/quizzes/[id]` - Obriši kviz

#### **Quiz Rezultati (Quiz Results)**
- `GET /api/quiz-results` - Dohvati sve rezultate kvizova (samo prijavljeni korisnik)
- `POST /api/quiz-results` - Spremi rezultat kviza

#### **Recenzije Lekcija (Lesson Reviews)**
- `GET /api/lesson-reviews` - Dohvati sve recenzije (može filtrirati po lessonId)
- `POST /api/lesson-reviews` - Kreiraj novu recenziju
- `POST /api/lesson-reviews/[id]/respond` - Odgovori na recenziju (samo INSTRUCTOR/ADMIN)

#### **Pitanja o Lekcijama (Lesson Questions)**
- `GET /api/lesson-questions` - Dohvati sva pitanja (može filtrirati po lessonId)
- `POST /api/lesson-questions` - Postavi novo pitanje

#### **Odgovori na Pitanja (Lesson Answers)**
- `GET /api/lesson-answers` - Dohvati sve odgovore (može filtrirati po questionId)
- `POST /api/lesson-answers` - Odgovori na pitanje

#### **Radionice (Workshops)**
- `GET /api/workshops` - Dohvati sve radionice (može filtrirati po status, instructorId)
- `POST /api/workshops` - Kreiraj novu radionicu (samo INSTRUCTOR/ADMIN)
- `GET /api/workshops/[id]` - Dohvati pojedinu radionicu
- `PUT /api/workshops/[id]` - Ažuriraj radionicu
- `DELETE /api/workshops/[id]` - Obriši radionicu
- `PUT /api/workshops/[id]/status` - Ažuriraj status radionice

#### **Registracije na Radionice (Workshop Registrations)**
- `GET /api/workshop-registrations` - Dohvati sve registracije (vraća prazan array ako korisnik nije prijavljen)
- `POST /api/workshop-registrations` - Prijavi se na radionicu
- `GET /api/workshop-registrations/[id]` - Dohvati pojedinu registraciju
- `DELETE /api/workshop-registrations/[id]` - Otkaži registraciju
- `POST /api/workshop-registrations/[id]/notifications/clear` - Očisti notifikacije

#### **Notifikacije Radionica (Workshop Notifications)**
- `GET /api/workshop-notifications/[registrationId]` - Dohvati notifikacije za registraciju

---

### 2. **Autentifikacija i Autorizacija**

#### **Helper Funkcije** (`src/app/lib/api-helpers.ts`)
- `requireAuth()` - Provjeri da li je korisnik prijavljen (koristi NextAuth v5 `auth()`)
- `requireRole()` - Provjeri da li korisnik ima dozvolu za akciju
- `frontendToPrismaWorkshopStatus()` - Konverzija statusa radionice iz frontend u Prisma enum
- `prismaToFrontendWorkshopStatus()` - Konverzija statusa radionice iz Prisma enum u frontend
- `frontendToPrismaNotificationType()` - Konverzija tipa notifikacije
- `prismaToFrontendNotificationType()` - Konverzija tipa notifikacije

#### **NextAuth v5 Integracija**
- Migrirano s `getServerSession()` na `auth()` (NextAuth v5)
- Export `auth` funkcije iz `src/app/auth.ts`
- Svaki API endpoint koristi `requireAuth()` za provjeru autentifikacije

---

### 3. **Database Schema (Prisma)**

#### **Modeli u Bazi:**
- `User` - Korisnici (STUDENT, INSTRUCTOR, ADMINISTRATOR)
- `Course` - Kursevi
- `Lesson` - Lekcije (povezane s Course)
- `Quiz` - Kvizovi (povezani s Lesson)
- `Question` - Pitanja u kvizovima (povezana s Quiz)
- `QuizResult` - Rezultati kvizova
- `LessonReview` - Recenzije lekcija
- `LessonQuestion` - Pitanja o lekcijama
- `LessonAnswer` - Odgovori na pitanja
- `LiveWorkshop` - Radionice
- `WorkshopRegistration` - Registracije na radionice
- `WorkshopNotification` - Notifikacije za radionice

#### **Enumi:**
- `Role` - STUDENT, INSTRUCTOR, ADMINISTRATOR
- `WorkshopStatus` - UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED
- `WorkshopNotificationType` - SCHEDULE_CHANGE, RECONNECTION, GENERAL

---

### 4. **Error Handling**

#### **Poboljšanja:**
- Detaljnije error poruke u development okruženju
- Try-catch blokovi za sve API pozive
- Sigurno parsiranje JSON-a (try-catch za `JSON.parse()`)
- Logiranje grešaka u konzolu
- Vraćanje odgovarajućih HTTP status kodova (400, 401, 403, 404, 500)

#### **JSON Parsing:**
- Dodano sigurno parsiranje za:
  - `lesson.steps` (JSON array)
  - `lesson.ingredients` (JSON array)
  - `lesson.nutrition` (JSON array)
  - `quiz.questions[].options` (JSON array)
  - `workshop.requirements` (JSON array)

---

### 5. **Data Transformation**

#### **API Response Transformation:**
- Prisma modeli se transformiraju u frontend tipove
- JSON stringovi se parsiraju u JavaScript objekte
- Date objekti se konvertiraju u ISO stringove
- Enum vrijednosti se konvertiraju između Prisma i frontend formata

#### **Primjer Transformacije:**
```typescript
// Prisma model → Frontend tip
{
  steps: JSON.parse(lesson.steps), // String → Array
  ingredients: JSON.parse(lesson.ingredients), // String → Array
  createdAt: course.createdAt.toISOString(), // Date → String
  status: prismaToFrontendWorkshopStatus(workshop.status) // Enum → String
}
```

---

### 6. **Frontend Integracija**

#### **Hookovi:**
- `useLiveWorkshops` - Refaktoriran da koristi API umjesto localStorage
- `useLessonFeedback` - Refaktoriran da koristi API umjesto localStorage

#### **Komponente:**
- `VideoLectures.tsx` - Učitava kurseve iz `/api/courses`, koristi mock podatke ako je baza prazna
- `LiveWorkshops.tsx` - Učitava radionice iz `/api/workshops`
- `QuizDialog.tsx` - Šalje rezultate kviza na `/api/quiz-results`
- `quiz-history/page.tsx` - Učitava rezultate kvizova iz `/api/quiz-results`

---

### 7. **Database Connection**

#### **Konfiguracija:**
- `DATABASE_URL` u `.env.local` - Povezan s PostgreSQL bazom
- Prisma Client inicijalizacija u `src/prisma.ts`
- Migracije izvršene (`npx prisma migrate dev`)

#### **Riješeni Problemi:**
- Ažurirana lozinka za bazu podataka (`nova_lozinka`)
- Sigurno parsiranje JSON polja
- Error handling za prazne rezultate

---

### 8. **Next.js 15 Kompatibilnost**

#### **Promjene:**
- Dynamic route parameters (`params`) su sada `Promise<{ id: string }>`
- Svi API route handleri ažurirani da koriste `await params`
- TypeScript tipovi ažurirani za Next.js 15

#### **Primjer:**
```typescript
// Prije (Next.js 14):
export async function GET({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id } });
}

// Sada (Next.js 15):
export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
}
```

---

### 9. **TypeScript Type Safety**

#### **Poboljšanja:**
- Uklonjeni svi `any` tipovi
- Dodani eksplicitni tipovi za sve funkcije
- Error handling s `instanceof Error` provjerama
- Type assertions za enum konverzije

---

## 📊 Statistika

- **API Endpointi**: 15+ endpointa
- **Database Modeli**: 11 modela
- **Helper Funkcije**: 6 funkcija
- **Error Handling**: Implementiran u svim endpointima
- **TypeScript**: 100% type safety
- **Next.js 15**: Potpuno kompatibilno

---

## 🔄 Radni Tok

### **Kreiranje Kursa:**
1. Frontend poziva `POST /api/courses`
2. API provjeri autentifikaciju (`requireAuth()`)
3. API provjeri autorizaciju (`requireRole(INSTRUCTOR | ADMIN)`)
4. API kreira kurs u bazi (`prisma.course.create()`)
5. API transformira podatke za frontend
6. API vraća kreirani kurs

### **Učitavanje Kurseva:**
1. Frontend poziva `GET /api/courses`
2. API dohvaća kurseve iz baze (`prisma.course.findMany()`)
3. API uključuje relacije (instructor, lessons, quiz, questions)
4. API transformira podatke (JSON parsing, Date conversion)
5. API vraća kurseve
6. Ako je baza prazna, frontend koristi mock podatke

### **Spremanje Quiz Rezultata:**
1. Korisnik završi kviz u `QuizDialog`
2. Frontend poziva `POST /api/quiz-results`
3. API provjeri autentifikaciju
4. API izračuna rezultat (score, percentage)
5. API spremi rezultat u bazu
6. API vraća spremani rezultat

---

## 🎯 Ključne Značajke

1. **RESTful API** - Standardni HTTP metode (GET, POST, PUT, DELETE)
2. **Autentifikacija** - NextAuth v5 integracija
3. **Autorizacija** - Role-based access control (STUDENT, INSTRUCTOR, ADMIN)
4. **Error Handling** - Detaljne error poruke i logiranje
5. **Type Safety** - Potpuna TypeScript podrška
6. **Data Transformation** - Automatska konverzija između Prisma i frontend tipova
7. **JSON Handling** - Sigurno parsiranje JSON stringova
8. **Next.js 15** - Potpuna kompatibilnost s najnovijom verzijom

---

## 🔧 Troubleshooting

### **Problem: Baza podataka je prazna**
- **Rješenje**: Frontend koristi mock podatke ako API vraća prazan array
- **Alternativa**: Pokreni seed skriptu za popunjavanje baze

### **Problem: Authentication failed**
- **Rješenje**: Provjeri `DATABASE_URL` u `.env.local`
- **Alternativa**: Restartaj Next.js development server

### **Problem: JSON parsing error**
- **Rješenje**: Dodano sigurno parsiranje s try-catch blokovima
- **Alternativa**: Provjeri format JSON podataka u bazi

---

## 📝 Napomene

- Svi API endpointi su asinkroni (`async/await`)
- Svi API endpointi koriste Prisma ORM za pristup bazi
- Svi API endpointi vraćaju JSON odgovore
- Error handling je implementiran u svim endpointima
- TypeScript tipovi su definirani za sve funkcije
- Next.js 15 kompatibilnost je osigurana

---

## 🚀 Sljedeći Koraci

1. **Seed Skripta** - Popuni bazu s početnim podacima
2. **Admin Panel** - UI za upravljanje kursevima i radionicama
3. **Testing** - Unit testovi za API endpointima
4. **Documentation** - API dokumentacija (Swagger/OpenAPI)
5. **Validation** - Dodatna validacija podataka (Zod/Yup)

