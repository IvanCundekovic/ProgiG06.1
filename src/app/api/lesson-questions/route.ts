import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// GET /api/lesson-questions - Dohvati sva pitanja
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const courseId = searchParams.get("courseId");

    const where: Record<string, unknown> = {};
    if (lessonId) {
      where.lessonId = lessonId;
    }
    if (courseId) {
      where.courseId = courseId;
    }

    const questions = await prisma.lessonQuestion.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            responder: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformacija za frontend
    const transformedQuestions = questions.map((question) => ({
      id: question.id,
      courseId: question.courseId,
      lessonId: question.lessonId,
      userId: question.userId,
      userName: question.userName,
      question: question.question,
      createdAt: question.createdAt.toISOString(),
      answers: question.answers.map((answer) => ({
        id: answer.id,
        questionId: answer.questionId,
        responderId: answer.responderId,
        responderName: answer.responderName,
        message: answer.message,
        createdAt: answer.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json(transformedQuestions);
  } catch (error) {
    console.error("Error fetching lesson questions:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju pitanja" },
      { status: 500 }
    );
  }
}

// POST /api/lesson-questions - Postavi novo pitanje
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const { courseId, lessonId, question } = body;

    if (!courseId || !lessonId || !question || !question.trim()) {
      return NextResponse.json(
        { message: "ID kursa, ID lekcije i pitanje su obavezni" },
        { status: 400 }
      );
    }

    // Provjeri da li lekcija postoji
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { message: "Lekcija nije pronađena" },
        { status: 404 }
      );
    }

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

    // Kreiraj pitanje
    const createdQuestion = await prisma.lessonQuestion.create({
      data: {
        courseId,
        lessonId,
        userId,
        userName: user.name || user.email || "User",
        question: question.trim(),
      },
    });

    // Transformacija za frontend
    const transformedQuestion = {
      id: createdQuestion.id,
      courseId: createdQuestion.courseId,
      lessonId: createdQuestion.lessonId,
      userId: createdQuestion.userId,
      userName: createdQuestion.userName,
      question: createdQuestion.question,
      createdAt: createdQuestion.createdAt.toISOString(),
      answers: [],
    };

    return NextResponse.json(transformedQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson question:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri kreiranju pitanja" },
      { status: 500 }
    );
  }
}
