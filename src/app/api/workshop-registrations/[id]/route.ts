import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// DELETE /api/workshop-registrations/:id - Odjavi se s radionice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await requireAuth();

    // Provjeri da li registracija postoji
    const registration = await prisma.workshopRegistration.findUnique({
      where: { id },
      include: {
        workshop: true,
      },
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
        { message: "Nemate dozvolu za brisanje ove registracije" },
        { status: 403 }
      );
    }

    // Obriši registraciju
    await prisma.workshopRegistration.delete({
      where: { id },
    });

    // Ažuriraj broj trenutnih polaznika
    await prisma.liveWorkshop.update({
      where: { id: registration.workshopId },
      data: {
        currentParticipants: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ message: "Uspješno ste se odjavili s radionice" });
  } catch (error) {
    console.error("Error deleting workshop registration:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri odjavi s radionice" },
      { status: 500 }
    );
  }
}

