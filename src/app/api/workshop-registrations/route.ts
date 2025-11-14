import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, prismaToFrontendNotificationType } from "@/app/lib/api-helpers";

// GET /api/workshop-registrations - Dohvati sve registracije
export async function GET(request: NextRequest) {
  try {
    // Pokušaj dobiti userId, ali ne zahtijevaj autentifikaciju
    let userId: string | null = null;
    try {
      const authResult = await requireAuth();
      userId = authResult.userId;
    } catch {
      // Korisnik nije prijavljen - vrati prazan array
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get("workshopId");

    const where: Record<string, unknown> = {};
    if (workshopId) {
      where.workshopId = workshopId;
    } else if (userId) {
      // Ako nije naveden workshopId, vrati samo registracije korisnika
      where.userId = userId;
    } else {
      // Ako nema userId, vrati prazan array
      return NextResponse.json([]);
    }

    const registrations = await prisma.workshopRegistration.findMany({
      where,
      include: {
        workshop: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
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
        notifications: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    // Transformacija za frontend
    const transformedRegistrations = registrations.map((registration) => ({
      id: registration.id,
      workshopId: registration.workshopId,
      userId: registration.userId,
      userName: registration.userName,
      registeredAt: registration.registeredAt.toISOString(),
      notifications: registration.notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        type: prismaToFrontendNotificationType(notification.type),
        createdAt: notification.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json(transformedRegistrations);
  } catch (error) {
    console.error("Error fetching workshop registrations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri dohvaćanju registracija" },
      { status: 500 }
    );
  }
}

// POST /api/workshop-registrations - Prijavi se na radionicu
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const { workshopId } = body;

    if (!workshopId) {
      return NextResponse.json(
        { message: "ID radionice je obavezan" },
        { status: 400 }
      );
    }

    // Provjeri da li radionica postoji
    const workshop = await prisma.liveWorkshop.findUnique({
      where: { id: workshopId },
      include: {
        registrations: true,
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { message: "Radionica nije pronađena" },
        { status: 404 }
      );
    }

    // Provjeri da li je korisnik već prijavljen
    const existingRegistration = await prisma.workshopRegistration.findUnique({
      where: {
        workshopId_userId: {
          workshopId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { message: "Već ste prijavljeni na ovu radionicu" },
        { status: 400 }
      );
    }

    // Provjeri kapacitet
    if (workshop.registrations.length >= workshop.maxParticipants) {
      return NextResponse.json(
        { message: "Radionica je dostigla maksimalan broj polaznika" },
        { status: 400 }
      );
    }

    // Dohvati korisnika
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Korisnik nije pronađen" },
        { status: 404 }
      );
    }

    // Kreiraj registraciju s notifikacijom
    const registration = await prisma.workshopRegistration.create({
      data: {
        workshopId,
        userId,
        userName: user.name || user.email || "User",
        notifications: {
          create: {
            message: `Uspješno ste prijavljeni na radionicu "${workshop.title}".`,
            type: "GENERAL",
          },
        },
      },
      include: {
        notifications: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Ažuriraj broj trenutnih polaznika
    await prisma.liveWorkshop.update({
      where: { id: workshopId },
      data: {
        currentParticipants: {
          increment: 1,
        },
      },
    });

    // Transformacija za frontend
    const transformedRegistration = {
      id: registration.id,
      workshopId: registration.workshopId,
      userId: registration.userId,
      userName: registration.userName,
      registeredAt: registration.registeredAt.toISOString(),
      notifications: registration.notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        type: prismaToFrontendNotificationType(notification.type),
        createdAt: notification.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(transformedRegistration, { status: 201 });
  } catch (error) {
    console.error("Error registering for workshop:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    // Prisma unique constraint error
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { message: "Već ste prijavljeni na ovu radionicu" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Greška pri prijavi na radionicu" },
      { status: 500 }
    );
  }
}
