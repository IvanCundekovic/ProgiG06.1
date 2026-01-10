import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { sendWorkshopReminder } from "@/app/lib/email-service";

// F-017: POST slanje podsjetnika za live radionice (može se pozvati iz cron joba)
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

        // Pronađi sve radionice koje počinju u sljedećih 24 sata
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const upcomingWorkshops = await prisma.liveWorkshop.findMany({
            where: {
                status: "UPCOMING",
                startTime: {
                    gte: now,
                    lte: tomorrow,
                },
            },
            include: {
                registrations: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        // Pošalji podsjetnik svakom registriranom korisniku
        const results = await Promise.allSettled(
            upcomingWorkshops.flatMap((workshop) =>
                workshop.registrations.map(async (registration) => {
                    const user = registration.user;
                    if (!user.email || !workshop.meetingUrl) return;

                    await sendWorkshopReminder(
                        user.email,
                        user.name || user.email.split("@")[0],
                        workshop.title,
                        workshop.startTime,
                        workshop.meetingUrl
                    );
                })
            )
        );

        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({
            message: `Podsjetnici poslani za ${upcomingWorkshops.length} radionica`,
            workshops: upcomingWorkshops.length,
            successful,
            failed,
        });
    } catch (error) {
        console.error("Error sending workshop reminders:", error);
        return NextResponse.json(
            { message: "Greška pri slanju podsjetnika" },
            { status: 500 }
        );
    }
}

