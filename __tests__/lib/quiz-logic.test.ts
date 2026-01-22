import {describe, expect, it} from 'vitest';

const calculateScore = (userAnswers: any[], correctAnswers: any[]) => {
    if (userAnswers.length === 0) return 0;

    let score = 0;
    userAnswers.forEach((ua) => {
        const correct = correctAnswers.find(ca => ca.id === ua.questionId);
        if (correct && correct.answer === ua.answer) {
            score++;
        }
    });

    return (score / correctAnswers.length) * 100;
};

describe('Quiz Logic - calculateScore', () => {
    const mockCorrectAnswers = [
        {id: 1, answer: 'A'},
        {id: 2, answer: 'B'},
        {id: 3, answer: 'C'}
    ];

    it('treba vratiti 100% za sve točne odgovore', () => {
        const userAnswers = [
            {questionId: 1, answer: 'A'},
            {questionId: 2, answer: 'B'},
            {questionId: 3, answer: 'C'}
        ];
        expect(calculateScore(userAnswers, mockCorrectAnswers)).toBe(100);
    });

    it('treba vratiti 0% ako su svi odgovori netočni', () => {
        const userAnswers = [
            {questionId: 1, answer: 'B'},
            {questionId: 2, answer: 'C'},
            {questionId: 3, answer: 'A'}
        ];
        expect(calculateScore(userAnswers, mockCorrectAnswers)).toBe(0);
    });

    it('treba ispravno izračunati djelomičan rezultat', () => {
        const userAnswers = [
            {questionId: 1, answer: 'A'},
            {questionId: 2, answer: 'X'},
            {questionId: 3, answer: 'X'}
        ];
        expect(calculateScore(userAnswers, mockCorrectAnswers)).toBeCloseTo(33.33, 1);
    });

    it('treba vratiti 0 ako korisnik nije poslao nijedan odgovor', () => {
        expect(calculateScore([], mockCorrectAnswers)).toBe(0);
    });
});