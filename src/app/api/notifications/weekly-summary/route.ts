import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { sendWeeklyProgressSummary } from "@/app/lib/email-service";

// F-017: POST slanje tjednih sažetaka napretka (može se pozvati iz cron joba)
export async function POST(request: NextRequest) {
    try {
        // Provjeri API key za sigurnost (opcionalno)
        const apiKey = request.headers.get("x-api-key");
        const expectedKey = process.env.CRON_API_KEY;

        if (expectedKey && apiKey !== expectedKey) {
            return NextResponse.json(
                { message: "Neautoriziran pristup" },
                { status: 401 }
            );
        }

        // Pronađi sve aktivne korisnike (koji su imali aktivnost u zadnjih 30 dana)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { progress: { some: { lastAccessedAt: { gte: thirtyDaysAgo } } } },
                    { quizResults: { some: { createdAt: { gte: thirtyDaysAgo } } } },
                ],
            },
            include: {
                progress: {
                    where: {
                        lastAccessedAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Zadnjih 7 dana
                        },
                    },
                },
                quizResults: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Zadnjih 7 dana
                        },
                    },
                },
            },
        });

        // Pošalji sažetak svakom korisniku
        const results = await Promise.allSettled(
            activeUsers.map(async (user) => {
                if (!user.email) return;

                // Izračunaj statistiku za zadnjih 7 dana
                const lessonsCompleted = user.progress.filter((p) => p.isCompleted).length;
                const quizzesCompleted = user.quizResults.length;
                const coursesInProgress = new Set(user.progress.map((p) => p.courseId)).size;

                // Procijeni ukupno vrijeme (pretpostavka: 15 min po lekciji)
                const totalTimeSpent = lessonsCompleted * 15;

                await sendWeeklyProgressSummary(
                    user.email,
                    user.name || user.email.split("@")[0],
                    {
                        lessonsCompleted,
                        quizzesCompleted,
                        coursesInProgress,
                        totalTimeSpent,
                    }
                );
            })
        );

        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({
            message: `Tjedni sažetci poslani ${successful} korisnicima`,
            successful,
            failed,
        });
    } catch (error) {
        console.error("Error sending weekly summaries:", error);
        return NextResponse.json(
            { message: "Greška pri slanju tjednih sažetaka" },
            { status: 500 }
        );
    }
}

