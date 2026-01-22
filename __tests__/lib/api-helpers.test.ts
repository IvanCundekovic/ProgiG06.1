import {describe, expect, it, vi} from 'vitest';
import {frontendToPrismaWorkshopStatus, requireRole} from '@/app/lib/api-helpers';

vi.mock('@/app/auth', () => ({
    auth: vi.fn(),
}));

describe('API Helpers Logic', () => {
    it('requireRole treba baciti error ako STUDENT pokuša pristupiti ADMIN akciji', () => {
        expect(() => requireRole('STUDENT' as any, ['ADMINISTRATOR'] as any)).toThrow('Nemate dozvolu za ovu akciju');
    });

    it('requireRole treba dopustiti INSTRUCTOR ulogi pristup ako je na listi', () => {
        expect(() => requireRole('INSTRUCTOR' as any, ['INSTRUCTOR', 'ADMINISTRATOR'] as any)).not.toThrow();
    });

    it('treba ispravno pretvoriti frontend status "upcoming" u Prisma enum', () => {
        expect(frontendToPrismaWorkshopStatus('upcoming')).toBe('UPCOMING');
    });
});