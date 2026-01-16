import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/prisma";
import {sendWorkshopReminder} from "@/app/lib/email-service";

// F-017: Slanje podsjetnika za live radionice - pozvano iz CRON joba
export async function GET(request: NextRequest) {
    try {
        // 1. Provjera Vercel autorizacije (koristeći CRON_SECRET iz Vercel postavki)
        const authHeader = request.headers.get("authorization");
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

        // Ako CRON_SECRET nije postavljen u .env, dozvolit će pristup (za lokalni dev),
        // ali na produkciji (Vercel) će raditi striktnu provjeru.
        if (process.env.NODE_ENV === "production" || process.env.CRON_SECRET) {
            if (authHeader !== expectedAuth) {
                return NextResponse.json(
                    { message: "Neautoriziran pristup - Neispravan Cron Secret" },
                    { status: 401 }
                );
            }
        }

        // 2. Pronađi sve radionice koje počinju u sljedećih 24 sata
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

        // 3. Pošalji podsjetnik svakom registriranom korisniku
        const results = await Promise.allSettled(
            upcomingWorkshops.flatMap((workshop) =>
                workshop.registrations.map(async (registration) => {
                    const user = registration.user;
                    // Provjera postojanja emaila i URL-a sastanka
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

        // Vraćamo detaljan report
        return NextResponse.json({
            message: `Obrada završena. Podsjetnici poslani za ${upcomingWorkshops.length} radionica.`,
            workshopsFound: upcomingWorkshops.length,
            successfulEmails: successful,
            failedEmails: failed,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error sending workshop reminders:", error);
        return NextResponse.json(
            { message: "Greška pri slanju podsjetnika", error: String(error) },
            { status: 500 }
        );
    }
}