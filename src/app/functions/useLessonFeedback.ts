import {useCallback, useEffect, useMemo, useState} from "react";
import type {LessonReview, LessonQuestion, LessonAnswer} from "@/app/types/quiz";

type LessonFeedbackStorage = {
    reviews: LessonReview[];
    questions: LessonQuestion[];
    startedLessons: string[];
};

type CreateReviewInput = {
    courseId: string;
    lessonId: string;
    rating: number;
    comment?: string;
    photoDataUrl?: string;
    userId: string;
    userName: string;
};

type CreateQuestionInput = {
    courseId: string;
    lessonId: string;
    question: string;
    userId: string;
    userName: string;
};

type CreateAnswerInput = {
    questionId: string;
    responderId: string;
    responderName: string;
    message: string;
};

type RespondToReviewInput = {
    reviewId: string;
    responderId: string;
    responderName: string;
    message: string;
};

const STORAGE_KEY = "lessonFeedback";

const generateId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `id-${Math.random().toString(16).slice(2)}-${Date.now()}`;
};

const emptyState: LessonFeedbackStorage = {
    reviews: [],
    questions: [],
    startedLessons: []
};

const isBrowser = typeof window !== "undefined";

export function useLessonFeedback() {
    const [state, setState] = useState<LessonFeedbackStorage>(emptyState);

    useEffect(() => {
        if (!isBrowser) {
            return;
        }
        const storedValue = window.localStorage.getItem(STORAGE_KEY);
        if (storedValue) {
            try {
                const parsed = JSON.parse(storedValue) as LessonFeedbackStorage;
                setState({
                    reviews: parsed.reviews ?? [],
                    questions: parsed.questions ?? [],
                    startedLessons: parsed.startedLessons ?? []
                });
            } catch (error) {
                console.warn("Neuspjelo parsiranje lessonFeedback podataka:", error);
                setState(emptyState);
            }
        }
    }, []);

    useEffect(() => {
        if (!isBrowser) {
            return;
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const markLessonStarted = useCallback((lessonId: string) => {
        setState(prev => {
            if (prev.startedLessons.includes(lessonId)) {
                return prev;
            }
            return {
                ...prev,
                startedLessons: [...prev.startedLessons, lessonId]
            };
        });
    }, []);

    const hasStartedLesson = useCallback(
        (lessonId: string) => state.startedLessons.includes(lessonId),
        [state.startedLessons]
    );

    const addReview = useCallback(
        ({courseId, lessonId, rating, comment, photoDataUrl, userId, userName}: CreateReviewInput) => {
            const newReview: LessonReview = {
                id: generateId(),
                courseId,
                lessonId,
                rating,
                comment,
                photoDataUrl,
                userId,
                userName,
                createdAt: new Date().toISOString()
            };

            setState(prev => ({
                ...prev,
                reviews: [...prev.reviews, newReview]
            }));
        },
        []
    );

    const addQuestion = useCallback(
        ({courseId, lessonId, question, userId, userName}: CreateQuestionInput) => {
            const newQuestion: LessonQuestion = {
                id: generateId(),
                courseId,
                lessonId,
                question,
                userId,
                userName,
                createdAt: new Date().toISOString(),
                answers: []
            };

            setState(prev => ({
                ...prev,
                questions: [...prev.questions, newQuestion]
            }));
        },
        []
    );

    const addAnswer = useCallback(({questionId, responderId, responderName, message}: CreateAnswerInput) => {
        setState(prev => ({
            ...prev,
            questions: prev.questions.map(question =>
                question.id === questionId
                    ? {
                          ...question,
                          answers: [
                              ...question.answers,
                              {
                                  id: generateId(),
                                  questionId,
                                  responderId,
                                  responderName,
                                  message,
                                  createdAt: new Date().toISOString()
                              } satisfies LessonAnswer
                          ]
                      }
                    : question
            )
        }));
    }, []);

    const respondToReview = useCallback(
        ({reviewId, responderId, responderName, message}: RespondToReviewInput) => {
            setState(prev => ({
                ...prev,
                reviews: prev.reviews.map(review =>
                    review.id === reviewId
                        ? {
                              ...review,
                              instructorResponse: message,
                              responseAuthorId: responderId,
                              responseAuthorName: responderName,
                              responseAt: new Date().toISOString()
                          }
                        : review
                )
            }));
        },
        []
    );

    const getLessonReviews = useCallback(
        (courseId: string, lessonId: string) =>
            state.reviews.filter(review => review.courseId === courseId && review.lessonId === lessonId),
        [state.reviews]
    );

    const getUserReview = useCallback(
        (courseId: string, lessonId: string, userId: string) =>
            state.reviews.find(
                review => review.courseId === courseId && review.lessonId === lessonId && review.userId === userId
            ),
        [state.reviews]
    );

    const getLessonQuestions = useCallback(
        (courseId: string, lessonId: string) =>
            state.questions.filter(question => question.courseId === courseId && question.lessonId === lessonId),
        [state.questions]
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

    const getStartedLessons = useMemo(() => state.startedLessons, [state.startedLessons]);

    return {
        reviews: state.reviews,
        questions: state.questions,
        startedLessons: getStartedLessons,
        markLessonStarted,
        hasStartedLesson,
        addReview,
        addQuestion,
        addAnswer,
        getLessonReviews,
        getLessonQuestions,
        getAverageRating,
        getReviewCount,
        getUserReview,
        respondToReview
    };
}

