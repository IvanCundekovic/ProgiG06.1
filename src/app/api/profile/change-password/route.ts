import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";
import { hashPassword, verifyPassword } from "@/app/lib/auth-utils";

// F-006: Promjena lozinke
export async function POST(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: "Trenutna i nova lozinka su obavezne" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: "Nova lozinka mora imati najmanje 6 znakova" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json(
                { message: "Korisnik nije pronađen" },
                { status: 404 }
            );
        }

        // Provjeri trenutnu lozinku
        const isValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { message: "Trenutna lozinka nije ispravna" },
                { status: 401 }
            );
        }

        // Hashiraj novu lozinku
        const newPasswordHash = await hashPassword(newPassword);

        // Ažuriraj lozinku i ukloni mustChangePassword flag
        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
                mustChangePassword: false,
            },
        });

        return NextResponse.json({ message: "Lozinka uspješno promijenjena" });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { message: "Greška pri promjeni lozinke" },
            { status: 500 }
        );
    }
}
