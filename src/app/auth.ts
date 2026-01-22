import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/prisma";
import {findUserByEmail, verifyPassword} from "@/app/lib/auth-utils";
import {Role} from "@prisma/client";
import NextAuth, {type NextAuthConfig} from "next-auth";
import {type JWT} from "next-auth/jwt";
import {sendWelcomeEmail} from "@/app/lib/email-service";


declare module "next-auth" {
    interface User {
        id?: string;
        role: Role;
        mustChangePassword?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role;
        mustChangePassword: boolean;
    }
}

export const authOptions: NextAuthConfig = {
    secret: process.env.AUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    providers: [
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
                    if (!user.firstLoginAt) {
                        await prisma.user.update({
                            where: {id: user.id},
                            data: {
                                mustChangePassword: true,
                                firstLoginAt: new Date(),
                            },
                        });
                        user.mustChangePassword = true;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                        emailVerified: user.emailVerified,
                        mustChangePassword: user.mustChangePassword ?? false,
                    };
                }

                return null;
            },
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({token, user, trigger, session}): Promise<JWT> {
            // Inicijalna prijava
            if (user) {
                token.id = user.id as string;
                token.role = user.role as Role;
                token.mustChangePassword = user.mustChangePassword ?? false;
            }

            // Update trigger za promjenu lozinke bez logouta
            if (trigger === "update") {
                if (session?.user && session.user.mustChangePassword !== undefined) {
                    token.mustChangePassword = session.user.mustChangePassword;
                } else if (session?.mustChangePassword !== undefined) {
                    token.mustChangePassword = session.mustChangePassword;
                }
            }

            return token as JWT;
        },
        async session({session, token}) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.mustChangePassword = token.mustChangePassword;
            }
            return session;
        },
    },
    events: {
        async createUser(message) {
            const {user} = message;
            await sendWelcomeEmail(user);
        }
    },
    pages: {
        signIn: '/LoginPage',
    },
};

export const {handlers, auth, signIn, signOut} = NextAuth(authOptions);