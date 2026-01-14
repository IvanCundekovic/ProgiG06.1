import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// F-013: GET sve recenzije za moderaciju (admin)
export async function GET(request: NextRequest) {
    try {
        const { userRole } = await requireAuth();
        requireRole(userRole, [Role.ADMINISTRATOR]);

        const { searchParams } = new URL(request.url);
        const lessonId = searchParams.get("lessonId");

        let where: any = {};

        if (lessonId) {
            where.lessonId = lessonId;
        }

        const reviews = await prisma.lessonReview.findMany({
            where,
            select: {
                id: true,
                rating: true,
                comment: true,
                userName: true,
                createdAt: true,
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju recenzija" },
            { status: 500 }
        );
    }
}

// F-013: DELETE brisanje recenzije (moderacija spornog sadržaja)
export async function DELETE(request: NextRequest) {
    try {
        const { userRole } = await requireAuth();
        requireRole(userRole, [Role.ADMINISTRATOR]);

        const { searchParams } = new URL(request.url);
        const reviewId = searchParams.get("reviewId");

        if (!reviewId) {
            return NextResponse.json(
                { message: "reviewId je obavezan" },
                { status: 400 }
            );
        }

        // Provjeri da li recenzija postoji
        const existingReview = await prisma.lessonReview.findUnique({
            where: { id: reviewId },
            include: {
                lesson: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!existingReview) {
            return NextResponse.json(
                { message: "Recenzija nije pronađena" },
                { status: 404 }
            );
        }

        // Obriši recenziju
        await prisma.lessonReview.delete({
            where: { id: reviewId },
        });

        return NextResponse.json({ message: "Recenzija uspješno obrisana" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json(
            { message: "Greška pri brisanju recenzije" },
            { status: 500 }
        );
    }
}