import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// NF-006: GDPR - Right to be forgotten (brisanje korisničkih podataka)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await requireAuth();
        const { id } = await params;

        // Korisnik može obrisati samo svoj račun
        if (userId !== id) {
            return NextResponse.json(
                { message: "Možete obrisati samo svoj račun" },
                { status: 403 }
            );
        }

        // Obriši sve korisničke podatke (cascade će obrisati sve povezane podatke)
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({
            message: "Vaš račun i svi podaci su uspješno obrisani u skladu s GDPR-om",
        });
    } catch (error) {
        console.error("Error deleting user account:", error);
        return NextResponse.json(
            { message: "Greška pri brisanju računa" },
            { status: 500 }
        );
    }
}
