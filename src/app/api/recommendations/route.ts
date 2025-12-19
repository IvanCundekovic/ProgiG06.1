import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// F-014: GET personalizirane preporuke
export async function GET() {
    try {
        const { userId } = await requireAuth();

        // Učitaj korisnički profil
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userProfile: true,
                progress: {
                    select: {
                        courseId: true,
                        isCompleted: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Korisnik nije pronađen" },
                { status: 404 }
            );
        }

        const profile = user.userProfile;
        const completedCourseIds = user.progress
            .filter((p) => p.isCompleted)
            .map((p) => p.courseId);

        // Učitaj sve tečajeve
        const allCourses = await prisma.course.findMany({
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        instructorProfile: true,
                    },
                },
                lessons: {
                    where: { published: true },
                    select: {
                        id: true,
                        title: true,
                        difficultyLevel: true,
                        cuisine: true,
                        dietaryTags: true,
                        allergens: true,
                    },
                },
            },
        });

        // Filtriraj tečajeve koje korisnik već nije dovršio
        const availableCourses = allCourses.filter(
            (course) => !completedCourseIds.includes(course.id)
        );

        // Algoritam preporuke - osnovna verzija
        const scoredCourses = availableCourses.map((course) => {
            let score = 0;

            // Provjeri razinu težine
            if (profile?.skillLevel) {
                const lessonDifficulties = course.lessons
                    .map((l) => l.difficultyLevel)
                    .filter((d): d is string => d !== null);
                const avgDifficulty = lessonDifficulties.length > 0
                    ? lessonDifficulties.reduce((sum, d) => {
                          const level = d === "beginner" ? 1 : d === "intermediate" ? 2 : 3;
                          return sum + level;
                      }, 0) / lessonDifficulties.length
                    : 2;

                const userLevel = profile.skillLevel === "beginner" ? 1
                    : profile.skillLevel === "intermediate" ? 2
                    : 3;

                // Bonus ako se razina podudara
                if (Math.abs(avgDifficulty - userLevel) <= 1) {
                    score += 10;
                }
            }

            // Provjeri omiljene kuhinje
            if (profile?.favoriteCuisines) {
                const favoriteCuisines = JSON.parse(profile.favoriteCuisines) as string[];
                const courseCuisines = course.lessons
                    .map((l) => l.cuisine)
                    .filter((c): c is string => c !== null);

                const matchingCuisines = courseCuisines.filter((c) =>
                    favoriteCuisines.some((fc) =>
                        c.toLowerCase().includes(fc.toLowerCase()) ||
                        fc.toLowerCase().includes(c.toLowerCase())
                    )
                );

                if (matchingCuisines.length > 0) {
                    score += matchingCuisines.length * 5;
                }
            }

            // Provjeri prehrambene planove
            if (profile?.dietaryRestrictions) {
                const dietaryRestrictions = JSON.parse(profile.dietaryRestrictions) as string[];
                const courseDietaryTags = course.lessons
                    .flatMap((l) => {
                        if (!l.dietaryTags) return [];
                        try {
                            return JSON.parse(l.dietaryTags) as string[];
                        } catch {
                            return [];
                        }
                    })
                    .filter((tag): tag is string => tag !== null);

                const matchingTags = courseDietaryTags.filter((tag) =>
                    dietaryRestrictions.some((dr) =>
                        tag.toLowerCase().includes(dr.toLowerCase()) ||
                        dr.toLowerCase().includes(tag.toLowerCase())
                    )
                );

                if (matchingTags.length > 0) {
                    score += matchingTags.length * 3;
                }
            }

            // Isključi tečajeve s alergenima
            if (profile?.allergies) {
                const allergies = JSON.parse(profile.allergies) as string[];
                const courseAllergens = course.lessons
                    .flatMap((l) => {
                        if (!l.allergens) return [];
                        try {
                            return JSON.parse(l.allergens) as string[];
                        } catch {
                            return [];
                        }
                    })
                    .filter((allergen): allergen is string => allergen !== null);

                const hasAllergen = courseAllergens.some((allergen) =>
                    allergies.some((a) =>
                        allergen.toLowerCase().includes(a.toLowerCase()) ||
                        a.toLowerCase().includes(allergen.toLowerCase())
                    )
                );

                if (hasAllergen) {
                    score -= 50; // Veliki negativni skor za alergene
                }
            }

            // Bonus za instruktore s visokom ocjenom
            if (course.instructor.instructorProfile?.averageRating) {
                const rating = course.instructor.instructorProfile.averageRating;
                if (rating >= 4.5) {
                    score += 5;
                } else if (rating >= 4.0) {
                    score += 3;
                }
            }

            return {
                course,
                score,
            };
        });

        // Sortiraj po score-u i vrati top 10
        const recommendedCourses = scoredCourses
            .filter((sc) => sc.score > 0) // Samo pozitivne preporuke
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((sc) => ({
                id: sc.course.id,
                title: sc.course.title,
                description: sc.course.description,
                instructorName: sc.course.instructor.name || sc.course.instructor.id,
                score: sc.score,
                lessonsCount: sc.course.lessons.length,
            }));

        return NextResponse.json({
            recommendations: recommendedCourses,
            totalAvailable: availableCourses.length,
        });
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return NextResponse.json(
            { message: "Greška pri generiranju preporuka" },
            { status: 500 }
        );
    }
}
