import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, prismaToFrontendWorkshopStatus } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// GET /api/workshops/:id - Dohvati radionicu po ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workshop = await prisma.liveWorkshop.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        registrations: {
          include: {
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
        },
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { message: "Radionica nije pronađena" },
        { status: 404 }
      );
    }

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
    console.error("Error fetching workshop:", error);
    return NextResponse.json(
      { message: "Greška pri dohvaćanju radionice" },
      { status: 500 }
    );
  }
}

// PUT /api/workshops/:id - Ažuriraj radionicu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userRole } = await requireAuth();

    const body = await request.json();
    const {
      title,
      description,
      scheduledAt,
      durationMinutes,
      capacity,
      meetingUrl,
      requirements,
    } = body;

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
        { message: "Nemate dozvolu za ažuriranje ove radionice" },
        { status: 403 }
      );
    }

    // Pripremi podatke za ažuriranje
    const updateData: {
      title?: string;
      description?: string | null;
      startTime?: Date;
      endTime?: Date;
      duration?: number;
      maxParticipants?: number;
      meetingUrl?: string | null;
      requirements?: string | null;
    } = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    
    let startTime: Date | undefined;
    if (scheduledAt) {
      startTime = new Date(scheduledAt);
      updateData.startTime = startTime;
      if (durationMinutes) {
        updateData.endTime = new Date(
          startTime.getTime() + durationMinutes * 60000
        );
      } else {
        updateData.endTime = new Date(
          startTime.getTime() + existingWorkshop.duration * 60000
        );
      }
    }
    
    if (durationMinutes) {
      updateData.duration = durationMinutes;
      if (startTime) {
        updateData.endTime = new Date(
          startTime.getTime() + durationMinutes * 60000
        );
      } else if (existingWorkshop.startTime) {
        updateData.endTime = new Date(
          existingWorkshop.startTime.getTime() + durationMinutes * 60000
        );
      }
    }
    
    if (capacity) updateData.maxParticipants = capacity;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl || null;
    if (requirements !== undefined) {
      updateData.requirements = requirements
        ? JSON.stringify(requirements)
        : null;
    }

    const workshop = await prisma.liveWorkshop.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating workshop:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Greška pri ažuriranju radionice" },
      { status: 500 }
    );
  }
}

