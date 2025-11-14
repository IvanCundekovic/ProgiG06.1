import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// POST /api/lesson-reviews/:id/respond - Odgovori na recenziju
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userRole } = await requireAuth();
    requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { message: "Poruka je obavezna" },
        { status: 400 }
      );
    }

    // Provjeri da li recenzija postoji
    const review = await prisma.lessonReview.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { message: "Recenzija nije pronađena" },
        { status: 404 }
      );
    }

    // Provjeri da li je korisnik instruktor kursa ili admin
    if (
      review.lesson.course.instructorId !== userId &&
      userRole !== Role.ADMINISTRATOR
    ) {
      return NextResponse.json(
        { message: "Nemate dozvolu za odgovaranje na ovu recenziju" },
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

    // Ažuriraj recenziju s odgovorom
    const updatedReview = await prisma.lessonReview.update({
      where: { id },
      data: {
        instructorResponse: message.trim(),
        responseAt: new Date(),
        responseAuthorId: userId,
        responseAuthorName: user.name || user.email || "Instructor",
      },
    });

    // Transformacija za frontend
    const transformedReview = {
      id: updatedReview.id,
      courseId: updatedReview.courseId,
      lessonId: updatedReview.lessonId,
      userId: updatedReview.userId,
      userName: updatedReview.userName,
      rating: updatedReview.rating,
      comment: updatedReview.comment || undefined,
      photoDataUrl: updatedReview.photoDataUrl || undefined,
      createdAt: updatedReview.createdAt.toISOString(),
      instructorResponse: updatedReview.instructorResponse || undefined,
      responseAt: updatedReview.responseAt?.toISOString(),
      responseAuthorId: updatedReview.responseAuthorId || undefined,
      responseAuthorName: updatedReview.responseAuthorName || undefined,
    };

    return NextResponse.json(transformedReview);
  } catch (error) {
    console.error("Error responding to review:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    if (errorMessage === "Nemate dozvolu za ovu akciju") {
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Greška pri odgovaranju na recenziju" },
      { status: 500 }
    );
  }
}
