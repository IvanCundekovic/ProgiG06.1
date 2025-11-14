import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/prisma";
import {requireAuth} from "@/app/lib/api-helpers";

// DELETE /api/workshop-notifications/[registrationId] - Obriši sve notifikacije za registraciju
export async function DELETE(
    request: NextRequest,
    {params}: {params: Promise<{registrationId: string}>}
) {
    try {
        const { registrationId } = await params;
        const {userId} = await requireAuth();

        // Provjeri da li registracija postoji i da li pripada korisniku
        const registration = await prisma.workshopRegistration.findUnique({
            where: {id: registrationId}
        });

        if (!registration) {
            return NextResponse.json(
                {message: "Registracija nije pronađena."},
                {status: 404}
            );
        }

        if (registration.userId !== userId) {
            return NextResponse.json(
                {message: "Nemate dozvolu za brisanje notifikacija ove registracije."},
                {status: 403}
            );
        }

        // Obriši sve notifikacije za registraciju
        await prisma.workshopNotification.deleteMany({
            where: {registrationId}
        });

        return NextResponse.json({message: "Notifikacije su uspješno obrisane."});
    } catch (error) {
        console.error("Error deleting workshop notifications:", error);
        return NextResponse.json(
            {message: "Greška pri brisanju notifikacija."},
            {status: 500}
        );
    }
}

