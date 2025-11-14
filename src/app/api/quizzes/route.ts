import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// GET /api/quizzes - Dohvati sve kvizove
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    const where: Record<string, unknown> = {};
    if (lessonId) {
      where.lessonId = lessonId;
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
        questions: {
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
    const transformedQuizzes = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || "",
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer,
      })),
      createdAt: quiz.createdAt,
    }));

    return NextResponse.json(transformedQuizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju kvizova" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Kreiraj novi kviz
export async function POST(request: NextRequest) {
  try {
    const { userId, userRole } = await requireAuth();
    requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);

    const body = await request.json();
    const { title, description, lessonId, questions } = body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { message: "Naziv kviza i pitanja su obavezni" },
        { status: 400 }
      );
    }

    // Ako je lessonId naveden, provjeri da li lekcija postoji i da li je korisnik vlasnik
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: true,
        },
      });

      if (!lesson) {
        return NextResponse.json(
          { message: "Lekcija nije pronađena" },
          { status: 404 }
        );
      }

      if (lesson.course.instructorId !== userId && userRole !== Role.ADMINISTRATOR) {
        return NextResponse.json(
          { message: "Nemate dozvolu za dodavanje kviza ovoj lekciji" },
          { status: 403 }
        );
      }

      // Provjeri da li lekcija već ima kviz
      const existingQuiz = await prisma.quiz.findUnique({
        where: { lessonId },
      });

      if (existingQuiz) {
        return NextResponse.json(
          { message: "Lekcija već ima kviz" },
          { status: 400 }
        );
      }
    }

    // Kreiraj kviz s pitanjima
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        lessonId: lessonId || null,
        questions: {
          create: questions.map((q: { text: string; options: string[]; correctAnswer: number }) => ({
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    // Transformacija za frontend
    const transformedQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || "",
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer,
      })),
      createdAt: quiz.createdAt,
    };

    return NextResponse.json(transformedQuiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    if (errorMessage === "Nemate dozvolu za ovu akciju") {
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Greška pri kreiranju kviza" },
      { status: 500 }
    );
  }
}

