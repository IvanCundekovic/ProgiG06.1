import {beforeEach, describe, expect, it, vi} from 'vitest';
import {sendWelcomeEmail, sendWorkshopReminder} from '@/app/lib/email-service';

const mockSend = vi.fn().mockResolvedValue({
    data: {id: 'msg_123'},
    error: null
});

vi.mock('resend', () => {
    return {
        Resend: function () {
            return {
                emails: {
                    send: mockSend
                }
            };
        }
    };
});

process.env.RESEND_API_KEY = 're_123456789';

describe('Email Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('treba pozvati funkciju slanja s ispravnim podacima', async () => {
        const user = {
            email: 'student@test.com',
            name: 'Ivan',
            role: 'STUDENT'
        } as any;

        await sendWelcomeEmail(user);

        expect(mockSend).toHaveBeenCalled();
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
            to: [user.email]
        }));
    });

    it('treba ispravno formatirati datum za radionicu u HR formatu', async () => {
        const date = new Date('2025-12-25T10:00:00');
        await sendWorkshopReminder('test@test.com', 'Ivan', 'Božićni Ručak', date, 'http://link.com');

        expect(mockSend).toHaveBeenCalled();
        const lastCall = mockSend.mock.calls[0][0];

        expect(lastCall.html).toContain('25.');
        expect(lastCall.html).toContain('prosinca');
    });
});