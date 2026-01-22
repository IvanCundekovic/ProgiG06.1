import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {useLocalStorage} from '@/app/functions/useLocalStorage';

describe('useLocalStorage Hook', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('treba vratiti početnu vrijednost ako je storage prazan', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
        expect(result.current[0]).toBe('default');
    });

    it('treba ispravno spremiti vrijednost', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            const setValue = result.current[1];
            setValue('updated');
        });

        expect(result.current[0]).toBe('updated');
        expect(JSON.parse(window.localStorage.getItem('test-key') || '')).toBe('updated');
    });

    it('treba povući vrijednost iz storagea ako već postoji', () => {
        window.localStorage.setItem('existing-key', JSON.stringify('saved-data'));

        const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));

        expect(result.current[0]).toBe('saved-data');
    });
});