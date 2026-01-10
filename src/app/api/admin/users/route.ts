import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// F-013: GET svi korisnici (admin)
export async function GET(request: NextRequest) {
    try {
        const { userRole } = await requireAuth();
        requireRole(userRole, [Role.ADMINISTRATOR]);

        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");
        const search = searchParams.get("search");

        const where: {
            role?: Role;
            OR?: Array<{
                email?: { contains: string; mode: "insensitive" };
                name?: { contains: string; mode: "insensitive" };
            }>;
        } = {};

        if (role) {
            where.role = role as Role;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                userProfile: true,
                instructorProfile: true,
                _count: {
                    select: {
                        courses: true,
                        quizResults: true,
                        lessonReviews: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 100, // Limit za performanse
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju korisnika" },
            { status: 500 }
        );
    }
}

// F-013: PUT ažuriranje korisnika (admin)
export async function PUT(request: NextRequest) {
    try {
        const { userRole } = await requireAuth();
        requireRole(userRole, [Role.ADMINISTRATOR]);

        const body = await request.json();
        const { userId, role, isVerified } = body;

        if (!userId) {
            return NextResponse.json(
                { message: "userId je obavezan" },
                { status: 400 }
            );
        }

        const updateData: {
            role?: Role;
            isVerified?: boolean;
            verifiedAt?: Date | null;
        } = {};

        if (role !== undefined) {
            updateData.role = role as Role;
        }

        if (isVerified !== undefined) {
            updateData.isVerified = isVerified;
            updateData.verifiedAt = isVerified ? new Date() : null;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                userProfile: true,
                instructorProfile: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { message: "Greška pri ažuriranju korisnika" },
            { status: 500 }
        );
    }
}

// F-013: DELETE brisanje korisnika (admin)
export async function DELETE(request: NextRequest) {
    try {
        const { userRole } = await requireAuth();
        requireRole(userRole, [Role.ADMINISTRATOR]);

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { message: "userId je obavezan" },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: "Korisnik uspješno obrisan" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { message: "Greška pri brisanju korisnika" },
            { status: 500 }
        );
    }
}
