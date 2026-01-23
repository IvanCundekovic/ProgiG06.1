import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET} from '@/app/api/certificates/[id]/download/route';
import {prisma} from '@/prisma';
import {requireAuth} from '@/app/lib/api-helpers';
import {generateCertificatePDF} from '@/app/lib/pdf-generator';

vi.mock('next/server', async () => {
    const actual = await vi.importActual('next/server');
    return {
        ...actual,
        NextResponse: {
            json: (data: any, init?: any) => Response.json(data, init),
        },
    };
});

vi.mock('@/prisma', () => ({
    prisma: {
        certificate: {
            findUnique: vi.fn(),
            update: vi.fn(),
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
    generateCertificatePDF: vi.fn().mockResolvedValue(Buffer.from('fake-pdf-buffer-content')),
}));

describe('Certificate Download API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const userId = 'user_123';
    const certificateId = 'cert_456';

    it('treba vratiti 404 ako certifikat ne postoji', async () => {
        (requireAuth as any).mockResolvedValue({ userId });
        (prisma.certificate.findUnique as any).mockResolvedValue(null);

        const params = Promise.resolve({ id: certificateId });
        const req = {} as any;
        const response = await GET(req, { params });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.message).toContain('Certifikat nije pronađen');
    });

    it('treba vratiti 403 ako korisnik nije vlasnik certifikata', async () => {
        (requireAuth as any).mockResolvedValue({ userId: 'other_user' });
        (prisma.certificate.findUnique as any).mockResolvedValue({
            id: certificateId,
            userId: 'different_user',
            courseTitle: 'Test Course',
            course: {},
        });

        const params = Promise.resolve({ id: certificateId });
        const req = {} as any;
        const response = await GET(req, { params });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.message).toContain('Nemate pristup');
    });

    it('treba vratiti PDF ako certifikat ima pdfUrl', async () => {
        const mockPdfBase64 = Buffer.from('test-pdf-content').toString('base64');
        const pdfUrl = `data:application/pdf;base64,${mockPdfBase64}`;

        (requireAuth as any).mockResolvedValue({ userId });
        (prisma.certificate.findUnique as any).mockResolvedValue({
            id: certificateId,
            userId,
            courseTitle: 'Test Course',
            pdfUrl,
            course: {},
        });

        const params = Promise.resolve({ id: certificateId });
        const req = {} as any;
        const response = await GET(req, { params });

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('application/pdf');
        expect(response.headers.get('Content-Disposition')).toContain('attachment');
        
        const blob = await response.blob();
        expect(blob.type).toBe('application/pdf');
    });

    it('treba generirati PDF ako certifikat nema pdfUrl', async () => {
        const mockCert = {
            id: certificateId,
            userId,
            courseTitle: 'Test Course',
            pdfUrl: null,
            issuedAt: new Date(),
            course: {},
        };

        (requireAuth as any).mockResolvedValue({ userId });
        (prisma.certificate.findUnique as any).mockResolvedValue(mockCert);
        (prisma.user.findUnique as any).mockResolvedValue({ name: 'Test User' });
        (prisma.certificate.update as any).mockResolvedValue({
            ...mockCert,
            pdfUrl: 'data:application/pdf;base64,...',
        });

        const params = Promise.resolve({ id: certificateId });
        const req = {} as any;
        const response = await GET(req, { params });

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('application/pdf');
        expect(generateCertificatePDF).toHaveBeenCalled();
        expect(prisma.certificate.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: certificateId },
                data: expect.objectContaining({
                    pdfUrl: expect.stringContaining('data:application/pdf'),
                }),
            })
        );
    });
});
