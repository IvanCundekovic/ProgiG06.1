import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// F-016: GET napredak korisnika
export async function GET(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const lessonId = searchParams.get("lessonId");
        const summary = searchParams.get("summary") === "true";

        // UC-15: Summary napretka po tečaju (postotak riješenih lekcija)
        if (summary) {
            if (courseId) {
                const course = await prisma.course.findUnique({
                    where: { id: courseId },
                    select: {
                        id: true,
                        title: true,
                        lessons: {
                            where: { published: true },
                            select: { id: true },
                        },
                    },
                });

                if (!course) {
                    return NextResponse.json({ message: "Tečaj nije pronađen" }, { status: 404 });
                }

                const lessonIds = course.lessons.map((l) => l.id);
                const totalLessons = lessonIds.length;

                const completedLessons = totalLessons === 0
                    ? 0
                    : await prisma.progress.count({
                        where: {
                            userId,
                            courseId,
                            lessonId: { in: lessonIds },
                            isCompleted: true,
                        },
                    });

                const percentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

                const certificate = await prisma.certificate.findUnique({
                    where: {
                        userId_courseId: {
                            userId,
                            courseId,
                        },
                    },
                });

                return NextResponse.json({
                    courseId: course.id,
                    courseTitle: course.title,
                    totalLessons,
                    completedLessons,
                    percentage,
                    certificate,
                });
            }

            // summary za sve tečajeve
            const courses = await prisma.course.findMany({
                select: {
                    id: true,
                    title: true,
                    lessons: {
                        where: { published: true },
                        select: { id: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            const completedProgress = await prisma.progress.findMany({
                where: {
                    userId,
                    isCompleted: true,
                    lessonId: { not: null },
                },
                select: {
                    courseId: true,
                    lessonId: true,
                },
            });

            const completedByCourse = new Map<string, Set<string>>();
            for (const p of completedProgress) {
                if (!p.lessonId) continue;
                const set = completedByCourse.get(p.courseId) ?? new Set<string>();
                set.add(p.lessonId);
                completedByCourse.set(p.courseId, set);
            }

            const certificates = await prisma.certificate.findMany({
                where: { userId },
                select: { id: true, courseId: true, courseTitle: true, pdfUrl: true, issuedAt: true },
            });
            const certByCourse = new Map<string, (typeof certificates)[number]>();
            certificates.forEach((c) => certByCourse.set(c.courseId, c));

            return NextResponse.json(
                courses.map((c) => {
                    const lessonIds = c.lessons.map((l) => l.id);
                    const totalLessons = lessonIds.length;
                    const completedSet = completedByCourse.get(c.id) ?? new Set<string>();
                    const completedLessons = lessonIds.filter((id) => completedSet.has(id)).length;
                    const percentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
                    return {
                        courseId: c.id,
                        courseTitle: c.title,
                        totalLessons,
                        completedLessons,
                        percentage,
                        certificate: certByCourse.get(c.id) ?? null,
                    };
                })
            );
        }

        const where: {
            userId: string;
            courseId?: string;
            lessonId?: string;
        } = { userId };
        if (courseId) where.courseId = courseId;
        if (lessonId) where.lessonId = lessonId;

        const progress = await prisma.progress.findMany({
            where,
            orderBy: { lastAccessedAt: "desc" },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Error fetching progress:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju napretka" },
            { status: 500 }
        );
    }
}

// F-016: POST ažuriranje napretka
export async function POST(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const body = await request.json();

        const {
            courseId,
            lessonId,
            moduleId,
            completionPercentage,
            isCompleted,
        } = body;

        if (!courseId) {
            return NextResponse.json(
                { message: "courseId je obavezan" },
                { status: 400 }
            );
        }

        const progressData: {
            userId: string;
            courseId: string;
            lessonId?: string | null;
            moduleId?: string | null;
            completionPercentage: number;
            isCompleted: boolean;
            lastAccessedAt: Date;
            completedAt?: Date;
        } = {
            userId,
            courseId,
            completionPercentage: completionPercentage ?? 0,
            isCompleted: isCompleted ?? false,
            lastAccessedAt: new Date(),
        };

        if (lessonId) progressData.lessonId = lessonId;
        if (moduleId) progressData.moduleId = moduleId;
        if (isCompleted) {
            progressData.completedAt = new Date();
        }

        const progress = await prisma.progress.upsert({
            where: {
                userId_courseId_lessonId: {
                    userId,
                    courseId,
                    lessonId: lessonId ?? null,
                },
            },
            update: progressData,
            create: {
                ...progressData,
                startedAt: new Date(),
            },
        });

        // Generiranje certifikata se poziva kroz /api/certificates endpoint
        // kada korisnik završi sve lekcije u tečaju
        // Provjera se radi u /api/certificates POST endpoint-u

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Error updating progress:", error);
        return NextResponse.json(
            { message: "Greška pri ažuriranju napretka" },
            { status: 500 }
        );
    }
}
