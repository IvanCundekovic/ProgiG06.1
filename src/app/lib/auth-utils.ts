"use server"

import {prisma} from "@/prisma";
import bcrypt from "bcryptjs";
import {signIn} from "../auth";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

type Credentials = {
    identifier: string;
    password: string;
};

export async function loginWithProvider(provider: "google" | "github") {
    await signIn(provider, { redirectTo: "/Homepage" });
}

export async function loginWithCredentials(credentials: Credentials) {
    try {
        await signIn("credentials", {
            identifier: credentials.identifier,
            password: credentials.password,
            redirect: false,
        });
    } catch (error) {
        throw error;
    }

    revalidatePath("/", "layout");
    redirect("/Homepage");
}

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {email},
    });
}

export async function createUser(username: string, email: string, passwordHash: string) {
    return prisma.user.create({
        data: {
            email: email,
            name: username,
            passwordHash: passwordHash,
        }
    });
}