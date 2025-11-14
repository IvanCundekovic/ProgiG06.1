import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

// GET /api/quizzes/:id - Dohvati kviz po ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
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
    });

    if (!quiz) {
      return NextResponse.json(
        { message: "Kviz nije pronađen" },
        { status: 404 }
      );
    }

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

    return NextResponse.json(transformedQuiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju kviza" },
      { status: 500 }
    );
  }
}

