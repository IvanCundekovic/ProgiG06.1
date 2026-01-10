import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";
import { getCachedOrFetch } from "@/app/lib/cache";

/**
 * GET /api/courses - Dohvati sve kurseve
 * @returns Array svih tečajeva s lekcijama i instruktorima
 */
export async function GET() {
  try {
    // NF-011: Cache tečajeve na 5 minuta
    const courses = await getCachedOrFetch("courses:all", async () => {
      return await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          where: {
            published: true,
          },
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
        orderBy: {
          createdAt: "desc",
        },
      });
    }, 5 * 60 * 1000); // 5 minuta cache

    // Transformacija za frontend
    const transformedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description || "",
      instructorId: course.instructorId,
      instructorName: course.instructor.name || course.instructor.email,
        lessons: course.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || "",
          content: lesson.content || "",
          difficultyLevel: lesson.difficultyLevel || null,
          duration: lesson.duration || null,
          cuisine: lesson.cuisine || null,
          dietaryTags: lesson.dietaryTags ? JSON.parse(lesson.dietaryTags) : null,
          allergens: lesson.allergens ? JSON.parse(lesson.allergens) : null,
        videoUrl: lesson.videoUrl || undefined,
        published: lesson.published,
        createdAt: lesson.createdAt,
        steps: lesson.steps ? (() => {
          try {
            return JSON.parse(lesson.steps);
          } catch {
            return undefined;
          }
        })() : undefined,
        ingredients: lesson.ingredients ? (() => {
          try {
            return JSON.parse(lesson.ingredients);
          } catch {
            return undefined;
          }
        })() : undefined,
        nutrition: lesson.nutrition ? (() => {
          try {
            return JSON.parse(lesson.nutrition);
          } catch {
            return undefined;
          }
        })() : undefined,
        quiz: lesson.quiz
          ? {
              id: lesson.quiz.id,
              title: lesson.quiz.title,
              description: lesson.quiz.description || "",
              questions: lesson.quiz.questions.map((q) => {
                try {
                  return {
                    id: q.id,
                    text: q.text,
                    options: JSON.parse(q.options),
                    correctAnswer: q.correctAnswer,
                  };
                } catch (parseError) {
                  console.error(`Error parsing question ${q.id} options:`, parseError);
                  return {
                    id: q.id,
                    text: q.text,
                    options: [],
                    correctAnswer: q.correctAnswer,
                  };
                }
              }),
              createdAt: lesson.quiz.createdAt,
            }
          : undefined,
      })),
      createdAt: course.createdAt,
    }));

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      { 
        message: "Greška pri dohvaćanju kurseva",
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/courses - Kreiraj novi kurs
export async function POST(request: NextRequest) {
  try {
    const { userId, userRole } = await requireAuth();
    requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);

    const body = await request.json();
    const { title, description, instructorId } = body;

    if (!title) {
      return NextResponse.json(
        { message: "Naziv kursa je obavezan" },
        { status: 400 }
      );
    }

    // Provjeri da li je korisnik instruktor ili admin
    const finalInstructorId = instructorId || userId;

    const course = await prisma.course.create({
      data: {
        title,
        description: description || null,
        instructorId: finalInstructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: course.id,
        title: course.title,
        description: course.description || "",
        instructorId: course.instructorId,
        instructorName: course.instructor.name || course.instructor.email,
        lessons: [],
        createdAt: course.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    if (errorMessage === "Nemate dozvolu za ovu akciju") {
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Greška pri kreiranju kursa" },
      { status: 500 }
    );
  }
}

