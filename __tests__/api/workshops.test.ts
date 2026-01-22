import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET, POST} from '@/app/api/workshops/route';
import {prisma} from '@/prisma';
import {requireAuth, requireRole} from '@/app/lib/api-helpers';
import {Role} from '@prisma/client';

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
        liveWorkshop: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock('@/app/lib/api-helpers', () => ({
    requireAuth: vi.fn(),
    requireRole: vi.fn(),
    frontendToPrismaWorkshopStatus: vi.fn((s) => s.toUpperCase()),
    prismaToFrontendWorkshopStatus: vi.fn((s) => s.toLowerCase()),
}));

vi.mock('@/app/lib/google-calendar', () => ({
    syncWorkshopToCalendar: vi.fn().mockResolvedValue({success: true, eventId: 'cal_123'}),
}));

vi.mock('@/app/auth', () => ({
    auth: vi.fn(),
}));

describe('Workshops API - GET', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('treba vratiti listu transformiranih radionica', async () => {
        const mockWorkshops = [{
            id: 'w1',
            title: 'Test Workshop',
            description: 'Opis',
            startTime: new Date('2025-12-25T10:00:00Z'),
            duration: 60,
            maxParticipants: 10,
            currentParticipants: 0,
            status: 'UPCOMING',
            instructorId: 'inst_1',
            instructor: {name: 'Chef Pero', email: 'pero@test.com'},
            requirements: JSON.stringify(['Nož', 'Daska']),
            createdAt: new Date(),
            updatedAt: new Date(),
            calendarSyncedAt: null,
            meetingUrl: 'http://zoom.us',
            lastConnectionStatus: null,
            registrations: []
        }];

        (prisma.liveWorkshop.findMany as any).mockResolvedValue(mockWorkshops);

        const req = {url: 'http://localhost/api/workshops'} as any;
        const response = await GET(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data[0].instructorName).toBeDefined();
    });
});

describe('Workshops API - POST', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('treba vratiti 403 ako STUDENT pokuša kreirati radionicu', async () => {
        (requireAuth as any).mockResolvedValue({userId: 'u1', userRole: Role.STUDENT});
        (requireRole as any).mockImplementation(() => {
            throw new Error('Nemate dozvolu za ovu akciju');
        });

        const req = {
            json: async () => ({title: 'Nova'})
        } as any;

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.message).toBe('Nemate dozvolu za ovu akciju');
    });

    it('treba uspješno kreirati radionicu', async () => {
        const mockUser = {userId: 'inst_1', userRole: Role.INSTRUCTOR};
        (requireAuth as any).mockResolvedValue(mockUser);

        (requireRole as any).mockImplementation(() => {
            return true;
        });

        const workshopData = {
            title: 'Božićni Keksi',
            scheduledAt: '2025-12-24T15:00:00Z',
            durationMinutes: 90,
            capacity: 12,
            requirements: ['Brašno']
        };

        (prisma.liveWorkshop.create as any).mockResolvedValue({
            id: 'new_w',
            ...workshopData,
            startTime: new Date(),
            duration: 90,
            maxParticipants: 12,
            instructorId: 'inst_1',
            instructor: {name: 'Chef Pero', email: 'pero@test.com'},
            status: 'UPCOMING',
            requirements: JSON.stringify(['Brašno']),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const req = {
            json: async () => workshopData
        } as any;

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.id).toBe('new_w');
    });
});