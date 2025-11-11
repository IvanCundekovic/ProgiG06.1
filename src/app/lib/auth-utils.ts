import {prisma} from "@/prisma";
import bcrypt from "bcryptjs";

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