import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET, POST} from '@/app/api/courses/route';
import {prisma} from '@/prisma';
import {requireAuth, requireRole} from '@/app/lib/api-helpers';
import {cache} from '@/app/lib/cache';
import {Role} from '@prisma/client';

vi.mock('next/server', () => ({
    NextRequest: function (url: string, init?: any) {
        return {
            url,
            method: init?.method || 'GET',
            json: async () => (typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body || {}),
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
        course: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock('@/app/lib/api-helpers', () => ({
    requireAuth: vi.fn(),
    requireRole: vi.fn(),
}));

vi.mock('@/app/lib/cache', () => ({
    cache: {
        delete: vi.fn(),
    },
    getCachedOrFetch: vi.fn((key, fetcher) => fetcher()),
}));

describe('Courses API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET - Dohvat kurseva', () => {
        it('treba dohvatiti kurseve i transformirati podatke instruktora i lekcija', async () => {
            const mockCourses = [{
                id: 'c1',
                title: 'Škola kuhanja',
                description: 'Opis',
                instructorId: 'i1',
                instructor: {name: 'Chef Marko', email: 'marko@test.com'},
                lessons: [
                    {
                        id: 'l1',
                        title: 'Lekcija 1',
                        published: true,
                        dietaryTags: JSON.stringify(['Vegansko']),
                        steps: JSON.stringify(['Korak 1']),
                        quiz: null
                    }
                ],
                createdAt: new Date()
            }];

            (prisma.course.findMany as any).mockResolvedValue(mockCourses);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data[0].instructorName).toBe('Chef Marko');
            expect(data[0].lessons[0].dietaryTags).toContain('Vegansko');
        });

        it('treba vratiti 500 ako baza baci error', async () => {
            (prisma.course.findMany as any).mockRejectedValue(new Error('DB Error'));

            const response = await GET();
            expect(response.status).toBe(500);
        });
    });

    describe('POST - Kreiranje kursa', () => {
        const validBody = {
            title: 'Novi tečaj',
            description: 'Opis tečaja',
            difficultyLevel: 'BEGINNER',
            duration: 120
        };

        it('treba uspješno kreirati tečaj i obrisati cache', async () => {
            const mockUser = {userId: 'inst_123', userRole: Role.INSTRUCTOR};
            (requireAuth as any).mockResolvedValue(mockUser);
            (requireRole as any).mockImplementation(() => true);

            (prisma.course.create as any).mockResolvedValue({
                id: 'new_c',
                ...validBody,
                instructorId: 'inst_123',
                instructor: {name: 'Instruktor', email: 'i@test.com'},
                createdAt: new Date()
            });

            const req = {
                json: async () => validBody
            } as any;

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.id).toBe('new_c');
            expect(cache.delete).toHaveBeenCalledWith('courses:all');
            expect(prisma.course.create).toHaveBeenCalled();
        });

        it('treba vratiti 400 ako nedostaje naslov tečaja', async () => {
            (requireAuth as any).mockResolvedValue({userId: 'u1', userRole: Role.ADMINISTRATOR});

            const req = {
                json: async () => ({description: 'Bez naslova'})
            } as any;

            const response = await POST(req);
            expect(response.status).toBe(400);
        });

        it('treba vratiti 403 ako korisnik nema dozvolu (npr. STUDENT)', async () => {
            (requireAuth as any).mockResolvedValue({userId: 'u1', userRole: Role.STUDENT});
            (requireRole as any).mockImplementation(() => {
                throw new Error('Nemate dozvolu za ovu akciju');
            });

            const req = {json: async () => validBody} as any;
            const response = await POST(req);

            expect(response.status).toBe(403);
        });
    });
});