import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";
import {PrismaAdapter} from "@auth/prisma-adapter"
import {prisma} from "@/prisma"
import {findUserByEmail, verifyPassword} from "@/app/lib/auth-utils";

import {Role} from "@prisma/client";

interface AuthorizeUser {
    id: string;
    email: string;
    name: string | null;
    role: Role;
}

const GITHUB_CLIENT_ID = process.env.AUTH_GITHUB_ID ?? "123";
const GITHUB_CLIENT_SECRET = process.env.AUTH_GITHUB_SECRET ?? "123";
const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_ID ?? "123";
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET ?? "123";

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error("Missing GitHub OAuth credentials in environment variables.");
}
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth credentials in environment variables.");
}

export const authOptions = {
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
                    return user as AuthorizeUser;
                }

                return null;
            },
        }),
        GitHub({
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
        }),
        Google({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "database",
    },
    callbacks: {
        // @ts-expect-error ignoriraj any kao tip
        async session({session, user, token}) {

            if (user) {
                (session.user).id = user.id;
                (session.user).role = user.role;
            }
            return session;
        }
    }
}