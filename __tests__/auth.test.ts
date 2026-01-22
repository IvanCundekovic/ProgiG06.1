import {describe, expect, it, vi} from 'vitest';
import {authOptions} from '@/app/auth';
import {Role} from '@prisma/client';

vi.mock("next-auth", () => ({
    default: vi.fn(() => ({
        handlers: { GET: vi.fn(), POST: vi.fn() },
        auth: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
    })),
}));

vi.mock("@/app/lib/email-service", () => ({
    sendWelcomeEmail: vi.fn(),
}));

type TestJWT = { id?: string; role?: Role; mustChangePassword?: boolean };
type TestUser = { id: string; role: Role; mustChangePassword?: boolean };
type TestSession = { user: { name: string; id?: string; role?: Role; mustChangePassword?: boolean }; expires?: string };

type JwtParams = {
    token: TestJWT;
    user?: TestUser | null;
    trigger?: 'signIn' | 'update' | string;
    session?: any;
};

type SessionCallbackParams = {
    session: TestSession;
    token: TestJWT;
    user?: unknown;
    newSession?: unknown;
    trigger?: string;
};

describe('Auth Configuration Callbacks', () => {
    describe('jwt callback', () => {
        it('treba ispravno postaviti token podatke prilikom prve prijave (user objekt postoji)', async () => {
            const jwtCallback = authOptions.callbacks?.jwt as unknown as (p: JwtParams) => Promise<TestJWT>;

            const mockUser: TestUser = {
                id: 'user-123',
                role: Role.STUDENT,
                mustChangePassword: true,
            };

            const token = (await jwtCallback({
                token: {} as TestJWT,
                user: mockUser,
                trigger: 'signIn',
                session: null,
            })) as TestJWT;

            expect(token.id).toBe('user-123');
            expect(token.role).toBe(Role.STUDENT);
            expect(token.mustChangePassword).toBe(true);
        });

        it('treba ažurirati mustChangePassword kada je trigger "update"', async () => {
            const jwtCallback = authOptions.callbacks?.jwt as unknown as (p: JwtParams) => Promise<TestJWT>;

            const initialToken: TestJWT = {
                id: 'user-123',
                role: Role.STUDENT,
                mustChangePassword: true,
            };

            const sessionUpdate = {
                user: { mustChangePassword: false },
            };

            const updatedToken = (await jwtCallback({
                token: initialToken,
                user: null,
                trigger: 'update',
                session: sessionUpdate,
            })) as TestJWT;

            expect(updatedToken.mustChangePassword).toBe(false);
        });
    });

    describe('session callback', () => {
        it('treba prenijeti podatke iz tokena u session objekt', async () => {
            const sessionCallback = authOptions.callbacks?.session as unknown as (p: SessionCallbackParams) => Promise<TestSession>;

            const mockToken: TestJWT = {
                id: 'user-123',
                role: Role.STUDENT,
                mustChangePassword: false,
            };

            const mockSession: TestSession = {
                user: { name: 'Test User' },
                expires: '2026-01-01',
            };

            const result = await sessionCallback({
                session: mockSession,
                token: mockToken,
                user: undefined,
                newSession: undefined,
                trigger: 'update',
            });

            expect(result.user.id).toBe('user-123');
            expect(result.user.role).toBe(Role.STUDENT);
            expect(result.user.mustChangePassword).toBe(false);
        });
    });
});
