import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET, POST} from '@/app/api/lessons/route';
import {prisma} from '@/prisma';
import {requireAuth, requireRole} from '@/app/lib/api-helpers';
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
        lesson: {findMany: vi.fn(), create: vi.fn()},
        course: {findUnique: vi.fn()},
        progress: {findMany: vi.fn()},
        userNotification: {create: vi.fn()},
    },
}));

vi.mock('@/app/lib/api-helpers', () => ({
    requireAuth: vi.fn(),
    requireRole: vi.fn(),
}));

vi.mock('@/app/lib/email-service', () => ({
    sendNewLessonNotification: vi.fn().mockResolvedValue(true),
}));

describe('Lessons API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET - Dohvat lekcija', () => {
        it('treba uspješno dohvatiti i transformirati lekcije s kvizom', async () => {
            const mockLessons = [{
                id: 'l1',
                title: 'Pasta Carbonara',
                steps: JSON.stringify(['Skuhaj pastu', 'Pomiješaj jaja']),
                quiz: {
                    id: 'q1',
                    title: 'Pasta Quiz',
                    questions: [{
                        id: 'ques1',
                        text: 'Koja tjestenina?',
                        options: JSON.stringify(['Penne', 'Spaghetti']),
                        correctAnswer: 1
                    }]
                },
                course: {title: 'Talijanska kuhinja', instructor: {name: 'Mario'}}
            }];

            (prisma.lesson.findMany as any).mockResolvedValue(mockLessons);

            const req = {url: 'http://localhost/api/lessons?courseId=c1'} as any;
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data[0].steps).toContain('Skuhaj pastu');
            expect(data[0].quiz.questions[0].options).toContain('Penne');
        });
    });

    describe('POST - Kreiranje lekcije', () => {
        const lessonBody = {
            title: 'Nova Lekcija',
            courseId: 'course_123',
            published: true,
            steps: ['Prvi korak']
        };

        it('treba vratiti 403 ako instruktor nije vlasnik kursa', async () => {
            (requireAuth as any).mockResolvedValue({userId: 'instructor_A', userRole: Role.INSTRUCTOR});
            (prisma.course.findUnique as any).mockResolvedValue({id: 'course_123', instructorId: 'instructor_B'});

            const req = {json: async () => lessonBody} as any;
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.message).toContain('Nemate dozvolu');
        });

        it('treba uspješno kreirati lekciju i poslati notifikacije', async () => {
            (requireAuth as any).mockResolvedValue({userId: 'inst_1', userRole: Role.INSTRUCTOR});
            (requireRole as any).mockImplementation(() => true);
            (prisma.course.findUnique as any).mockResolvedValue({
                id: 'course_123',
                instructorId: 'inst_1',
                title: 'Kuhanje'
            });

            const mockCreatedLesson = {
                id: 'less_99',
                title: 'Nova Lekcija',
                courseId: 'course_123',
                published: true,
                steps: JSON.stringify(['Prvi korak']),
                course: {title: 'Kuhanje'},
                quiz: null,
                createdAt: new Date()
            };
            (prisma.lesson.create as any).mockResolvedValue(mockCreatedLesson);

            (prisma.progress.findMany as any).mockResolvedValue([
                {user: {id: 'u1', email: 'u1@test.com', name: 'User 1'}}
            ]);

            const req = {json: async () => lessonBody} as any;
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(prisma.lesson.create).toHaveBeenCalled();
            expect(prisma.userNotification.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({userId: 'u1', type: 'NEW_LESSON'})
            }));
        });

        it('treba kreirati lekciju bez slanja notifikacija ako nije objavljena (published: false)', async () => {
            (requireAuth as any).mockResolvedValue({userId: 'inst_1', userRole: Role.INSTRUCTOR});
            (prisma.course.findUnique as any).mockResolvedValue({id: 'course_123', instructorId: 'inst_1'});

            (prisma.lesson.create as any).mockResolvedValue({
                id: 'less_hidden',
                published: false,
                steps: null,
                course: {title: 'Kuhanje'},
                quiz: null
            });

            const req = {json: async () => ({...lessonBody, published: false})} as any;
            await POST(req);

            expect(prisma.userNotification.create).not.toHaveBeenCalled();
            expect(prisma.progress.findMany).not.toHaveBeenCalled();
        });
    });
});