import {act, renderHook, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useLiveWorkshops} from '@/app/functions/useLiveWorkshops';

const mockWorkshops = [
    {id: 'w1', title: 'Radionica 1', status: 'upcoming', capacity: 10}
];

const mockRegistrations = [
    {id: 'r1', workshopId: 'w1', userId: 'u1', userName: 'Pero'}
];

describe('useLiveWorkshops Hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('treba inicijalno učitati radionice i registracije', async () => {
        (fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWorkshops,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockRegistrations,
            });

        const {result} = renderHook(() => useLiveWorkshops());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        }, {timeout: 2000});

        expect(result.current.workshops).toEqual(mockWorkshops);
        expect(result.current.registrations).toEqual(mockRegistrations);
    });

    it('treba ispravno obraditi grešku pri učitavanju', async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        const {result} = renderHook(() => useLiveWorkshops());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Greška pri učitavanju radionica');
        expect(result.current.workshops).toEqual([]);
    });

    it('treba pozvati API kod kreiranja nove radionice', async () => {
        const newWorkshop = {id: 'w2', title: 'Nova'};

        (fetch as any)
            .mockResolvedValueOnce({ok: true, json: async () => []})
            .mockResolvedValueOnce({ok: true, json: async () => []})
            .mockResolvedValueOnce({
                ok: true,
                json: async () => newWorkshop,
            });

        const {result} = renderHook(() => useLiveWorkshops());

        await waitFor(() => expect(result.current.loading).toBe(false));

        let created;
        await act(async () => {
            created = await result.current.createWorkshop({
                title: 'Nova',
                description: 'Opis',
                scheduledAt: '2025-01-01',
                durationMinutes: 60,
                capacity: 5,
                meetingUrl: 'http://zoom.us',
                requirements: []
            });
        });

        expect(created).toEqual(newWorkshop);
        expect(result.current.workshops).toContainEqual(newWorkshop);
    });

    it('treba periodički osvježavati podatke (polling)', async () => {
        vi.useFakeTimers();

        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockWorkshops,
        });

        renderHook(() => useLiveWorkshops());

        await act(async () => {
            vi.advanceTimersByTime(10000);
        });

        expect(fetch).toHaveBeenCalledTimes(4);

        vi.useRealTimers();
    });

    it('registerForWorkshop treba dodati registraciju i osvježiti kapacitet', async () => {
        const newReg = {id: 'r2', workshopId: 'w1', userId: 'u2'};

        (fetch as any)
            .mockResolvedValueOnce({ok: true, json: async () => mockWorkshops})
            .mockResolvedValueOnce({ok: true, json: async () => []})
            .mockResolvedValueOnce({ok: true, json: async () => newReg})
            .mockResolvedValueOnce({ok: true, json: async () => mockWorkshops})
            .mockResolvedValueOnce({ok: true, json: async () => [newReg]});

        const {result} = renderHook(() => useLiveWorkshops());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.registerForWorkshop({workshopId: 'w1'});
        });

        expect(result.current.registrations).toContainEqual(newReg);
        expect(fetch).toHaveBeenCalledTimes(5);
    });
});