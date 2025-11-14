import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole, frontendToPrismaWorkshopStatus, prismaToFrontendWorkshopStatus } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// GET /api/workshops - Dohvati sve radionice
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const instructorId = searchParams.get("instructorId");

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = frontendToPrismaWorkshopStatus(status as "upcoming" | "in_progress" | "completed" | "cancelled");
    }
    if (instructorId) {
      where.instructorId = instructorId;
    }

    const workshops = await prisma.liveWorkshop.findMany({
      where,
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
            notifications: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Transformacija za frontend
    const transformedWorkshops = workshops.map((workshop) => ({
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
        ? (() => {
            try {
              return JSON.parse(workshop.requirements);
            } catch {
              console.error(`Error parsing workshop ${workshop.id} requirements`);
              return [];
            }
          })()
        : [],
      status: prismaToFrontendWorkshopStatus(workshop.status),
      calendarSyncedAt: workshop.calendarSyncedAt?.toISOString(),
      createdAt: workshop.createdAt.toISOString(),
      updatedAt: workshop.updatedAt.toISOString(),
      lastConnectionStatus: workshop.lastConnectionStatus || undefined,
    }));

    return NextResponse.json(transformedWorkshops);
  } catch (error) {
    console.error("Error fetching workshops:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      { 
        message: "Greška pri dohvaćanju radionica",
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/workshops - Kreiraj novu radionicu
export async function POST(request: NextRequest) {
  try {
    const { userId, userRole } = await requireAuth();
    requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);

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

    if (!title || !scheduledAt || !durationMinutes || !capacity) {
      return NextResponse.json(
        { message: "Naziv, termin, trajanje i kapacitet su obavezni" },
        { status: 400 }
      );
    }

    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const workshop = await prisma.liveWorkshop.create({
      data: {
        title,
        description: description || null,
        startTime,
        endTime,
        duration: durationMinutes,
        instructorId: userId,
        maxParticipants: capacity,
        meetingUrl: meetingUrl || null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        status: "UPCOMING",
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
        ? (() => {
            try {
              return JSON.parse(workshop.requirements);
            } catch {
              console.error(`Error parsing workshop ${workshop.id} requirements`);
              return [];
            }
          })()
        : [],
      status: prismaToFrontendWorkshopStatus(workshop.status),
      calendarSyncedAt: workshop.calendarSyncedAt?.toISOString(),
      createdAt: workshop.createdAt.toISOString(),
      updatedAt: workshop.updatedAt.toISOString(),
      lastConnectionStatus: workshop.lastConnectionStatus || undefined,
    };

    return NextResponse.json(transformedWorkshop, { status: 201 });
  } catch (error) {
    console.error("Error creating workshop:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage === "Morate biti prijavljeni") {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    if (errorMessage === "Nemate dozvolu za ovu akciju") {
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Greška pri kreiranju radionice" },
      { status: 500 }
    );
  }
}
