import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";
import { cache } from "@/app/lib/cache";

// GET /api/courses/:id - Dohvati kurs po ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Kurs nije pronađen" },
        { status: 404 }
      );
    }

    // Transformacija za frontend
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description || "",
      difficultyLevel: course.difficultyLevel || null,
      duration: course.duration || null,
      instructorId: course.instructorId,
      instructorName: course.instructor.name || course.instructor.email,
      lessons: course.lessons.map((lesson) => ({
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
      })),
      createdAt: course.createdAt,
    };

    return NextResponse.json(transformedCourse);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju kursa" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/:id - Ažuriraj kurs
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userRole } = await requireAuth();

    const body = await request.json();
    const { title, description, difficultyLevel, duration } = body;

    // Provjeri da li kurs postoji
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Kurs nije pronađen" },
        { status: 404 }
      );
    }

    // Provjeri da li je korisnik vlasnik ili admin
    if (
      existingCourse.instructorId !== userId &&
      userRole !== Role.ADMINISTRATOR
    ) {
      return NextResponse.json(
        { message: "Nemate dozvolu za ažuriranje ovog kursa" },
        { status: 403 }
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(difficultyLevel !== undefined && { difficultyLevel: difficultyLevel || null }),
        ...(duration !== undefined && {
          duration:
            typeof duration === "number"
              ? duration
              : duration
                ? Number(duration)
                : null,
        }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // Transformacija za frontend
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description || "",
      difficultyLevel: course.difficultyLevel || null,
      duration: course.duration || null,
      instructorId: course.instructorId,
      instructorName: course.instructor.name || course.instructor.email,
      lessons: course.lessons.map((lesson) => ({
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
      })),
      createdAt: course.createdAt,
    };

    // VAŽNO: Invalidate cache after update so list updates immediately
    cache.delete("courses:all");

    return NextResponse.json(transformedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri ažuriranju kursa" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/:id - Obriši kurs
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userRole } = await requireAuth();

    // Provjeri da li kurs postoji
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Kurs nije pronađen" },
        { status: 404 }
      );
    }

    // Provjeri da li je korisnik vlasnik ili admin
    if (
      existingCourse.instructorId !== userId &&
      userRole !== Role.ADMINISTRATOR
    ) {
      return NextResponse.json(
        { message: "Nemate dozvolu za brisanje ovog kursa" },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    // VAŽNO: Invalidate cache after delete so list updates immediately
    cache.delete("courses:all");

    return NextResponse.json({ message: "Kurs je uspješno obrisan" });
  } catch (error) {
    console.error("Error deleting course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri brisanju kursa" },
      { status: 500 }
    );
  }
}

