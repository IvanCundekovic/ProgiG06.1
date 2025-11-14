import {useCallback, useEffect, useState} from "react";
import type {LessonReview, LessonQuestion} from "@/app/types/quiz";

type CreateReviewInput = {
    courseId: string;
    lessonId: string;
    rating: number;
    comment?: string;
    photoDataUrl?: string;
};

type CreateQuestionInput = {
    courseId: string;
    lessonId: string;
    question: string;
};

type CreateAnswerInput = {
    questionId: string;
    message: string;
};

type RespondToReviewInput = {
    reviewId: string;
    message: string;
};

const STORAGE_KEY = "startedLessons";

const isBrowser = typeof window !== "undefined";

export function useLessonFeedback() {
    const [reviews, setReviews] = useState<LessonReview[]>([]);
    const [questions, setQuestions] = useState<LessonQuestion[]>([]);
    const [startedLessons, setStartedLessons] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Učitaj startedLessons iz localStorage
    useEffect(() => {
        if (!isBrowser) {
            return;
        }
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as string[];
                setStartedLessons(parsed);
            } catch (error) {
                console.warn("Neuspjelo parsiranje startedLessons:", error);
            }
        }
    }, []);

    // Spremi startedLessons u localStorage
    useEffect(() => {
        if (!isBrowser) {
            return;
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(startedLessons));
    }, [startedLessons]);

    const markLessonStarted = useCallback((lessonId: string) => {
        setStartedLessons(prev => {
            if (prev.includes(lessonId)) {
                return prev;
            }
            return [...prev, lessonId];
        });
    }, []);

    const hasStartedLesson = useCallback(
        (lessonId: string) => startedLessons.includes(lessonId),
        [startedLessons]
    );

    const addReview = useCallback(
        async ({courseId, lessonId, rating, comment, photoDataUrl}: CreateReviewInput) => {
            try {
                setLoading(true);
                const response = await fetch("/api/lesson-reviews", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        courseId,
                        lessonId,
                        rating,
                        comment,
                        photoDataUrl,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Greška pri kreiranju recenzije");
                }

                const newReview = await response.json();
                setReviews(prev => [...prev, newReview]);
                return newReview;
            } catch (err) {
                console.error("Error creating review:", err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const addQuestion = useCallback(
        async ({courseId, lessonId, question}: CreateQuestionInput) => {
            try {
                setLoading(true);
                const response = await fetch("/api/lesson-questions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        courseId,
                        lessonId,
                        question,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Greška pri kreiranju pitanja");
                }

                const newQuestion = await response.json();
                setQuestions(prev => [...prev, newQuestion]);
                return newQuestion;
            } catch (err) {
                console.error("Error creating question:", err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const addAnswer = useCallback(
        async ({questionId, message}: CreateAnswerInput) => {
            try {
                setLoading(true);
                const response = await fetch("/api/lesson-answers", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        questionId,
                        message,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Greška pri kreiranju odgovora");
                }

                const newAnswer = await response.json();
                setQuestions(prev =>
                    prev.map(question =>
                        question.id === questionId
                            ? {
                                  ...question,
                                  answers: [...question.answers, newAnswer],
                              }
                            : question
                    )
                );
                return newAnswer;
            } catch (err) {
                console.error("Error creating answer:", err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const respondToReview = useCallback(
        async ({reviewId, message}: RespondToReviewInput) => {
            try {
                setLoading(true);
                const response = await fetch(`/api/lesson-reviews/${reviewId}/respond`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Greška pri odgovaranju na recenziju");
                }

                const updatedReview = await response.json();
                setReviews(prev =>
                    prev.map(review => (review.id === reviewId ? updatedReview : review))
                );
                return updatedReview;
            } catch (err) {
                console.error("Error responding to review:", err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Učitaj recenzije za lekciju
    const loadLessonReviews = useCallback(async (courseId: string, lessonId: string) => {
        try {
            const response = await fetch(
                `/api/lesson-reviews?courseId=${courseId}&lessonId=${lessonId}`
            );
            if (response.ok) {
                const data = await response.json();
                setReviews(prev => {
                    // Ukloni stare recenzije za ovu lekciju i dodaj nove
                    const filtered = prev.filter(
                        r => !(r.courseId === courseId && r.lessonId === lessonId)
                    );
                    return [...filtered, ...data];
                });
                return data;
            }
        } catch (err) {
            console.error("Error loading lesson reviews:", err);
        }
        return [];
    }, []);

    // Učitaj pitanja za lekciju
    const loadLessonQuestions = useCallback(async (courseId: string, lessonId: string) => {
        try {
            const response = await fetch(
                `/api/lesson-questions?courseId=${courseId}&lessonId=${lessonId}`
            );
            if (response.ok) {
                const data = await response.json();
                setQuestions(prev => {
                    // Ukloni stara pitanja za ovu lekciju i dodaj nova
                    const filtered = prev.filter(
                        q => !(q.courseId === courseId && q.lessonId === lessonId)
                    );
                    return [...filtered, ...data];
                });
                return data;
            }
        } catch (err) {
            console.error("Error loading lesson questions:", err);
        }
        return [];
    }, []);

    const getLessonReviews = useCallback(
        (courseId: string, lessonId: string) =>
            reviews.filter(review => review.courseId === courseId && review.lessonId === lessonId),
        [reviews]
    );

    const getUserReview = useCallback(
        (courseId: string, lessonId: string, userId: string) =>
            reviews.find(
                review => review.courseId === courseId && review.lessonId === lessonId && review.userId === userId
            ),
        [reviews]
    );

    const getLessonQuestions = useCallback(
        (courseId: string, lessonId: string) =>
            questions.filter(question => question.courseId === courseId && question.lessonId === lessonId),
        [questions]
    );

    const getAverageRating = useCallback(
        (courseId: string, lessonId: string) => {
            const lessonReviews = getLessonReviews(courseId, lessonId);
            if (!lessonReviews.length) {
                return null;
            }
            const sum = lessonReviews.reduce((acc, review) => acc + review.rating, 0);
            return sum / lessonReviews.length;
        },
        [getLessonReviews]
    );

    const getReviewCount = useCallback(
        (courseId: string, lessonId: string) => getLessonReviews(courseId, lessonId).length,
        [getLessonReviews]
    );

    return {
        reviews,
        questions,
        startedLessons,
        loading,
        markLessonStarted,
        hasStartedLesson,
        addReview,
        addQuestion,
        addAnswer,
        respondToReview,
        loadLessonReviews,
        loadLessonQuestions,
        getLessonReviews,
        getLessonQuestions,
        getAverageRating,
        getReviewCount,
        getUserReview,
    };
}
