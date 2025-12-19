import {authOptions} from "@/app/auth"
import NextAuth from "next-auth"

// Provjeri da li AUTH_SECRET postoji
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    console.error("⚠️  AUTH_SECRET nije postavljen! Postavi ga u .env datoteci.");
    console.error("   Generiraj ga sa: openssl rand -base64 32");
    // Ne bacaj error ovdje - NextAuth će dati bolju grešku
}

// Initialize NextAuth with authOptions
let handler;
try {
    handler = NextAuth(authOptions);
} catch (error) {
    console.error("❌ NextAuth initialization error:", error);
    throw error;
}

// Export handlers for route - NextAuth v5 format
export const {handlers, auth, signIn, signOut} = handler;

// Export GET and POST handlers - Next.js 15 App Router format
export const {GET, POST} = handlers;