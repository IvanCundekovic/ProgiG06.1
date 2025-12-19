import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { requireAuth } from "@/app/lib/api-helpers";

// F-004: GET korisnički profil
export async function GET() {
    try {
        const { userId } = await requireAuth();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userProfile: true,
                instructorProfile: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Korisnik nije pronađen" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            mustChangePassword: user.mustChangePassword,
            isVerified: user.isVerified,
            userProfile: user.userProfile,
            instructorProfile: user.instructorProfile,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { message: "Greška pri dohvaćanju profila" },
            { status: 500 }
        );
    }
}

// F-004: PUT ažuriranje korisničkog profila
export async function PUT(request: NextRequest) {
    try {
        const { userId } = await requireAuth();
        const body = await request.json();

        const {
            name,
            skillLevel,
            culinaryPreferences,
            allergies,
            favoriteCuisines,
            dietaryRestrictions,
            notes,
        } = body;

        // Ažuriraj osnovne podatke korisnika
        const userUpdate: { name?: string } = {};
        if (name !== undefined) userUpdate.name = name;

        if (Object.keys(userUpdate).length > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: userUpdate,
            });
        }

        // Ažuriraj ili kreiraj userProfile
        const profileData: {
            skillLevel?: string | null;
            culinaryPreferences?: string | null;
            allergies?: string | null;
            favoriteCuisines?: string | null;
            dietaryRestrictions?: string | null;
            notes?: string | null;
        } = {};
        if (skillLevel !== undefined) profileData.skillLevel = skillLevel;
        if (culinaryPreferences !== undefined) profileData.culinaryPreferences = JSON.stringify(culinaryPreferences);
        if (allergies !== undefined) profileData.allergies = JSON.stringify(allergies);
        if (favoriteCuisines !== undefined) profileData.favoriteCuisines = JSON.stringify(favoriteCuisines);
        if (dietaryRestrictions !== undefined) profileData.dietaryRestrictions = JSON.stringify(dietaryRestrictions);
        if (notes !== undefined) profileData.notes = notes;

        if (Object.keys(profileData).length > 0) {
            await prisma.userProfile.upsert({
                where: { userId },
                update: profileData,
                create: {
                    userId,
                    ...profileData,
                },
            });
        }

        return NextResponse.json({ message: "Profil uspješno ažuriran" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { message: "Greška pri ažuriranju profila" },
            { status: 500 }
        );
    }
}
