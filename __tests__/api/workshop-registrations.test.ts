import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET, POST} from '@/app/api/workshop-registrations/route';
import {prisma} from '@/prisma';
import {requireAuth} from '@/app/lib/api-helpers';

vi.mock('next/server', () => ({
    NextRequest: function (url: string, init?: any) {
        return {
            url,
            method: init?.method || 'GET',
            json: async () => {
                if (typeof init?.body === 'string') return JSON.parse(init.body);
                return init?.body || {};
            },
        };
    },
    NextResponse: {
        json: vi.fn((body, init) => ({
            status: init?.status || 200,
            json: async () => body,
        })),
    },
}));

vi.mock('@/prisma', () => ({
    prisma: {
        workshopRegistration: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        liveWorkshop: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('@/app/lib/api-helpers', () => ({
    requireAuth: vi.fn(),
    prismaToFrontendNotificationType: vi.fn((type) => type.toLowerCase()),
}));

describe('Workshop Registrations API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET - Dohvat registracija', () => {
        it('treba vratiti prazan niz ako korisnik nije prijavljen', async () => {
            (requireAuth as any).mockRejectedValue(new Error('Morate biti prijavljeni'));

            const req = {url: 'http://localhost/api/workshop-registrations'} as any;
            const response = await GET(req);
            const data = await response.json();

            expect(data).toEqual([]);
            expect(response.status).toBe(200);
        });

        it('treba vratiti transformirane registracije za prijavljenog korisnika', async () => {
            (requireAuth as any).mockResolvedValue({userId: 'user_1'});
            const mockReg = [{
                id: 'reg_1',
                workshopId: 'w_1',
                userId: 'user_1',
                userName: 'Test User',
                registeredAt: new Date(),
                notifications: [],
                workshop: {title: 'Workshop 1', instructor: {name: 'Inst'}}
            }];
            (prisma.workshopRegistration.findMany as any).mockResolvedValue(mockReg);

            const req = {url: 'http://localhost/api/workshop-registrations'} as any;
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data[0].userName).toBe('Test User');
            expect(data[0]).toHaveProperty('registeredAt');
        });
    });

    describe('POST - Prijava na radionicu', () => {
        const workshopId = 'workshop_123';
        const userId = 'user_456';

        it('treba vratiti 400 ako je radionica puna', async () => {
            (requireAuth as any).mockResolvedValue({userId});

            (prisma.liveWorkshop.findUnique as any).mockResolvedValue({
                id: workshopId,
                maxParticipants: 10,
                registrations: new Array(10).fill({})
            });

            const req = {
                json: async () => ({workshopId})
            } as any;

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toContain('maksimalan broj polaznika');
        });

        it('treba vratiti 400 ako je korisnik već prijavljen', async () => {
            (requireAuth as any).mockResolvedValue({userId});
            (prisma.liveWorkshop.findUnique as any).mockResolvedValue({
                id: workshopId,
                maxParticipants: 20,
                registrations: []
            });
            (prisma.workshopRegistration.findUnique as any).mockResolvedValue({id: 'existing'});

            const req = {
                json: async () => ({workshopId})
            } as any;

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toContain('Već ste prijavljeni');
        });

        it('treba uspješno kreirati registraciju i povećati broj polaznika', async () => {
            (requireAuth as any).mockResolvedValue({userId});
            (prisma.liveWorkshop.findUnique as any).mockResolvedValue({
                id: workshopId,
                title: 'Kuhanje 101',
                maxParticipants: 10,
                registrations: []
            });
            (prisma.workshopRegistration.findUnique as any).mockResolvedValue(null);
            (prisma.user.findUnique as any).mockResolvedValue({id: userId, name: 'Pero', email: 'pero@test.com'});

            (prisma.workshopRegistration.create as any).mockResolvedValue({
                id: 'new_reg',
                workshopId,
                userId,
                userName: 'Pero',
                registeredAt: new Date(),
                notifications: [{id: 'n1', message: 'Uspjeh', type: 'GENERAL', createdAt: new Date()}]
            });

            const req = {
                json: async () => ({workshopId})
            } as any;

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(prisma.liveWorkshop.update).toHaveBeenCalledWith(expect.objectContaining({
                data: {currentParticipants: {increment: 1}}
            }));
            expect(data.userName).toBe('Pero');
        });
    });
});