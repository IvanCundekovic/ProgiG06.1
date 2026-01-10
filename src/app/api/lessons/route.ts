import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// GET /api/lessons - Dohvati sve lekcije
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const published = searchParams.get("published");

    const where: Record<string, unknown> = {};
    if (courseId) {
      where.courseId = courseId;
    }
    if (published !== null) {
      where.published = published === "true";
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        quiz: {
          include: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transformacija za frontend
    const transformedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || undefined,
      published: lesson.published,
      createdAt: lesson.createdAt,
      steps: lesson.steps ? JSON.parse(lesson.steps) : undefined,
      ingredients: lesson.ingredients
        ? JSON.parse(lesson.ingredients)
        : undefined,
      nutrition: lesson.nutrition ? JSON.parse(lesson.nutrition) : undefined,
      quiz: lesson.quiz
        ? {
            id: lesson.quiz.id,
            title: lesson.quiz.title,
            description: lesson.quiz.description || "",
            questions: lesson.quiz.questions.map((q) => ({
              id: q.id,
              text: q.text,
              options: JSON.parse(q.options),
              correctAnswer: q.correctAnswer,
            })),
            createdAt: lesson.quiz.createdAt,
          }
        : undefined,
    }));

    return NextResponse.json(transformedLessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju lekcija" },
      { status: 500 }
    );
  }
}

// POST /api/lessons - Kreiraj novu lekciju
export async function POST(request: NextRequest) {
  try {
    const { userId, userRole } = await requireAuth();
    requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);

    const body = await request.json();
    const {
      title,
      description,
      content,
      courseId,
      videoUrl,
      published,
      steps,
      ingredients,
      nutrition,
    } = body;

    if (!title || !courseId) {
      return NextResponse.json(
        { message: "Naziv lekcije i ID kursa su obavezni" },
        { status: 400 }
      );
    }

    // Provjeri da li kurs postoji i da li je korisnik vlasnik
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Kurs nije pronađen" },
        { status: 404 }
      );
    }

    if (course.instructorId !== userId && userRole !== Role.ADMINISTRATOR) {
      return NextResponse.json(
        { message: "Nemate dozvolu za dodavanje lekcija u ovaj kurs" },
        { status: 403 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description: description || null,
        content: content || null,
        courseId,
        videoUrl: videoUrl || null,
        published: published || false,
        steps: steps ? JSON.stringify(steps) : null,
        ingredients: ingredients ? JSON.stringify(ingredients) : null,
        nutrition: nutrition ? JSON.stringify(nutrition) : null,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    // F-017: Pošalji obavijest o novoj lekciji ako je objavljena
    if (published) {
      // Pozovi API endpoint asinkrono (ne blokiramo odgovor)
      fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/new-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, courseId }),
      }).catch((error) => {
        console.error("Error sending lesson notification:", error);
        // Ne blokiramo ako obavijest ne uspije
      });
    }

    // Transformacija za frontend
    const transformedLesson = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || undefined,
      published: lesson.published,
      createdAt: lesson.createdAt,
      steps: lesson.steps ? JSON.parse(lesson.steps) : undefined,
      ingredients: lesson.ingredients
        ? JSON.parse(lesson.ingredients)
        : undefined,
      nutrition: lesson.nutrition ? JSON.parse(lesson.nutrition) : undefined,
      quiz: lesson.quiz
        ? {
            id: lesson.quiz.id,
            title: lesson.quiz.title,
            description: lesson.quiz.description || "",
            questions: lesson.quiz.questions.map((q) => ({
              id: q.id,
              text: q.text,
              options: JSON.parse(q.options),
              correctAnswer: q.correctAnswer,
            })),
            createdAt: lesson.quiz.createdAt,
          }
        : undefined,
    };

    return NextResponse.json(transformedLesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    if (errorMessage === "Nemate dozvolu za ovu akciju") {
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Greška pri kreiranju lekcije" },
      { status: 500 }
    );
  }
}

