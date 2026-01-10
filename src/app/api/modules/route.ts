import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// F-008: GET svi moduli za tečaj
export async function GET(request: NextRequest) {
    try {
        await requireAuth();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json(
                { message: "courseId je obavezan" },
                { status: 400 }
            );
        }

        const modules = await prisma.module.findMany({
            where: { courseId },
            include: {
                lessons: {
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { order: "asc" },
        });

        return NextResponse.json(modules);
    } catch (error) {
        console.error("Error fetching modules:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju modula" },
            { status: 500 }
        );
    }
}

// F-008: POST kreiranje modula
export async function POST(request: NextRequest) {
    try {
        const { userId, userRole } = await requireAuth();
        requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);

        const body = await request.json();
        const { courseId, title, description, order } = body;

        if (!courseId || !title) {
            return NextResponse.json(
                { message: "courseId i title su obavezni" },
                { status: 400 }
            );
        }

        // Provjeri da li je korisnik vlasnik tečaja ili admin
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return NextResponse.json(
                { message: "Tečaj nije pronađen" },
                { status: 404 }
            );
        }

        if (course.instructorId !== userId && userRole !== Role.ADMINISTRATOR) {
            return NextResponse.json(
                { message: "Nemate dozvolu za kreiranje modula u ovom tečaju" },
                { status: 403 }
            );
        }

        const newModule = await prisma.module.create({
            data: {
                courseId,
                title,
                description,
                order: order ?? 0,
            },
            include: {
                lessons: true,
            },
        });

        return NextResponse.json(newModule, { status: 201 });
    } catch (error) {
        console.error("Error creating module:", error);
        return NextResponse.json(
            { message: "Greška pri kreiranju modula" },
            { status: 500 }
        );
    }
}
