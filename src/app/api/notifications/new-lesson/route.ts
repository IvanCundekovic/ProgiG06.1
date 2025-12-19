import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";
import { sendNewLessonNotification } from "@/app/lib/email-service";

// F-017: POST slanje obavijesti o novoj lekciji
export async function POST(request: NextRequest) {
    try {
        const { userRole } = await requireAuth();
        requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);

        const body = await request.json();
        const { lessonId, courseId } = body;

        if (!lessonId || !courseId) {
            return NextResponse.json(
                { message: "lessonId i courseId su obavezni" },
                { status: 400 }
            );
        }

        // Učitaj lekciju i tečaj
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: {
                    include: {
                        instructor: true,
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

        // Pronađi sve korisnike koji su započeli ovaj tečaj
        const usersWithProgress = await prisma.progress.findMany({
            where: {
                courseId,
                isCompleted: false,
            },
            include: {
                user: true,
            },
            distinct: ["userId"],
        });

        // Pošalji obavijest svakom korisniku
        const results = await Promise.allSettled(
            usersWithProgress.map(async (progress) => {
                const user = progress.user;
                if (!user.email) return;

                const lessonUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/Homepage`;
                await sendNewLessonNotification(
                    user.email,
                    user.name || user.email.split("@")[0],
                    lesson.title,
                    lesson.course.title,
                    lessonUrl
                );
            })
        );

        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({
            message: `Obavijesti poslane ${successful} korisnicima`,
            successful,
            failed,
        });
    } catch (error) {
        console.error("Error sending lesson notifications:", error);
        return NextResponse.json(
            { message: "Greška pri slanju obavijesti" },
            { status: 500 }
        );
    }
}

