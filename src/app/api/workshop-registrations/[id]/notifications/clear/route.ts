import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// PUT /api/workshop-registrations/:id/notifications/clear - Obriši sve notifikacije za registraciju
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await requireAuth();

    // Provjeri da li registracija postoji
    const registration = await prisma.workshopRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json(
        { message: "Registracija nije pronađena" },
        { status: 404 }
      );
    }

    // Provjeri da li je korisnik vlasnik registracije
    if (registration.userId !== userId) {
      return NextResponse.json(
        { message: "Nemate dozvolu za brisanje notifikacija" },
        { status: 403 }
      );
    }

    // Obriši sve notifikacije
    await prisma.workshopNotification.deleteMany({
      where: {
        registrationId: id,
      },
    });

    return NextResponse.json({ message: "Notifikacije su obrisane" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri brisanju notifikacija" },
      { status: 500 }
    );
  }
}

