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
        // const reported = searchParams.get("reported") === "true"; // Za buduću implementaciju filtriranja prijavljenih recenzija
        const lessonId = searchParams.get("lessonId");

        const where: {
            lessonId?: string;
        } = {};

        if (lessonId) {
            where.lessonId = lessonId;
        }

        const reviews = await prisma.lessonReview.findMany({
            where,
            include: {
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
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
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

// F-013: DELETE brisanje recenzije (admin)
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
