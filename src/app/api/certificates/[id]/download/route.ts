import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";
import { generateCertificatePDF } from "@/app/lib/pdf-generator";

// GET endpoint za download certifikata kao PDF
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await requireAuth();
        const { id: certificateId } = await params;

        // Dohvati certifikat
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                course: true,
            },
        });

        if (!certificate) {
            return NextResponse.json(
                { message: "Certifikat nije pronađen" },
                { status: 404 }
            );
        }

        // Provjeri je li korisnik vlasnik certifikata
        if (certificate.userId !== userId) {
            return NextResponse.json(
                { message: "Nemate pristup ovom certifikatu" },
                { status: 403 }
            );
        }

        // Ako postoji pdfUrl u bazi, koristi ga
        if (certificate.pdfUrl) {
            // Dekodiraj base64 iz data URI
            const base64Data = certificate.pdfUrl.replace(/^data:application\/pdf;base64,/, "");
            const pdfBuffer = Buffer.from(base64Data, "base64");

            return new NextResponse(pdfBuffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename="certifikat-${certificate.courseTitle.replace(/[^a-z0-9]/gi, "_")}-${certificate.id}.pdf"`,
                },
            });
        }

        // Ako nema pdfUrl, generiraj PDF na zahtjev
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });

        const userName = user?.name || "Korisnik";
        const pdfBuffer = await generateCertificatePDF({
            userName,
            courseTitle: certificate.courseTitle,
            issuedAt: certificate.issuedAt,
            certificateId: certificate.id,
        });

        // Spremi generirani PDF u bazu za buduće korisnje
        const pdfBase64 = pdfBuffer.toString("base64");
        const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;

        await prisma.certificate.update({
            where: { id: certificate.id },
            data: { pdfUrl },
        });

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="certifikat-${certificate.courseTitle.replace(/[^a-z0-9]/gi, "_")}-${certificate.id}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error downloading certificate:", error);
        return NextResponse.json(
            { message: "Greška pri preuzimanju certifikata" },
            { status: 500 }
        );
    }
}
