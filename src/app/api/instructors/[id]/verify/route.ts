import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth, requireRole } from "@/app/lib/api-helpers";
import { Role } from "@prisma/client";

// F-007: POST verifikacija instruktora (admin)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId, userRole } = await requireAuth();
        requireRole(userRole, [Role.ADMINISTRATOR]);
        const { id } = await params;

        const body = await request.json();
        const { isVerified, verificationDocuments } = body;

        const instructor = await prisma.user.findUnique({
            where: { id },
        });

        if (!instructor) {
            return NextResponse.json(
                { message: "Instruktor nije pronađen" },
                { status: 404 }
            );
        }

        if (instructor.role !== Role.INSTRUCTOR) {
            return NextResponse.json(
                { message: "Korisnik nije instruktor" },
                { status: 400 }
            );
        }

        const updateData: {
            isVerified: boolean;
            verifiedBy: string;
            verifiedAt: Date | null;
            verificationDocuments?: string | null;
        } = {
            isVerified: isVerified ?? true,
            verifiedBy: userId,
            verifiedAt: null,
        };

        if (isVerified) {
            updateData.verifiedAt = new Date();
        } else {
            updateData.verifiedAt = null;
        }

        if (verificationDocuments !== undefined) {
            updateData.verificationDocuments = JSON.stringify(verificationDocuments);
        }

        const updatedInstructor = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            message: isVerified ? "Instruktor uspješno verificiran" : "Verifikacija uklonjena",
            instructor: updatedInstructor,
        });
    } catch (error) {
        console.error("Error verifying instructor:", error);
        return NextResponse.json(
            { message: "Greška pri verifikaciji instruktora" },
            { status: 500 }
        );
    }
}

// F-007: POST upload verifikacijskih dokumenata (instruktor)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await requireAuth();
        const { id } = await params;

        // Provjeri da li korisnik ažurira svoj profil
        if (userId !== id) {
            return NextResponse.json(
                { message: "Možete ažurirati samo svoj profil" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { verificationDocuments } = body;

        if (!verificationDocuments || !Array.isArray(verificationDocuments)) {
            return NextResponse.json(
                { message: "verificationDocuments mora biti array" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user || user.role !== Role.INSTRUCTOR) {
            return NextResponse.json(
                { message: "Korisnik nije instruktor" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                verificationDocuments: JSON.stringify(verificationDocuments),
                isVerified: false, // Resetiraj verifikaciju kada se dokumenti ažuriraju
                verifiedAt: null,
                verifiedBy: null,
            },
        });

        return NextResponse.json({
            message: "Dokumenti uspješno ažurirani",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating verification documents:", error);
        return NextResponse.json(
            { message: "Greška pri ažuriranju dokumenata" },
            { status: 500 }
        );
    }
}
