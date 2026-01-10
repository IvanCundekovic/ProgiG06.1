import { NextResponse } from "next/server";

/**
 * GET /api/auth/providers
 * Vraća listu dostupnih OAuth providera
 */
export async function GET() {
    const providers: string[] = [];

    // Provjeri Google OAuth
    const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID;
    const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET;
    if (
        GOOGLE_CLIENT_ID &&
        GOOGLE_CLIENT_SECRET &&
        GOOGLE_CLIENT_ID !== "placeholder" &&
        GOOGLE_CLIENT_SECRET !== "placeholder"
    ) {
        providers.push("google");
    }

    // Provjeri GitHub OAuth
    const GITHUB_CLIENT_ID = process.env.AUTH_GITHUB_ID;
    const GITHUB_CLIENT_SECRET = process.env.AUTH_GITHUB_SECRET;
    if (
        GITHUB_CLIENT_ID &&
        GITHUB_CLIENT_SECRET &&
        GITHUB_CLIENT_ID !== "placeholder" &&
        GITHUB_CLIENT_SECRET !== "placeholder"
    ) {
        providers.push("github");
    }

    return NextResponse.json({ providers });
}
