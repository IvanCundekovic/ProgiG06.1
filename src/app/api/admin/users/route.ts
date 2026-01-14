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
        const pendingVerification = searchParams.get("pendingVerification") === "true";

        let where: any = {};

        // Filter za pending verifikacije (ima prioritet)
        if (pendingVerification) {
            where = {
                role: Role.INSTRUCTOR,
                isVerified: false,
                verificationDocuments: { not: null },
            };
        } else {
            // Standardni filteri
            if (role) {
                where.role = role as Role;
            }

            if (search) {
                where.OR = [
                    { email: { contains: search, mode: "insensitive" } },
                    { name: { contains: search, mode: "insensitive" } },
                ];
            }
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true,
                verificationDocuments: true,
                verifiedAt: true,
                _count: {
                    select: {
                        courses: true,
                        quizResults: true,
                        lessonReviews: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
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

// F-013 & UC-006: PUT ažuriranje korisnika i verifikacija (admin)
export async function PUT(request: NextRequest) {
    try {
        const { userId: adminId, userRole } = await requireAuth();
        requireRole(userRole, [Role.ADMINISTRATOR]);

        const body = await request.json();
        const { userId, role, isVerified } = body;

        if (!userId) {
            return NextResponse.json(
                { message: "userId je obavezan" },
                { status: 400 }
            );
        }

        // Provjeri da li korisnik postoji
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return NextResponse.json(
                { message: "Korisnik nije pronađen" },
                { status: 404 }
            );
        }

        const updateData: {
            role?: Role;
            isVerified?: boolean;
            verifiedAt?: Date | null;
            verifiedBy?: string | null;
        } = {};

        if (role !== undefined) {
            updateData.role = role as Role;
        }

        // UC-006: Verifikacija instruktora
        if (isVerified !== undefined) {
            updateData.isVerified = isVerified;
            if (isVerified) {
                updateData.verifiedAt = new Date();
                updateData.verifiedBy = adminId;
            } else {
                updateData.verifiedAt = null;
                updateData.verifiedBy = null;
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                verifiedAt: true,
                verifiedBy: true,
            },
        });

        // Ako je korisnik promijenjen u instruktora, kreiraj InstructorProfile ako ne postoji
        if (role === Role.INSTRUCTOR) {
            const instructorProfile = await prisma.instructorProfile.findUnique({
                where: { userId },
            });

            if (!instructorProfile) {
                await prisma.instructorProfile.create({
                    data: {
                        userId,
                    },
                });
            }
        }

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
        const { userId: adminId, userRole } = await requireAuth();
        requireRole(userRole, [Role.ADMINISTRATOR]);

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { message: "userId je obavezan" },
                { status: 400 }
            );
        }

        // Provjeri da li admin pokušava obrisati samog sebe
        if (adminId === userId) {
            return NextResponse.json(
                { message: "Ne možete obrisati svoj administratorski račun" },
                { status: 403 }
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