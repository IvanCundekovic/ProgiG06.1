import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET, POST} from '@/app/api/certificates/route';
import {prisma} from '@/prisma';
import {requireAuth} from '@/app/lib/api-helpers';

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
        certificate: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        course: {
            findUnique: vi.fn(),
        },
        progress: {
            findUnique: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        }
    },
}));

vi.mock('@/app/lib/api-helpers', () => ({
    requireAuth: vi.fn(),
}));

vi.mock('@/app/lib/pdf-generator', () => ({
    generateCertificatePDF: vi.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
}));

describe('Certificates API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET - Dohvat certifikata', () => {
        it('treba dohvatiti certifikate prijavljenog korisnika', async () => {
            (requireAuth as any).mockResolvedValue({ userId: 'user_123' });
            const mockCerts = [{ id: 'cert_1', courseTitle: 'Kulinarski tečaj', issuedAt: new Date() }];
            (prisma.certificate.findMany as any).mockResolvedValue(mockCerts);

            const req = { url: 'http://localhost/api/certificates' } as any;
            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveLength(1);
            expect(data[0].courseTitle).toBe('Kulinarski tečaj');
        });
    });

    describe('POST - Generiranje certifikata', () => {
        const userId = 'user_123';
        const courseId = 'course_456';

        it('treba vratiti 400 ako nisu dovršene sve lekcije', async () => {
            (requireAuth as any).mockResolvedValue({ userId });

            (prisma.course.findUnique as any).mockResolvedValue({
                id: courseId,
                lessons: [{ id: 'L1' }, { id: 'L2' }]
            });

            (prisma.progress.findUnique as any)
                .mockResolvedValueOnce({ isCompleted: true })
                .mockResolvedValueOnce(null);

            const req = { json: async () => ({ courseId }) } as any;
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.message).toContain('Morate dovršiti sve lekcije');
        });

        it('treba uspješno kreirati certifikat i generirati PDF ako su lekcije dovršene', async () => {
            (requireAuth as any).mockResolvedValue({ userId });

            (prisma.course.findUnique as any).mockResolvedValue({
                id: courseId,
                title: 'Masterclass',
                lessons: [{ id: 'L1' }]
            });
            (prisma.progress.findUnique as any).mockResolvedValue({ isCompleted: true });

            (prisma.certificate.findUnique as any).mockResolvedValue(null);

            const mockCert = { id: 'new_cert_id', issuedAt: new Date(), courseTitle: 'Masterclass' };
            (prisma.certificate.create as any).mockResolvedValue(mockCert);
            (prisma.user.findUnique as any).mockResolvedValue({ name: 'Pero Perić' });
            (prisma.certificate.update as any).mockResolvedValue({ ...mockCert, pdfUrl: 'data:application/pdf;base64...' });

            const req = { json: async () => ({ courseId }) } as any;
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(prisma.certificate.create).toHaveBeenCalled();
            expect(prisma.certificate.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'new_cert_id' },
                data: expect.objectContaining({ pdfUrl: expect.stringContaining('data:application/pdf') })
            }));
        });

        it('treba vratiti postojeći certifikat ako je već izdan', async () => {
            (requireAuth as any).mockResolvedValue({ userId });
            (prisma.course.findUnique as any).mockResolvedValue({ id: courseId, lessons: [] });

            const existingCert = { id: 'existing_id', courseTitle: 'Već završen' };
            (prisma.certificate.findUnique as any).mockResolvedValue(existingCert);

            const req = { json: async () => ({ courseId }) } as any;
            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.id).toBe('existing_id');
            expect(prisma.certificate.create).not.toHaveBeenCalled();
        });
    });
});