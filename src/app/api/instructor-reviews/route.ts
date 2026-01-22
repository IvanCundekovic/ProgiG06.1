import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// F-011: GET recenzije instruktora
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        // NOTE: instructorId param je userId instruktora (ne instructorProfile.id)
        const instructorUserId = searchParams.get("instructorId");
        const userId = searchParams.get("userId");

        const where: {
            instructorId?: string;
            userId?: string;
        } = {};

        if (instructorUserId) {
            const profile = await prisma.instructorProfile.findUnique({
                where: { userId: instructorUserId },
                select: { id: true },
            });
            if (profile) where.instructorId = profile.id;
        }
        if (userId) where.userId = userId;

        const reviews = await prisma.instructorReview.findMany({
            where,
            include: {
                instructor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching instructor reviews:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju recenzija instruktora" },
            { status: 500 }
        );
    }
}

// F-011: POST kreiranje recenzije instruktora
export async function POST(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const body = await request.json();

        const { instructorId, rating, comment } = body;

        if (!instructorId || !rating) {
            return NextResponse.json(
                { message: "instructorId i rating su obavezni" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { message: "Ocjena mora biti između 1 i 5" },
                { status: 400 }
            );
        }

        // Provjeri da li instruktor postoji (instructorId = userId instruktora)
        const instructorUser = await prisma.user.findUnique({
            where: { id: instructorId },
            select: { id: true, name: true, role: true },
        });

        if (!instructorUser || instructorUser.role !== "INSTRUCTOR") {
            return NextResponse.json(
                { message: "Instruktor nije pronađen" },
                { status: 404 }
            );
        }

        // Osiguraj da postoji InstructorProfile (fallback za starije podatke)
        const instructorProfile = await prisma.instructorProfile.upsert({
            where: { userId: instructorId },
            update: {},
            create: {
                userId: instructorId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Provjeri da li korisnik već ocjenio ovog instruktora
        const existingReview = await prisma.instructorReview.findUnique({
            where: {
                instructorId_userId: {
                    instructorId: instructorProfile.id,
                    userId,
                },
            },
        });

        if (existingReview) {
            return NextResponse.json(
                { message: "Već ste ocjenili ovog instruktora" },
                { status: 409 }
            );
        }

        // Kreiraj recenziju
        const review = await prisma.instructorReview.create({
            data: {
                instructorId: instructorProfile.id,
                userId,
                userName: (await prisma.user.findUnique({ where: { id: userId } }))?.name || "Anonimni korisnik",
                rating,
                comment: comment || null,
            },
        });

        // Ažuriraj prosječnu ocjenu i broj recenzija
        const allReviews = await prisma.instructorReview.findMany({
            where: { instructorId: instructorProfile.id },
        });

        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        const totalReviews = allReviews.length;

        await prisma.instructorProfile.update({
            where: { id: instructorProfile.id },
            data: {
                averageRating,
                totalReviews,
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Error creating instructor review:", error);
        return NextResponse.json(
            { message: "Greška pri kreiranju recenzije" },
            { status: 500 }
        );
    }
}
