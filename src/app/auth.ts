import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";
import {PrismaAdapter} from "@auth/prisma-adapter"
import {prisma} from "@/prisma"
import {findUserByEmail, verifyPassword} from "@/app/lib/auth-utils";

import {Role} from "@prisma/client";
import NextAuth, {NextAuthConfig, User} from "next-auth";
import {sendWelcomeEmail} from "@/app/lib/email-service";

interface ExtendedUser extends User {
    id: string;
    email: string;
    role: Role;
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
        }
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
}

export const {handlers, auth, signIn, signOut} = NextAuth(authOptions);

