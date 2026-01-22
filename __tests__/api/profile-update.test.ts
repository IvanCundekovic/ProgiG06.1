import {describe, it, vi} from 'vitest';

vi.mock('next/server', () => {
    return {
        NextRequest: vi.fn().mockImplementation((url, init) => ({
            url,
            json: async () => JSON.parse(init.body),
        })),
        NextResponse: {
            json: vi.fn((body, init) => ({
                status: init?.status || 200,
                json: async () => body,
            })),
        },
    };
});

vi.mock('@/prisma', () => ({
    prisma: {
        user: {
            update: vi.fn(),
        },
    },
}));

vi.mock('@/app/lib/api-helpers', () => ({
    requireAuth: vi.fn().mockResolvedValue({userId: 'user_123', userRole: 'STUDENT'}),
}));

describe('Profile Update API', () => {
    it('treba uspješno ažurirati profil', async () => {
    });
});