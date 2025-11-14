import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Kreiraj korisnike (instruktore i studente)
  console.log("👥 Creating users...");

  const instructor1 = await prisma.user.upsert({
    where: { email: "ana.kovac@example.com" },
    update: {},
    create: {
      email: "ana.kovac@example.com",
      name: "Ana Kovač",
      passwordHash: await hashPassword("password123"),
      role: Role.INSTRUCTOR,
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: "marko.li@example.com" },
    update: {},
    create: {
      email: "marko.li@example.com",
      name: "Marko Li",
      passwordHash: await hashPassword("password123"),
      role: Role.INSTRUCTOR,
    },
  });

  const instructor3 = await prisma.user.upsert({
    where: { email: "ivana.horvat@example.com" },
    update: {},
    create: {
      email: "ivana.horvat@example.com",
      name: "Ivana Horvat",
      passwordHash: await hashPassword("password123"),
      role: Role.INSTRUCTOR,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Test Student",
      passwordHash: await hashPassword("password123"),
      role: Role.STUDENT,
    },
  });

  console.log("✅ Users created");

  // 2. Kreiraj kurseve
  console.log("📚 Creating courses...");

  const course1 = await prisma.course.create({
    data: {
      title: "Osnove mediteranske kuhinje",
      description:
        "Naučite pripremiti klasična mediteranska jela uz fokus na svježe sastojke i zdrave tehnike kuhanja.",
      instructorId: instructor1.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Azijski street food kod kuće",
      description:
        "Rekreirajte popularna ulična jela iz cijele Azije koristeći lokalno dostupne sastojke.",
      instructorId: instructor2.id,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: "Plant-based specijaliteti",
      description:
        "Ukusna jela na biljnoj bazi koja impresioniraju i najtvrdokornije mesojede.",
      instructorId: instructor3.id,
    },
  });

  console.log("✅ Courses created");

  // 3. Kreiraj lekcije
  console.log("📖 Creating lessons...");

  // Lekcija 1: Svježa tjestenina od nule
  const lesson1 = await prisma.lesson.create({
    data: {
      title: "Svježa tjestenina od nule",
      description:
        "Korak-po-korak vodič za pripremu svježe tjestenine, od miješenja tijesta do savršene teksture.",
      content:
        "U ovoj lekciji naučit ćete kako odabrati pravo brašno, pravilno mijesiti tijesto i oblikovati tjesteninu.",
      videoUrl: "https://www.youtube.com/watch?v=EnXb1u9UoBU",
      published: true,
      courseId: course1.id,
      steps: JSON.stringify([
        "Pomiješajte brašno i jaja dok se ne formira čvrsto tijesto.",
        "Tijesto mijesite 8-10 minuta dok ne postane glatko.",
        "Ostavite tijesto da odmori najmanje 30 minuta u hladnjaku.",
        "Razvaljajte tijesto i oblikujte željeni tip tjestenine.",
        "Kuhajte u kipućoj vodi 2-3 minute dok ne bude al dente.",
      ]),
      ingredients: JSON.stringify([
        { name: "Glatko brašno (tip 00)", amount: "300 g" },
        { name: "Jaja", amount: "3 velika" },
        { name: "Maslinovo ulje", amount: "1 žlica" },
        { name: "Sol", amount: "1 prstohvat" },
      ]),
      nutrition: JSON.stringify([
        { label: "Kalorije", value: "320 kcal po porciji" },
        { label: "Ugljikohidrati", value: "54 g" },
        { label: "Bjelančevine", value: "13 g" },
        { label: "Masti", value: "6 g" },
      ]),
    },
  });

  // Lekcija 2: Savršeni domaći pesto
  const lesson2 = await prisma.lesson.create({
    data: {
      title: "Savršeni domaći pesto",
      description:
        "Naučite napraviti aromatični pesto koristeći tradicionalnu tehniku uz tučak i mužar.",
      content:
        "Prikazujemo kako odabrati svježe začinsko bilje, orašaste plodove te postići savršenu teksturu pesta.",
      videoUrl: "https://www.youtube.com/watch?v=4aZr5hZXP_s",
      published: true,
      courseId: course1.id,
      steps: JSON.stringify([
        "Pripremite svježi bosiljak, pinjole, češnjak, parmezan i maslinovo ulje.",
        "Lagano tostirajte pinjole na tavi kako bi razvili aromu.",
        "Koristite tučak i mužar za usitnjavanje sastojaka redoslijedom: češnjak, sol, bosiljak, pinjoli.",
        "Dodajte naribani parmezan i postupno ulijevajte maslinovo ulje uz miješanje.",
        "Pesto poslužite odmah ili spremite u hladnjak uz sloj maslinova ulja.",
      ]),
      ingredients: JSON.stringify([
        { name: "Svježi bosiljak", amount: "2 šalice listova" },
        { name: "Pinjoli", amount: "40 g" },
        { name: "Češnjak", amount: "2 češnja" },
        { name: "Parmezan", amount: "50 g naribanog" },
        { name: "Ekstra djevičansko maslinovo ulje", amount: "80 ml" },
        { name: "Morska sol", amount: "po ukusu" },
      ]),
      nutrition: JSON.stringify([
        { label: "Kalorije", value: "90 kcal po žlici" },
        { label: "Ugljikohidrati", value: "2 g" },
        { label: "Bjelančevine", value: "2 g" },
        { label: "Masti", value: "9 g" },
        { label: "Vlakna", value: "1 g" },
      ]),
    },
  });

  // Lekcija 3: Pho juha u 30 minuta
  const lesson3 = await prisma.lesson.create({
    data: {
      title: "Pho juha u 30 minuta",
      description: "Skraćena verzija tradicionalne vijetnamske juhe s bogatim umamijem.",
      content:
        "Otkrivamo kako slojevito graditi okus juhe koristeći začine, meso i svježe dodatke.",
      videoUrl: "https://www.youtube.com/watch?v=WSWwYeEuSLg",
      published: true,
      courseId: course2.id,
      steps: JSON.stringify([
        "Pripremite začine: zvjezdasti anis, klinčiće, cimet, korijander i kardamom.",
        "U tavi kratko tostirajte začine kako bi otpustili aromu.",
        "U loncu prokuhajte temeljac i dodajte pržene začine te luk i đumbir.",
        "Dodajte proteine po izboru (govedina, piletina) i kuhajte do željene mekoće.",
        "Poslužite s rižinim rezancima, svježim začinskim biljem i limetom.",
      ]),
      ingredients: JSON.stringify([
        { name: "Goveđi ili pileći temeljac", amount: "1,5 l" },
        { name: "Rižini rezanci", amount: "200 g" },
        { name: "Zvjezdasti anis", amount: "2 komada" },
        { name: "Klinčići", amount: "4 komada" },
        { name: "Cimet štapić", amount: "1 komad" },
        { name: "Đumbir", amount: "4 kriške" },
        { name: "Luk", amount: "1 veći" },
        { name: "Proteini po izboru", amount: "300 g" },
      ]),
      nutrition: JSON.stringify([
        { label: "Kalorije", value: "410 kcal po porciji" },
        { label: "Ugljikohidrati", value: "45 g" },
        { label: "Bjelančevine", value: "28 g" },
        { label: "Masti", value: "12 g" },
        { label: "Natrij", value: "980 mg" },
      ]),
    },
  });

  // Lekcija 4: Japanske gyoze
  const lesson4 = await prisma.lesson.create({
    data: {
      title: "Japanske gyoze",
      description: "Savršeno hrskavi i sočni ravioli punjeni svinjetinom i povrćem.",
      content:
        "U ovoj lekciji učimo bračno tijesto, punjenje i tehniku pečenja/kuhanja gyoza.",
      videoUrl: "https://www.youtube.com/watch?v=VoTqzjg83u8",
      published: true,
      courseId: course2.id,
      steps: JSON.stringify([
        "Pomiješajte sastojke za tijesto i ostavite da odmori 20 minuta.",
        "Pripremite nadjev od mljevenog mesa, kupusa, đumbira i sojinog umaka.",
        "Razvaljajte tijesto i izrežite krugove promjera oko 8 cm.",
        "Punite gyoze i preklopite ih u oblik polumjeseca uz naborane rubove.",
        "Pržite na tavi do zlatne boje, zatim dodajte vodu i poklopite da se ispare.",
      ]),
      ingredients: JSON.stringify([
        { name: "Pšenično brašno", amount: "250 g" },
        { name: "Voda", amount: "140 ml" },
        { name: "Mljevena svinjetina", amount: "200 g" },
        { name: "Narezani kineski kupus", amount: "150 g" },
        { name: "Sojin umak", amount: "2 žlice" },
        { name: "Svježi đumbir", amount: "1 žlica naribanog" },
        { name: "Sezamovo ulje", amount: "1 žličica" },
      ]),
      nutrition: JSON.stringify([
        { label: "Kalorije", value: "280 kcal po porciji (5 gyoza)" },
        { label: "Ugljikohidrati", value: "30 g" },
        { label: "Bjelančevine", value: "12 g" },
        { label: "Masti", value: "12 g" },
        { label: "Natrij", value: "540 mg" },
      ]),
    },
  });

  // Lekcija 5: Burger od leće
  const lesson5 = await prisma.lesson.create({
    data: {
      title: "Burger od leće",
      description: "Sočni burger od crvene leće i dimljenih začina.",
      content: "Kroz lekciju prolazimo pripremu leće, vezivanje smjese i pečenje.",
      videoUrl: "https://www.youtube.com/watch?v=oK8doU7-KTw",
      published: true,
      courseId: course3.id,
      steps: JSON.stringify([
        "Sameljite kuhanu crvenu leću i povrće u multipraktiku.",
        "Dodajte lanene sjemenke, začine i krušne mrvice za vezivanje.",
        "Oblikujte burgere i kratko ih ohladite u hladnjaku.",
        "Pecite na tavi ili roštilju 3-4 minute sa svake strane.",
        "Poslužite u pecivu s omiljenim prilozima i umacima.",
      ]),
      ingredients: JSON.stringify([
        { name: "Kuhana crvena leća", amount: "300 g" },
        { name: "Sitno sjeckani luk", amount: "1 manji" },
        { name: "Naribana mrkva", amount: "1 srednja" },
        { name: "Lanene sjemenke", amount: "2 žlice mljevenih" },
        { name: "Krušne mrvice", amount: "60 g" },
        { name: "Dimljena paprika", amount: "1 žličica" },
        { name: "Sol i papar", amount: "po ukusu" },
        { name: "Maslinovo ulje", amount: "2 žlice" },
      ]),
      nutrition: JSON.stringify([
        { label: "Kalorije", value: "260 kcal po burgeru" },
        { label: "Ugljikohidrati", value: "28 g" },
        { label: "Bjelančevine", value: "12 g" },
        { label: "Masti", value: "9 g" },
        { label: "Vlakna", value: "8 g" },
      ]),
    },
  });

  console.log("✅ Lessons created");

  // 4. Kreiraj kvizove
  console.log("🧩 Creating quizzes...");

  // Kviz 1: Svježa tjestenina
  const quiz1 = await prisma.quiz.create({
    data: {
      title: "Provjera znanja: Svježa tjestenina",
      description: "Provjerite koliko ste naučili o pripremi svježe tjestenine.",
      lessonId: lesson1.id,
      questions: {
        create: [
          {
            text: "Koje je optimalno vrijeme odmaranja tijesta prije oblikovanja?",
            options: JSON.stringify(["5 minuta", "15 minuta", "30 minuta", "1 sat"]),
            correctAnswer: 2,
          },
          {
            text: "Koje brašno daje najbolju elastičnost svježoj tjestenini?",
            options: JSON.stringify(["Tip 400", "Semolina", "Integralno brašno", "Heljdino brašno"]),
            correctAnswer: 1,
          },
          {
            text: "Što je ključ za sprječavanje lijepljenja svježe tjestenine?",
            options: JSON.stringify([
              "Korištenje dosta ulja",
              "Dodavanje šećera u tijesto",
              "Obilno posipanje brašnom",
              "Korištenje hladne vode",
            ]),
            correctAnswer: 2,
          },
        ],
      },
    },
  });

  // Kviz 2: Pesto
  const quiz2 = await prisma.quiz.create({
    data: {
      title: "Provjera znanja: Pesto",
      description: "Koliko dobro poznajete tajne savršenog pesta?",
      lessonId: lesson2.id,
      questions: {
        create: [
          {
            text: "Koji sir se tradicionalno koristi u pestu alla genovese?",
            options: JSON.stringify(["Gouda", "Parmezan", "Cheddar", "Gauda"]),
            correctAnswer: 1,
          },
          {
            text: "Koja metoda čuva najviše arome u pestu?",
            options: JSON.stringify([
              "Blendanje na visokoj brzini",
              "Korištenje tučka i mužara",
              "Dodavanje šećera",
              "Zamrzavanje sastojaka prije pripreme",
            ]),
            correctAnswer: 1,
          },
        ],
      },
    },
  });

  // Kviz 3: Pho
  const quiz3 = await prisma.quiz.create({
    data: {
      title: "Provjera znanja: Pho",
      description: "Provjerite znanje o ključnim sastojcima Pho juhe.",
      lessonId: lesson3.id,
      questions: {
        create: [
          {
            text: "Koji začin daje Pho juhi prepoznatljiv miris?",
            options: JSON.stringify(["Zvjezdasti anis", "Šafran", "Kardamom", "Kurkuma"]),
            correctAnswer: 0,
          },
          {
            text: "Koja vrsta rezanaca se koristi u Pho juhi?",
            options: JSON.stringify(["Pšenični rezanci", "Rižini rezanci", "Udon rezanci", "Soba rezanci"]),
            correctAnswer: 1,
          },
        ],
      },
    },
  });

  // Kviz 4: Burger od leće
  const quiz4 = await prisma.quiz.create({
    data: {
      title: "Provjera znanja: Burger od leće",
      description: "Testirajte znanje o pripremi burgera od leće.",
      lessonId: lesson5.id,
      questions: {
        create: [
          {
            text: "Koji sastojak pomaže vezati smjesu za burger?",
            options: JSON.stringify(["Lanene sjemenke", "Šećer", "Maslac", "Sojino mlijeko"]),
            correctAnswer: 0,
          },
        ],
      },
    },
  });

  console.log("✅ Quizzes created");

  // 5. Kreiraj radionice
  console.log("🎯 Creating workshops...");

  const workshop1 = await prisma.liveWorkshop.create({
    data: {
      title: "Live radionica: Svježa tjestenina u praksi",
      description: "Praktična radionica gdje ćemo zajedno napraviti svježu tjesteninu od nule.",
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Za 7 dana
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // + 2 sata
      duration: 120, // 2 sata
      timeZone: "Europe/Zagreb",
      instructorId: instructor1.id,
      maxParticipants: 10,
      currentParticipants: 0,
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      requirements: JSON.stringify([
        { name: "Brašno tip 00", required: true },
        { name: "Jaja", required: true },
        { name: "Maslinovo ulje", required: true },
      ]),
      status: "UPCOMING",
    },
  });

  const workshop2 = await prisma.liveWorkshop.create({
    data: {
      title: "Live radionica: Pho juha u 30 minuta",
      description: "Naučite napraviti autentičnu Pho juhu u kratkom vremenu.",
      startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Za 14 dana
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // + 90 minuta
      duration: 90,
      timeZone: "Europe/Zagreb",
      instructorId: instructor2.id,
      maxParticipants: 15,
      currentParticipants: 0,
      meetingUrl: "https://meet.google.com/xyz-uvwx-rst",
      requirements: JSON.stringify([
        { name: "Goveđi temeljac", required: true },
        { name: "Rižini rezanci", required: true },
        { name: "Zvjezdasti anis", required: true },
      ]),
      status: "UPCOMING",
    },
  });

  console.log("✅ Workshops created");

  console.log("🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- Users: 4 (3 instructors, 1 student)`);
  console.log(`- Courses: 3`);
  console.log(`- Lessons: 5`);
  console.log(`- Quizzes: 4`);
  console.log(`- Workshops: 2`);
  console.log("\n🔑 Test credentials:");
  console.log(`- Instructor 1: ana.kovac@example.com / password123`);
  console.log(`- Instructor 2: marko.li@example.com / password123`);
  console.log(`- Instructor 3: ivana.horvat@example.com / password123`);
  console.log(`- Student: student@example.com / password123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

