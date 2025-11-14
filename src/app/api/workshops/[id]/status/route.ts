import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, prismaToFrontendWorkshopStatus, frontendToPrismaWorkshopStatus } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// PUT /api/workshops/:id/status - Ažuriraj status radionice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userRole } = await requireAuth();

    const body = await request.json();
    const { status, connectionStatus } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status je obavezan" },
        { status: 400 }
      );
    }

    // Provjeri da li radionica postoji
    const existingWorkshop = await prisma.liveWorkshop.findUnique({
      where: { id },
    });

    if (!existingWorkshop) {
      return NextResponse.json(
        { message: "Radionica nije pronađena" },
        { status: 404 }
      );
    }

    // Provjeri da li je korisnik vlasnik ili admin
    if (
      existingWorkshop.instructorId !== userId &&
      userRole !== Role.ADMINISTRATOR
    ) {
      return NextResponse.json(
        { message: "Nemate dozvolu za ažuriranje statusa ove radionice" },
        { status: 403 }
      );
    }

    const workshop = await prisma.liveWorkshop.update({
      where: { id },
      data: {
        status: frontendToPrismaWorkshopStatus(status),
        ...(connectionStatus && { lastConnectionStatus: connectionStatus }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Transformacija za frontend
    const transformedWorkshop = {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description || "",
      instructorId: workshop.instructorId,
      instructorName: workshop.instructor.name || workshop.instructor.email,
      scheduledAt: workshop.startTime.toISOString(),
      durationMinutes: workshop.duration,
      capacity: workshop.maxParticipants,
      meetingUrl: workshop.meetingUrl || "",
      requirements: workshop.requirements
        ? JSON.parse(workshop.requirements)
        : [],
      status: prismaToFrontendWorkshopStatus(workshop.status),
      calendarSyncedAt: workshop.calendarSyncedAt?.toISOString(),
      createdAt: workshop.createdAt.toISOString(),
      updatedAt: workshop.updatedAt.toISOString(),
      lastConnectionStatus: workshop.lastConnectionStatus || undefined,
    };

    return NextResponse.json(transformedWorkshop);
  } catch (error) {
    console.error("Error updating workshop status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri ažuriranju statusa radionice" },
      { status: 500 }
    );
  }
}

