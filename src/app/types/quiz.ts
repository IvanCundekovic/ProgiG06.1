// TypeScript modeli za kvizove i lekcije
// TypeScript tipovi za frontend - mapirani iz Prisma modela

export type Question = {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index točnog odgovora (0-based)
};

export type Quiz = {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    createdAt: Date;
};

export type Ingredient = {
    name: string;
    amount: string;
};

export type NutritionFact = {
    label: string;
    value: string;
};

export type Lesson = {
    id: string;
    title: string;
    description: string;
    videoUrl?: string;
    content: string;
    quiz?: Quiz;
    published: boolean;
    createdAt: Date;
    steps?: string[];
    ingredients?: Ingredient[];
    nutrition?: NutritionFact[];
    // F-015: Polja za pretragu i filtriranje
    difficultyLevel?: string | null;
    duration?: number | null;
    cuisine?: string | null;
    dietaryTags?: string[] | null;
    allergens?: string[] | null;
};

export type Course = {
    id: string;
    title: string;
    description: string;
    // UC-7: Polja tečaja
    difficultyLevel?: string | null;
    duration?: number | null;
    instructorId: string;
    instructorName: string;
    lessons: Lesson[];
    createdAt: Date;
};

export type QuizAnswer = {
    questionId: string;
    selectedAnswer: number;
};

export type QuizResult = {
    id: string;
    quizId: string;
    quizTitle: string;
    lessonId: string;
    lessonTitle: string;
    courseId: string;
    courseTitle: string;
    userId: string;
    userName: string;
    answers: QuizAnswer[];
    score: number; // Broj točnih odgovora
    totalQuestions: number;
    percentage: number;
    completedAt: Date;
    isCompleted: boolean; // Da li je kviz dovršen (false ako je napušten)
};

export type LessonReview = {
    id: string;
    courseId: string;
    lessonId: string;
    userId: string;
    userName: string;
    rating: number;
    comment?: string;
    photoDataUrl?: string;
    createdAt: string;
    instructorResponse?: string;
    responseAt?: string;
    responseAuthorId?: string;
    responseAuthorName?: string;
};

export type LessonAnswer = {
    id: string;
    questionId: string;
    responderId: string;
    responderName: string;
    message: string;
    createdAt: string;
};

export type LessonQuestion = {
    id: string;
    courseId: string;
    lessonId: string;
    userId: string;
    userName: string;
    question: string;
    createdAt: string;
    answers: LessonAnswer[];
};

export type WorkshopRequirement = {
    id: string;
    description: string;
    type: "completedLesson" | "completedCourse" | "custom";
    lessonId?: string;
    courseId?: string;
};

export type LiveWorkshop = {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    instructorName: string;
    scheduledAt: string;
    durationMinutes: number;
    capacity: number;
    currentParticipants: number;
    requirements: WorkshopRequirement[];
    meetingUrl: string;
    calendarSyncedAt?: string;
    status: "upcoming" | "in_progress" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
    lastConnectionStatus?: "stable" | "reconnecting" | "disconnected";
};

export type WorkshopRegistration = {
    id: string;
    workshopId: string;
    userId: string;
    userName: string;
    registeredAt: string;
    notifications: WorkshopNotification[];
};

export type WorkshopNotification = {
    id: string;
    message: string;
    createdAt: string;
    type: "schedule_change" | "reconnection" | "general";
};

