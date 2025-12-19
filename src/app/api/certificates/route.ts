import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";
import { generateCertificatePDF } from "@/app/lib/pdf-generator";

// F-016: GET certifikati korisnika
export async function GET(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");

        const where: {
            userId: string;
            courseId?: string;
        } = { userId };
        if (courseId) where.courseId = courseId;

        const certificates = await prisma.certificate.findMany({
            where,
            orderBy: { issuedAt: "desc" },
        });

        return NextResponse.json(certificates);
    } catch (error) {
        console.error("Error fetching certificates:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju certifikata" },
            { status: 500 }
        );
    }
}

// F-016: POST generiranje certifikata (za sada samo kreiranje zapisa, PDF generiranje kasnije)
export async function POST(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const body = await request.json();

        const { courseId } = body;

        if (!courseId) {
            return NextResponse.json(
                { message: "courseId je obavezan" },
                { status: 400 }
            );
        }

        // Provjeri je li tečaj dovršen
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lessons: true,
            },
        });

        if (!course) {
            return NextResponse.json(
                { message: "Tečaj nije pronađen" },
                { status: 404 }
            );
        }

        // Provjeri je li korisnik dovršio sve lekcije
        const allLessonsProgress = await Promise.all(
            course.lessons.map(async (lesson) => {
                const progress = await prisma.progress.findUnique({
                    where: {
                        userId_courseId_lessonId: {
                            userId,
                            courseId,
                            lessonId: lesson.id,
                        },
                    },
                });
                return progress?.isCompleted ?? false;
            })
        );

        const allCompleted = allLessonsProgress.every((completed) => completed);

        if (!allCompleted) {
            return NextResponse.json(
                { message: "Morate dovršiti sve lekcije prije dobivanja certifikata" },
                { status: 400 }
            );
        }

        // Provjeri je li certifikat već izdan
        const existingCertificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (existingCertificate) {
            return NextResponse.json(existingCertificate);
        }

        // Kreiraj certifikat prvo (da dobijemo ID)
        const certificate = await prisma.certificate.create({
            data: {
                userId,
                courseId,
                courseTitle: course.title,
            },
        });

        // Generiraj PDF certifikat
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true },
            });

            const userName = user?.name || "Korisnik";
            const pdfBuffer = await generateCertificatePDF({
                userName,
                courseTitle: course.title,
                issuedAt: certificate.issuedAt,
                certificateId: certificate.id,
            });

            // Spremi PDF u bazu (kao base64 string za sada)
            // U produkciji bi trebalo spremiti u S3 ili sličan storage
            const pdfBase64 = pdfBuffer.toString("base64");
            const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;

            // Ažuriraj certifikat s PDF URL-om
            const updatedCertificate = await prisma.certificate.update({
                where: { id: certificate.id },
                data: { pdfUrl },
            });

            return NextResponse.json(updatedCertificate, { status: 201 });
        } catch (pdfError) {
            console.error("Error generating PDF:", pdfError);
            // Vrati certifikat bez PDF-a ako generiranje ne uspije
            return NextResponse.json(certificate, { status: 201 });
        }
    } catch (error) {
        console.error("Error creating certificate:", error);
        return NextResponse.json(
            { message: "Greška pri kreiranju certifikata" },
            { status: 500 }
        );
    }
}
