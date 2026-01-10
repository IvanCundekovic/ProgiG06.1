import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// F-016: GET napredak korisnika
export async function GET(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const lessonId = searchParams.get("lessonId");

        const where: {
            userId: string;
            courseId?: string;
            lessonId?: string;
        } = { userId };
        if (courseId) where.courseId = courseId;
        if (lessonId) where.lessonId = lessonId;

        const progress = await prisma.progress.findMany({
            where,
            orderBy: { lastAccessedAt: "desc" },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Error fetching progress:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju napretka" },
            { status: 500 }
        );
    }
}

// F-016: POST ažuriranje napretka
export async function POST(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const body = await request.json();

        const {
            courseId,
            lessonId,
            moduleId,
            completionPercentage,
            isCompleted,
        } = body;

        if (!courseId) {
            return NextResponse.json(
                { message: "courseId je obavezan" },
                { status: 400 }
            );
        }

        const progressData: {
            userId: string;
            courseId: string;
            lessonId?: string | null;
            moduleId?: string | null;
            completionPercentage: number;
            isCompleted: boolean;
            lastAccessedAt: Date;
            completedAt?: Date;
        } = {
            userId,
            courseId,
            completionPercentage: completionPercentage ?? 0,
            isCompleted: isCompleted ?? false,
            lastAccessedAt: new Date(),
        };

        if (lessonId) progressData.lessonId = lessonId;
        if (moduleId) progressData.moduleId = moduleId;
        if (isCompleted) {
            progressData.completedAt = new Date();
        }

        const progress = await prisma.progress.upsert({
            where: {
                userId_courseId_lessonId: {
                    userId,
                    courseId,
                    lessonId: lessonId ?? null,
                },
            },
            update: progressData,
            create: {
                ...progressData,
                startedAt: new Date(),
            },
        });

        // Generiranje certifikata se poziva kroz /api/certificates endpoint
        // kada korisnik završi sve lekcije u tečaju
        // Provjera se radi u /api/certificates POST endpoint-u

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Error updating progress:", error);
        return NextResponse.json(
            { message: "Greška pri ažuriranju napretka" },
            { status: 500 }
        );
    }
}
