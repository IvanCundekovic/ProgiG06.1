import {beforeEach, describe, expect, it, vi} from 'vitest';
import {findUserByEmail, verifyPassword} from '@/app/lib/auth-utils';
import {prisma} from '@/prisma';
import bcrypt from 'bcryptjs';

vi.mock("next-auth", () => ({
    default: vi.fn(() => ({
        handlers: { GET: vi.fn(), POST: vi.fn() },
        auth: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
    })),
}));

vi.mock('@/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

describe('Auth Utils', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('verifyPassword', () => {
        it('treba vratiti true za ispravnu lozinku i hash', async () => {
            const password = 'lozinka123';
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const result = await verifyPassword(password, hash);
            expect(result).toBe(true);
        });

        it('treba vratiti false za neispravnu lozinku', async () => {
            const hash = await bcrypt.hash('prava-lozinka', 10);
            const result = await verifyPassword('kriva-lozinka', hash);
            expect(result).toBe(false);
        });

        it('treba vratiti false ako je lozinka prazan string', async () => {
            const hash = await bcrypt.hash('nešto', 10);
            const result = await verifyPassword('', hash);
            expect(result).toBe(false);
        });
    });

    describe('findUserByEmail', () => {
        it('treba vratiti korisnika ako email postoji u bazi', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
            };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

            const user = await findUserByEmail('test@example.com');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(user).toEqual(mockUser);
        });

        it('treba vratiti null ako korisnik ne postoji', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            const user = await findUserByEmail('nepostoji@example.com');

            expect(user).toBeNull();
        });

        it('treba baciti error ako Prisma baci error', async () => {
            vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB Connection Failed'));

            await expect(findUserByEmail('test@example.com')).rejects.toThrow('DB Connection Failed');
        });
    });
});