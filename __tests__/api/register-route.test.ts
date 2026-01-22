import {beforeEach, describe, expect, it, vi} from 'vitest';
import {POST} from '@/app/api/register/route';
import {prisma} from '@/prisma';
import {NextRequest} from 'next/server';

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
            create: vi.fn(),
        },
    },
}));

describe('Register API Route', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createMockRequest = (body: any) => {
        return new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    };

    it('treba vratiti 201 i kreirati korisnika ako su podaci ispravni', async () => {
        const body = { username: 'testuser', email: 'novo@test.com', password: 'password123' };

        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue({ id: 'new-id', ...body } as any);

        const req = createMockRequest(body);
        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(201);
        expect(data.message).toContain('Korisnik uspješno registriran');
        expect(prisma.user.create).toHaveBeenCalled();
    });

    it('treba vratiti 409 ako email već postoji', async () => {
        const body = { username: 'testuser', email: 'postojeci@test.com', password: 'password123' };

        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: body.email } as any);

        const req = createMockRequest(body);
        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(409);
        expect(data.message).toContain('Korisnik s ovim e-mailom već postoji.');
        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('treba vratiti 400 ako nedostaju obavezna polja', async () => {
        const body = { email: 'samo-email@test.com' };

        const req = createMockRequest(body);
        const res = await POST(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toBeDefined();
    });

    it('treba vratiti 500 ako baza baci neočekivanu grešku', async () => {
        const body = { username: 'err', email: 'err@test.com', password: 'password' };

        vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Fatal DB Error'));

        const req = createMockRequest(body);
        const res = await POST(req);

        expect(res.status).toBe(500);
    });
});