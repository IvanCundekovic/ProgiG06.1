import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// GET /api/lesson-answers - Dohvati sve odgovore
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    const where: Record<string, unknown> = {};
    if (questionId) {
      where.questionId = questionId;
    }

    const answers = await prisma.lessonAnswer.findMany({
      where,
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
    });

    // Transformacija za frontend
    const transformedAnswers = answers.map((answer) => ({
      id: answer.id,
      questionId: answer.questionId,
      responderId: answer.responderId,
      responderName: answer.responderName,
      message: answer.message,
      createdAt: answer.createdAt.toISOString(),
    }));

    return NextResponse.json(transformedAnswers);
  } catch (error) {
    console.error("Error fetching lesson answers:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju odgovora" },
      { status: 500 }
    );
  }
}

// POST /api/lesson-answers - Odgovori na pitanje
export async function POST(request: NextRequest) {
  try {
    const { userId, userRole } = await requireAuth();

    const body = await request.json();
    const { questionId, message } = body;

    if (!questionId || !message || !message.trim()) {
      return NextResponse.json(
        { message: "ID pitanja i poruka su obavezni" },
        { status: 400 }
      );
    }

    // Provjeri da li pitanje postoji
    const question = await prisma.lessonQuestion.findUnique({
      where: { id: questionId },
      include: {
        lesson: {
          select: {
            id: true,
            course: {
              select: {
                id: true,
                instructorId: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Pitanje nije pronađeno" },
        { status: 404 }
      );
    }

    // UC-10: Samo instruktor tečaja (ili admin) može odgovarati na Q&A
    const courseInstructorId = question.lesson?.course.instructorId;
    if (!courseInstructorId) {
      return NextResponse.json({ message: "Tečaj nije pronađen" }, { status: 404 });
    }

    const canAnswer =
      userRole === Role.ADMINISTRATOR ||
      (userRole === Role.INSTRUCTOR && courseInstructorId === userId);

    if (!canAnswer) {
      return NextResponse.json(
        { message: "Samo instruktor tečaja može odgovarati na pitanja" },
        { status: 403 }
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

    // Kreiraj odgovor
    const answer = await prisma.lessonAnswer.create({
      data: {
        questionId,
        responderId: userId,
        responderName: user.name || user.email || "User",
        message: message.trim(),
      },
    });

    // Transformacija za frontend
    const transformedAnswer = {
      id: answer.id,
      questionId: answer.questionId,
      responderId: answer.responderId,
      responderName: answer.responderName,
      message: answer.message,
      createdAt: answer.createdAt.toISOString(),
    };

    return NextResponse.json(transformedAnswer, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson answer:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri kreiranju odgovora" },
      { status: 500 }
    );
  }
}
