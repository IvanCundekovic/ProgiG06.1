import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";
import {PrismaAdapter} from "@auth/prisma-adapter"
import {prisma} from "@/prisma"
import {findUserByEmail, verifyPassword} from "@/app/lib/auth-utils";

import {Role} from "@prisma/client";
import {NextAuthConfig, User} from "next-auth";
import {sendWelcomeEmail} from "@/app/lib/email-service";

interface ExtendedUser extends User {
    id: string;
    email: string;
    role: Role;
}

const GITHUB_CLIENT_ID = process.env.AUTH_GITHUB_ID;
const GITHUB_CLIENT_SECRET = process.env.AUTH_GITHUB_SECRET;
const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID;
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET;

// Build providers array - OAuth providers are optional
const providers: NextAuthConfig["providers"] = [
    Credentials({
        name: "Credentials",
        credentials: {
            identifier: {label: "E-mail", type: "text"},
            password: {label: "Lozinka", type: "password"}
        },
        async authorize(credentials) {
            if (!credentials?.identifier || !credentials?.password) {
                return null;
            }

            const identifier = credentials.identifier as string;
            const password = credentials.password as string;

            const user = await findUserByEmail(identifier);

            if (!user || !user.passwordHash) {
                return null;
            }

                const isValid = await verifyPassword(password, user.passwordHash);

                if (isValid) {
                    // F-006: Provjeri je li prva prijava
                    const isFirstLogin = !user.firstLoginAt;
                    if (isFirstLogin) {
                        // Postavi mustChangePassword flag
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { 
                                mustChangePassword: true,
                                firstLoginAt: new Date()
                            }
                        });
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                        emailVerified: user.emailVerified,
                    };
                }

                return null;
        },
    }),
];

// Add GitHub provider only if credentials are available
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && GITHUB_CLIENT_ID !== "placeholder" && GITHUB_CLIENT_SECRET !== "placeholder") {
    providers.push(
        GitHub({
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
        })
    );
} else {
    console.warn("GitHub OAuth nije konfiguriran. Postavite AUTH_GITHUB_ID i AUTH_GITHUB_SECRET u .env datoteci.");
}

// Add Google provider only if credentials are available
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_ID !== "placeholder" && GOOGLE_CLIENT_SECRET !== "placeholder") {
    providers.push(
        Google({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        })
    );
} else {
    console.warn("Google OAuth nije konfiguriran. Postavite AUTH_GOOGLE_ID i AUTH_GOOGLE_SECRET u .env datoteci.");
}

export const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma),
    providers,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true, // Required for development on localhost
    debug: process.env.NODE_ENV === "development", // Enable debug in development
    pages: {
        signIn: "/LoginPage",
        error: "/LoginPage",
    },
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60, // 30 dana
    },
    callbacks: {
        async session({session, user}) {
            if (user) {
                const extendedUser = user as ExtendedUser;
                (session.user as ExtendedUser).id = extendedUser.id;
                (session.user as ExtendedUser).role = extendedUser.role;
            }
            return session;
        },
    },
    events: {
        async createUser(message) {
            try {
                const { user } = message;
                await sendWelcomeEmail(user);
            } catch (error) {
                console.error("Error sending welcome email:", error);
                // Ne prekidaj registraciju ako email ne radi
            }
        },
    },
}

// Export authOptions for use in route handler
// Don't call NextAuth here - it will be called in the route handler