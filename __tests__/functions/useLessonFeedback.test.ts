import {act, renderHook, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useLessonFeedback} from '@/app/functions/useLessonFeedback';

describe('useLessonFeedback Hook', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('treba inicijalno učitati napredak i postaviti startedLessonKeys', async () => {
        const mockProgress = [
            {courseId: 'c1', lessonId: 'l1'},
            {courseId: 'c1', lessonId: 'l2'}
        ];

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockProgress,
        });

        const {result} = renderHook(() => useLessonFeedback());

        await waitFor(() => {
            expect(result.current.startedLessonsCount).toBe(2);
        });

        expect(result.current.hasStartedLesson('c1', 'l1')).toBe(true);
        expect(result.current.hasStartedLesson('c1', 'l3')).toBe(false);
    });

    it('markLessonStarted treba poslati POST zahtjev i ažurirati lokalni state', async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        (fetch as any).mockResolvedValueOnce({
            ok: true
        });

        const {result} = renderHook(() => useLessonFeedback());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.markLessonStarted('course1', 'lesson1');
        });

        expect(result.current.hasStartedLesson('course1', 'lesson1')).toBe(true);
        expect(result.current.startedLessonsCount).toBe(1);

        expect(fetch).toHaveBeenNthCalledWith(2, '/api/progress', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                courseId: 'course1',
                lessonId: 'lesson1',
                completionPercentage: 0,
                isCompleted: false,
            })
        }));
    });

    it('addReview treba dodati novu recenziju u listu', async () => {
        (fetch as any).mockResolvedValueOnce({ok: true, json: async () => []});

        const mockNewReview = {
            id: 'rev1',
            courseId: 'c1',
            lessonId: 'l1',
            rating: 5,
            comment: 'Odlično!',
            userId: 'user1'
        };

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockNewReview,
        });

        const {result} = renderHook(() => useLessonFeedback());

        await act(async () => {
            const review = await result.current.addReview({
                courseId: 'c1',
                lessonId: 'l1',
                rating: 5,
                comment: 'Odlično!'
            });
            expect(review).toEqual(mockNewReview);
        });

        expect(result.current.reviews).toContainEqual(mockNewReview);
        expect(result.current.getAverageRating('c1', 'l1')).toBe(5);
    });

    it('loadLessonQuestions treba dohvatiti pitanja i izbjeći duplikate', async () => {
        (fetch as any).mockResolvedValueOnce({ok: true, json: async () => []});

        const mockQuestions = [
            {id: 'q1', courseId: 'c1', lessonId: 'l1', question: 'Kako ovo radi?', answers: []}
        ];

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockQuestions,
        });

        const {result} = renderHook(() => useLessonFeedback());

        await act(async () => {
            await result.current.loadLessonQuestions('c1', 'l1');
        });

        expect(result.current.getLessonQuestions('c1', 'l1')).toHaveLength(1);
        expect(result.current.questions[0].question).toBe('Kako ovo radi?');
    });

    it('addAnswer treba ažurirati postojeće pitanje s novim odgovorom', async () => {
        (fetch as any).mockResolvedValueOnce({ok: true, json: async () => []});

        const initialQuestion = {id: 'q1', courseId: 'c1', lessonId: 'l1', answers: []};
        (fetch as any).mockResolvedValueOnce({ok: true, json: async () => [initialQuestion]});

        const {result} = renderHook(() => useLessonFeedback());

        await act(async () => {
            await result.current.loadLessonQuestions('c1', 'l1');
        });

        const mockAnswer = {id: 'a1', message: 'Evo odgovora'};
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockAnswer,
        });

        await act(async () => {
            await result.current.addAnswer({questionId: 'q1', message: 'Evo odgovora'});
        });

        const updatedQuestions = result.current.getLessonQuestions('c1', 'l1');
        expect(updatedQuestions[0].answers).toContainEqual(mockAnswer);
    });

    it('getAverageRating treba ispravno izračunati prosjek više recenzija', async () => {
        (fetch as any).mockResolvedValueOnce({ok: true, json: async () => []});

        const mockReviews = [
            {id: 'r1', courseId: 'c1', lessonId: 'l1', rating: 4},
            {id: 'r2', courseId: 'c1', lessonId: 'l1', rating: 2}
        ];
        (fetch as any).mockResolvedValueOnce({ok: true, json: async () => mockReviews});

        const {result} = renderHook(() => useLessonFeedback());

        await act(async () => {
            await result.current.loadLessonReviews('c1', 'l1');
        });

        expect(result.current.getAverageRating('c1', 'l1')).toBe(3);
        expect(result.current.getReviewCount('c1', 'l1')).toBe(2);
    });
});