import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";
import { cache } from "@/app/lib/cache";
import { sendNewLessonNotification } from "@/app/lib/email-service";

// GET /api/lessons/:id - Dohvati lekciju po ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
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

    if (!lesson) {
      return NextResponse.json(
        { message: "Lekcija nije pronađena" },
        { status: 404 }
      );
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

    return NextResponse.json(transformedLesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju lekcije" },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/:id - Ažuriraj lekciju
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userRole } = await requireAuth();

    const body = await request.json();
    const {
      title,
      description,
      content,
      videoUrl,
      published,
      steps,
      ingredients,
      nutrition,
      difficultyLevel,
      duration,
      cuisine,
      dietaryTags,
      allergens,
    } = body;

    // Provjeri da li lekcija postoji
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { message: "Lekcija nije pronađena" },
        { status: 404 }
      );
    }

    // Provjeri da li je korisnik vlasnik kursa ili admin
    if (
      existingLesson.course.instructorId !== userId &&
      userRole !== Role.ADMINISTRATOR
    ) {
      return NextResponse.json(
        { message: "Nemate dozvolu za ažuriranje ove lekcije" },
        { status: 403 }
      );
    }

    const willPublishNow = published === true && existingLesson.published === false;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(content !== undefined && { content: content || null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(published !== undefined && { published }),
        ...(difficultyLevel !== undefined && { difficultyLevel: difficultyLevel || null }),
        ...(duration !== undefined && {
          duration:
            typeof duration === "number"
              ? duration
              : duration
                ? Number(duration)
                : null,
        }),
        ...(cuisine !== undefined && { cuisine: cuisine || null }),
        ...(dietaryTags !== undefined && {
          dietaryTags: dietaryTags ? JSON.stringify(dietaryTags) : null,
        }),
        ...(allergens !== undefined && {
          allergens: allergens ? JSON.stringify(allergens) : null,
        }),
        ...(steps !== undefined && {
          steps: steps ? JSON.stringify(steps) : null,
        }),
        ...(ingredients !== undefined && {
          ingredients: ingredients ? JSON.stringify(ingredients) : null,
        }),
        ...(nutrition !== undefined && {
          nutrition: nutrition ? JSON.stringify(nutrition) : null,
        }),
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

    // Invalidate cache after update
    cache.delete("courses:all");

    // UC-16/F-017: Ako je lekcija upravo objavljena, pošalji obavijesti korisnicima koji su započeli tečaj
    if (willPublishNow) {
      const usersWithProgress = await prisma.progress.findMany({
        where: {
          courseId: existingLesson.courseId,
          isCompleted: false,
        },
        include: {
          user: true,
        },
        distinct: ["userId"],
      });

      const lessonUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/Homepage`;

      Promise.allSettled(
        usersWithProgress.map(async (p) => {
          const user = p.user;
          if (!user.email) return;
          await prisma.userNotification.create({
            data: {
              userId: user.id,
              type: "NEW_LESSON",
              title: "Nova lekcija",
              message: `Nova lekcija "${lesson.title}" dodana je u tečaj "${existingLesson.course.title || "Tečaj"}".`,
              url: "/Homepage",
            },
          });
          await sendNewLessonNotification(
            user.email,
            user.name || user.email.split("@")[0],
            lesson.title,
            existingLesson.course.title || "Tečaj",
            lessonUrl
          );
        })
      ).catch((error) => {
        console.error("Error sending lesson notifications:", error);
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
      difficultyLevel: lesson.difficultyLevel || null,
      duration: lesson.duration || null,
      cuisine: lesson.cuisine || null,
      dietaryTags: lesson.dietaryTags ? JSON.parse(lesson.dietaryTags) : null,
      allergens: lesson.allergens ? JSON.parse(lesson.allergens) : null,
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

    return NextResponse.json(transformedLesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri ažuriranju lekcije" },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/:id - Obriši lekciju
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userRole } = await requireAuth();

    // Provjeri da li lekcija postoji
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { message: "Lekcija nije pronađena" },
        { status: 404 }
      );
    }

    // Provjeri da li je korisnik vlasnik kursa ili admin
    if (
      existingLesson.course.instructorId !== userId &&
      userRole !== Role.ADMINISTRATOR
    ) {
      return NextResponse.json(
        { message: "Nemate dozvolu za brisanje ove lekcije" },
        { status: 403 }
      );
    }

    await prisma.lesson.delete({
      where: { id },
    });

    // VAŽNO: Invalidate cache after delete
    cache.delete("courses:all");

    return NextResponse.json({ message: "Lekcija je uspješno obrisana" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri brisanju lekcije" },
      { status: 500 }
    );
  }
}