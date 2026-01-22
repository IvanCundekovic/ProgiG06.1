import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";
import { generateCertificatePDF } from "@/app/lib/pdf-generator";

// GET /api/quiz-results - Dohvati sve rezultate korisnika
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");

    const where: Record<string, unknown> = { userId };
    if (quizId) {
      where.quizId = quizId;
    }

    const results = await prisma.quizResult.findMany({
      where,
      include: {
        quiz: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Transformacija za frontend
    const transformedResults = results.map((result) => ({
      id: result.id,
      quizId: result.quizId,
      quizTitle: result.quizTitle,
      lessonId: result.lessonId,
      lessonTitle: result.lessonTitle,
      courseId: result.courseId,
      courseTitle: result.courseTitle,
      userId: result.userId,
      userName: result.userName,
      answers: JSON.parse(result.answers),
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      completedAt: result.completedAt,
      isCompleted: result.isCompleted,
    }));

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri dohvaćanju rezultata" },
      { status: 500 }
    );
  }
}

// POST /api/quiz-results - Predaj kviz i kreiraj rezultat
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const {
      quizId,
      answers, // Array of {questionId, selectedAnswer}
    } = body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: "ID kviza i odgovori su obavezni" },
        { status: 400 }
      );
    }

    // Dohvati kviz s pitanjima
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { message: "Kviz nije pronađen" },
        { status: 404 }
      );
    }

    // Provjeri da li su sva pitanja odgovorena
    if (answers.length !== quiz.questions.length) {
      return NextResponse.json(
        { message: "Morate odgovoriti na sva pitanja" },
        { status: 400 }
      );
    }

    // Izračunaj rezultat
    let score = 0;
    for (const answer of answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.selectedAnswer) {
        score++;
      }
    }

    const percentage = Math.round((score / quiz.questions.length) * 100);

    // Dohvati korisnika
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Korisnik nije pronađen" },
        { status: 404 }
      );
    }

    // Kreiraj rezultat
    const result = await prisma.quizResult.create({
      data: {
        quizId,
        userId,
        quizTitle: quiz.title,
        lessonId: quiz.lessonId || "",
        lessonTitle: quiz.lesson?.title || "",
        courseId: quiz.lesson?.courseId || "",
        courseTitle: quiz.lesson?.course.title || "",
        userName: user.name || user.email || "User",
        answers: JSON.stringify(answers),
        score,
        totalQuestions: quiz.questions.length,
        percentage,
        isCompleted: true,
      },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    // Transformacija za frontend
    const transformedResult = {
      id: result.id,
      quizId: result.quizId,
      quizTitle: result.quizTitle,
      lessonId: result.lessonId,
      lessonTitle: result.lessonTitle,
      courseId: result.courseId,
      courseTitle: result.courseTitle,
      userId: result.userId,
      userName: result.userName,
      answers: JSON.parse(result.answers),
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      completedAt: result.completedAt,
      isCompleted: result.isCompleted,
    };

    // UC-15: Ako je kviz 100% točan, označi lekciju kao riješenu (progress) i po potrebi izdaj certifikat
    const lessonId = quiz.lessonId || "";
    const courseId = quiz.lesson?.courseId || "";

    if (percentage === 100 && lessonId && courseId) {
      await prisma.progress.upsert({
        where: {
          userId_courseId_lessonId: {
            userId,
            courseId,
            lessonId,
          },
        },
        update: {
          completionPercentage: 100,
          isCompleted: true,
          lastAccessedAt: new Date(),
          completedAt: new Date(),
        },
        create: {
          userId,
          courseId,
          lessonId,
          completionPercentage: 100,
          isCompleted: true,
          startedAt: new Date(),
          completedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });

      // Provjeri je li tečaj dovršen (računamo samo objavljene lekcije)
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          lessons: {
            where: { published: true },
            select: { id: true },
          },
        },
      });

      if (course && course.lessons.length > 0) {
        const lessonIds = course.lessons.map((l) => l.id);

        const completedCount = await prisma.progress.count({
          where: {
            userId,
            courseId,
            lessonId: { in: lessonIds },
            isCompleted: true,
          },
        });

        const allCompleted = completedCount === lessonIds.length;
        if (allCompleted) {
          const existingCertificate = await prisma.certificate.findUnique({
            where: {
              userId_courseId: {
                userId,
                courseId,
              },
            },
          });

          if (!existingCertificate) {
            const certificate = await prisma.certificate.create({
              data: {
                userId,
                courseId,
                courseTitle: course.title,
              },
            });

            await prisma.userNotification.create({
              data: {
                userId,
                type: "CERTIFICATE_ISSUED",
                title: "Certifikat",
                message: `Čestitamo! Dovršili ste tečaj "${course.title}" i dobili certifikat.`,
                url: "/Homepage",
              },
            });

            try {
              const userForPdf = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, email: true },
              });

              const userName = userForPdf?.name || userForPdf?.email || "Korisnik";
              const pdfBuffer = await generateCertificatePDF({
                userName,
                courseTitle: course.title,
                issuedAt: certificate.issuedAt,
                certificateId: certificate.id,
              });

              const pdfBase64 = pdfBuffer.toString("base64");
              const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;

              await prisma.certificate.update({
                where: { id: certificate.id },
                data: { pdfUrl },
              });
            } catch (pdfError) {
              console.error("Error generating PDF:", pdfError);
            }
          }
        }
      }
    }

    return NextResponse.json(transformedResult, { status: 201 });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri predaji kviza" },
      { status: 500 }
    );
  }
}
