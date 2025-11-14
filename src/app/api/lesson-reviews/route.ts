import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// GET /api/lesson-reviews - Dohvati sve recenzije
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

    const reviews = await prisma.lessonReview.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformacija za frontend
    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      courseId: review.courseId,
      lessonId: review.lessonId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment || undefined,
      photoDataUrl: review.photoDataUrl || undefined,
      createdAt: review.createdAt.toISOString(),
      instructorResponse: review.instructorResponse || undefined,
      responseAt: review.responseAt?.toISOString(),
      responseAuthorId: review.responseAuthorId || undefined,
      responseAuthorName: review.responseAuthorName || undefined,
    }));

    return NextResponse.json(transformedReviews);
  } catch (error) {
    console.error("Error fetching lesson reviews:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju recenzija" },
      { status: 500 }
    );
  }
}

// POST /api/lesson-reviews - Kreiraj novu recenziju
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const { courseId, lessonId, rating, comment, photoDataUrl } = body;

    if (!courseId || !lessonId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "ID kursa, ID lekcije i ocjena (1-5) su obavezni" },
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

    // Provjeri da li korisnik već ima recenziju za ovu lekciju
    const existingReview = await prisma.lessonReview.findUnique({
      where: {
        lessonId_userId: {
          lessonId,
          userId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "Već ste dali recenziju za ovu lekciju" },
        { status: 400 }
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

    // Kreiraj recenziju
    const review = await prisma.lessonReview.create({
      data: {
        courseId,
        lessonId,
        userId,
        userName: user.name || user.email || "User",
        rating,
        comment: comment || null,
        photoDataUrl: photoDataUrl || null,
      },
    });

    // Transformacija za frontend
    const transformedReview = {
      id: review.id,
      courseId: review.courseId,
      lessonId: review.lessonId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment || undefined,
      photoDataUrl: review.photoDataUrl || undefined,
      createdAt: review.createdAt.toISOString(),
      instructorResponse: review.instructorResponse || undefined,
      responseAt: review.responseAt?.toISOString(),
      responseAuthorId: review.responseAuthorId || undefined,
      responseAuthorName: review.responseAuthorName || undefined,
    };

    return NextResponse.json(transformedReview, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson review:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    // Prisma unique constraint error
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { message: "Već ste dali recenziju za ovu lekciju" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Greška pri kreiranju recenzije" },
      { status: 500 }
    );
  }
}
