import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// F-008: GET pojedinačni modul
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();
        const { id } = await params;

        const moduleData = await prisma.module.findUnique({
            where: { id },
            include: {
                course: true,
                lessons: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!moduleData) {
            return NextResponse.json(
                { message: "Modul nije pronađen" },
                { status: 404 }
            );
        }

        return NextResponse.json(moduleData);
    } catch (error) {
        console.error("Error fetching module:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju modula" },
            { status: 500 }
        );
    }
}

// F-008: PUT ažuriranje modula
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId, userRole } = await requireAuth();
        requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);
        const { id } = await params;

        const body = await request.json();
        const { title, description, order } = body;

        // Provjeri da li je korisnik vlasnik tečaja ili admin
        const moduleData = await prisma.module.findUnique({
            where: { id },
            include: { course: true },
        });

        if (!moduleData) {
            return NextResponse.json(
                { message: "Modul nije pronađen" },
                { status: 404 }
            );
        }

        if (moduleData.course.instructorId !== userId && userRole !== Role.ADMINISTRATOR) {
            return NextResponse.json(
                { message: "Nemate dozvolu za uređivanje ovog modula" },
                { status: 403 }
            );
        }

        const updateData: {
            title?: string;
            description?: string | null;
            order?: number;
        } = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (order !== undefined) updateData.order = order;

        const updatedModule = await prisma.module.update({
            where: { id },
            data: updateData,
            include: {
                lessons: true,
            },
        });

        return NextResponse.json(updatedModule);
    } catch (error) {
        console.error("Error updating module:", error);
        return NextResponse.json(
            { message: "Greška pri ažuriranju modula" },
            { status: 500 }
        );
    }
}

// F-008: DELETE brisanje modula
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId, userRole } = await requireAuth();
        requireRole(userRole, [Role.INSTRUCTOR, Role.ADMINISTRATOR]);
        const { id } = await params;

        // Provjeri da li je korisnik vlasnik tečaja ili admin
        const moduleData = await prisma.module.findUnique({
            where: { id },
            include: { course: true },
        });

        if (!moduleData) {
            return NextResponse.json(
                { message: "Modul nije pronađen" },
                { status: 404 }
            );
        }

        if (moduleData.course.instructorId !== userId && userRole !== Role.ADMINISTRATOR) {
            return NextResponse.json(
                { message: "Nemate dozvolu za brisanje ovog modula" },
                { status: 403 }
            );
        }

        await prisma.module.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Modul uspješno obrisan" });
    } catch (error) {
        console.error("Error deleting module:", error);
        return NextResponse.json(
            { message: "Greška pri brisanju modula" },
            { status: 500 }
        );
    }
}
