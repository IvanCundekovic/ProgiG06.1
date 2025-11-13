"use client";

import {ChangeEvent, FormEvent, useMemo, useState} from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Stack,
    Rating,
    TextField,
    Divider,
    Alert,
    Paper
} from "@mui/material";
import type {Course, Lesson} from "@/app/types/quiz";
import {useLessonFeedback} from "@/app/functions/useLessonFeedback";

const mockCourses: Course[] = [
    {
        id: "course-1",
        title: "Osnove mediteranske kuhinje",
        description:
            "Naučite pripremiti klasična mediteranska jela uz fokus na svježe sastojke i zdrave tehnike kuhanja.",
        instructorId: "instructor-1",
        instructorName: "Ana Kovač",
        createdAt: new Date("2024-01-12"),
        lessons: [
            {
                id: "lesson-1",
                title: "Svježa tjestenina od nule",
                description:
                    "Korak-po-korak vodič za pripremu svježe tjestenine, od miješenja tijesta do savršene teksture.",
                content:
                    "U ovoj lekciji naučit ćete kako odabrati pravo brašno, pravilno mijesiti tijesto i oblikovati tjesteninu.",
                videoUrl: "https://www.youtube.com/watch?v=z4dOsI2-xXU",
                published: true,
                createdAt: new Date("2024-01-12"),
                steps: [
                    "Pomiješajte brašno i jaja dok se ne formira čvrsto tijesto.",
                    "Tijesto mijesite 8-10 minuta dok ne postane glatko.",
                    "Ostavite tijesto da odmori najmanje 30 minuta u hladnjaku.",
                    "Razvaljajte tijesto i oblikujte željeni tip tjestenine.",
                    "Kuhajte u kipućoj vodi 2-3 minute dok ne bude al dente."
                ],
                ingredients: [
                    {name: "Glatko brašno (tip 00)", amount: "300 g"},
                    {name: "Jaja", amount: "3 velika"},
                    {name: "Maslinovo ulje", amount: "1 žlica"},
                    {name: "Sol", amount: "1 prstohvat"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "320 kcal po porciji"},
                    {label: "Ugljikohidrati", value: "54 g"},
                    {label: "Bjelančevine", value: "13 g"},
                    {label: "Masti", value: "6 g"}
                ],
                quiz: {
                    id: "quiz-1",
                    title: "Provjera znanja: Svježa tjestenina",
                    description: "Provjerite koliko ste naučili o pripremi svježe tjestenine.",
                    createdAt: new Date("2024-01-12"),
                    questions: [
                        {
                            id: "question-1",
                            text: "Koje je optimalno vrijeme odmaranja tijesta prije oblikovanja?",
                            options: ["5 minuta", "15 minuta", "30 minuta", "1 sat"],
                            correctAnswer: 2
                        },
                        {
                            id: "question-2",
                            text: "Koje brašno daje najbolju elastičnost svježoj tjestenini?",
                            options: ["Tip 400", "Semolina", "Integralno brašno", "Heljdino brašno"],
                            correctAnswer: 1
                        },
                        {
                            id: "question-3",
                            text: "Što je ključ za sprječavanje lijepljenja svježe tjestenine?",
                            options: [
                                "Korištenje dosta ulja",
                                "Dodavanje šećera u tijesto",
                                "Obilno posipanje brašnom",
                                "Korištenje hladne vode"
                            ],
                            correctAnswer: 2
                        }
                    ]
                }
            },
            {
                id: "lesson-2",
                title: "Savršeni domaći pesto",
                description:
                    "Naučite napraviti aromatični pesto koristeći tradicionalnu tehniku uz tučak i mužar.",
                content:
                    "Prikazujemo kako odabrati svježe začinsko bilje, orašaste plodove te postići savršenu teksturu pesta.",
                videoUrl: "https://www.youtube.com/watch?v=4aZr5hZXP_s",
                published: true,
                createdAt: new Date("2024-02-03"),
                steps: [
                    "Pripremite svježi bosiljak, pinjole, češnjak, parmezan i maslinovo ulje.",
                    "Lagano tostirajte pinjole na tavi kako bi razvili aromu.",
                    "Koristite tučak i mužar za usitnjavanje sastojaka redoslijedom: češnjak, sol, bosiljak, pinjoli.",
                    "Dodajte naribani parmezan i postupno ulijevajte maslinovo ulje uz miješanje.",
                    "Pesto poslužite odmah ili spremite u hladnjak uz sloj maslinova ulja."
                ],
                ingredients: [
                    {name: "Svježi bosiljak", amount: "2 šalice listova"},
                    {name: "Pinjoli", amount: "40 g"},
                    {name: "Češnjak", amount: "2 češnja"},
                    {name: "Parmezan", amount: "50 g naribanog"},
                    {name: "Ekstra djevičansko maslinovo ulje", amount: "80 ml"},
                    {name: "Morska sol", amount: "po ukusu"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "90 kcal po žlici"},
                    {label: "Ugljikohidrati", value: "2 g"},
                    {label: "Bjelančevine", value: "2 g"},
                    {label: "Masti", value: "9 g"},
                    {label: "Vlakna", value: "1 g"}
                ],
                quiz: {
                    id: "quiz-2",
                    title: "Provjera znanja: Pesto",
                    description: "Koliko dobro poznajete tajne savršenog pesta?",
                    createdAt: new Date("2024-02-03"),
                    questions: [
                        {
                            id: "question-4",
                            text: "Koji sir se tradicionalno koristi u pestu alla genovese?",
                            options: ["Gouda", "Parmezan", "Cheddar", "Gauda"],
                            correctAnswer: 1
                        },
                        {
                            id: "question-5",
                            text: "Koja metoda čuva najviše arome u pestu?",
                            options: [
                                "Blendanje na visokoj brzini",
                                "Korištenje tučka i mužara",
                                "Dodavanje šećera",
                                "Zamrzavanje sastojaka prije pripreme"
                            ],
                            correctAnswer: 1
                        }
                    ]
                }
            }
        ]
    },
    {
        id: "course-2",
        title: "Azijski street food kod kuće",
        description:
            "Rekreirajte popularna ulična jela iz cijele Azije koristeći lokalno dostupne sastojke.",
        instructorId: "instructor-2",
        instructorName: "Marko Li",
        createdAt: new Date("2024-03-10"),
        lessons: [
            {
                id: "lesson-3",
                title: "Pho juha u 30 minuta",
                description: "Skraćena verzija tradicionalne vijetnamske juhe s bogatim umamijem.",
                content:
                    "Otkrivamo kako slojevito graditi okus juhe koristeći začine, meso i svježe dodatke.",
                videoUrl: "https://www.youtube.com/watch?v=1C0vhu4Yv5Q",
                published: true,
                createdAt: new Date("2024-03-10"),
                steps: [
                    "Pripremite začine: zvjezdasti anis, klinčiće, cimet, korijander i kardamom.",
                    "U tavi kratko tostirajte začine kako bi otpustili aromu.",
                    "U loncu prokuhajte temeljac i dodajte pržene začine te luk i đumbir.",
                    "Dodajte proteine po izboru (govedina, piletina) i kuhajte do željene mekoće.",
                    "Poslužite s rižinim rezancima, svježim začinskim biljem i limetom."
                ],
                ingredients: [
                    {name: "Goveđi ili pileći temeljac", amount: "1,5 l"},
                    {name: "Rižini rezanci", amount: "200 g"},
                    {name: "Zvjezdasti anis", amount: "2 komada"},
                    {name: "Klinčići", amount: "4 komada"},
                    {name: "Cimet štapić", amount: "1 komad"},
                    {name: "Đumbir", amount: "4 kriške"},
                    {name: "Luk", amount: "1 veći"},
                    {name: "Proteini po izboru", amount: "300 g"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "410 kcal po porciji"},
                    {label: "Ugljikohidrati", value: "45 g"},
                    {label: "Bjelančevine", value: "28 g"},
                    {label: "Masti", value: "12 g"},
                    {label: "Natrij", value: "980 mg"}
                ],
                quiz: {
                    id: "quiz-3",
                    title: "Provjera znanja: Pho",
                    description: "Provjerite znanje o ključnim sastojcima Pho juhe.",
                    createdAt: new Date("2024-03-10"),
                    questions: [
                        {
                            id: "question-6",
                            text: "Koji začin daje Pho juhi prepoznatljiv miris?",
                            options: ["Zvjezdasti anis", "Šafran", "Kardamom", "Kurkuma"],
                            correctAnswer: 0
                        },
                        {
                            id: "question-7",
                            text: "Koja vrsta rezanaca se koristi u Pho juhi?",
                            options: [
                                "Pšenični rezanci",
                                "Rižini rezanci",
                                "Udon rezanci",
                                "Soba rezanci"
                            ],
                            correctAnswer: 1
                        }
                    ]
                }
            },
            {
                id: "lesson-4",
                title: "Japanske gyoze",
                description: "Savršeno hrskavi i sočni ravioli punjeni svinjetinom i povrćem.",
                content:
                    "U ovoj lekciji učimo bračno tijesto, punjenje i tehniku pečenja/kuhanja gyoza.",
                videoUrl: "https://www.youtube.com/watch?v=TQYB7py97i4",
                published: true,
                createdAt: new Date("2024-03-22"),
                steps: [
                    "Pomiješajte sastojke za tijesto i ostavite da odmori 20 minuta.",
                    "Pripremite nadjev od mljevenog mesa, kupusa, đumbira i sojinog umaka.",
                    "Razvaljajte tijesto i izrežite krugove promjera oko 8 cm.",
                    "Punite gyoze i preklopite ih u oblik polumjeseca uz naborane rubove.",
                    "Pržite na tavi do zlatne boje, zatim dodajte vodu i poklopite da se ispare."
                ],
                ingredients: [
                    {name: "Pšenično brašno", amount: "250 g"},
                    {name: "Voda", amount: "140 ml"},
                    {name: "Mljevena svinjetina", amount: "200 g"},
                    {name: "Narezani kineski kupus", amount: "150 g"},
                    {name: "Sojin umak", amount: "2 žlice"},
                    {name: "Svježi đumbir", amount: "1 žlica naribanog"},
                    {name: "Sezamovo ulje", amount: "1 žličica"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "280 kcal po porciji (5 gyoza)"},
                    {label: "Ugljikohidrati", value: "30 g"},
                    {label: "Bjelančevine", value: "12 g"},
                    {label: "Masti", value: "12 g"},
                    {label: "Natrij", value: "540 mg"}
                ]
            }
        ]
    },
    {
        id: "course-3",
        title: "Plant-based specijaliteti",
        description:
            "Ukusna jela na biljnoj bazi koja impresioniraju i najtvrdokornije mesojede.",
        instructorId: "instructor-3",
        instructorName: "Ivana Horvat",
        createdAt: new Date("2024-04-05"),
        lessons: [
            {
                id: "lesson-5",
                title: "Burger od leće",
                description: "Sočni burger od crvene leće i dimljenih začina.",
                content:
                    "Kroz lekciju prolazimo pripremu leće, vezivanje smjese i pečenje.",
                videoUrl: "https://www.youtube.com/watch?v=oK8doU7-KTw",
                published: true,
                createdAt: new Date("2024-04-05"),
                steps: [
                    "Sameljite kuhanu crvenu leću i povrće u multipraktiku.",
                    "Dodajte lanene sjemenke, začine i krušne mrvice za vezivanje.",
                    "Oblikujte burgere i kratko ih ohladite u hladnjaku.",
                    "Pecite na tavi ili roštilju 3-4 minute sa svake strane.",
                    "Poslužite u pecivu s omiljenim prilozima i umacima."
                ],
                ingredients: [
                    {name: "Kuhana crvena leća", amount: "300 g"},
                    {name: "Sitno sjeckani luk", amount: "1 manji"},
                    {name: "Naribana mrkva", amount: "1 srednja"},
                    {name: "Lanene sjemenke", amount: "2 žlice mljevenih"},
                    {name: "Krušne mrvice", amount: "60 g"},
                    {name: "Dimljena paprika", amount: "1 žličica"},
                    {name: "Sol i papar", amount: "po ukusu"},
                    {name: "Maslinovo ulje", amount: "2 žlice"}
                ],
                nutrition: [
                    {label: "Kalorije", value: "260 kcal po burgeru"},
                    {label: "Ugljikohidrati", value: "28 g"},
                    {label: "Bjelančevine", value: "12 g"},
                    {label: "Masti", value: "9 g"},
                    {label: "Vlakna", value: "8 g"}
                ],
                quiz: {
                    id: "quiz-4",
                    title: "Provjera znanja: Burger od leće",
                    description: "Testirajte znanje o pripremi burgera od leće.",
                    createdAt: new Date("2024-04-05"),
                    questions: [
                        {
                            id: "question-8",
                            text: "Koji sastojak pomaže vezati smjesu za burger?",
                            options: ["Lanene sjemenke", "Šećer", "Maslac", "Sojino mlijeko"],
                            correctAnswer: 0
                        }
                    ]
                }
            }
        ]
    }
];

const DEMO_STUDENT = {
    id: "demo-student-1",
    name: "Demo polaznik"
};

type LessonWithCourse = {
    lesson: Lesson;
    course: Course;
};

const useLessonCards = (courses: Course[]): LessonWithCourse[] =>
    useMemo(
        () => courses.flatMap((course) => course.lessons.map((lesson) => ({lesson, course}))),
        [courses]
    );

const truncate = (text: string, length = 140) =>
    text.length > length ? `${text.slice(0, length).trim()}…` : text;

const getYoutubeThumbnail = (url?: string) => {
    if (!url) {
        return "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
    }

    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("youtu.be")) {
            const id = parsed.pathname.replace("/", "");
            if (id) {
                return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            }
        }

        if (parsed.pathname.startsWith("/embed/")) {
            const id = parsed.pathname.split("/").pop();
            if (id) {
                return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            }
        }

        const videoId = parsed.searchParams.get("v");
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
    } catch (error) {
        console.warn("Nevažeći URL videa:", url, error);
    }

    return "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
};

const getYoutubeEmbedUrl = (url: string) => {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtu.be")) {
            const id = parsed.pathname.replace("/", "");
            return `https://www.youtube.com/embed/${id}`;
        }

        if (parsed.pathname.startsWith("/embed/")) {
            return url;
        }

        const videoId = parsed.searchParams.get("v");
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch (error) {
        console.warn("Nevažeći URL videa za embed:", url, error);
    }

    return "https://www.youtube.com/embed/dQw4w9WgXcQ";
};

const formatDisplayDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return isoDate;
    }
    return date.toLocaleString("hr-HR", {
        dateStyle: "short",
        timeStyle: "short"
    });
};

export default function VideoLectures() {
    const currentUser = DEMO_STUDENT;
    const {
        markLessonStarted,
        hasStartedLesson,
        addReview,
        respondToReview,
        addQuestion,
        addAnswer,
        getLessonReviews,
        getLessonQuestions,
        getAverageRating,
        getReviewCount,
        getUserReview
    } = useLessonFeedback();

    const lessons = useLessonCards(mockCourses);

    const [selectedLesson, setSelectedLesson] = useState<LessonWithCourse | null>(null);
    const [isLessonDialogOpen, setLessonDialogOpen] = useState(false);
    const [activeInfoTab, setActiveInfoTab] = useState<"ingredients" | "nutrition">("ingredients");
    const [reviewRating, setReviewRating] = useState<number | null>(null);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
    const [questionText, setQuestionText] = useState("");
    const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
    const [reviewResponseDrafts, setReviewResponseDrafts] = useState<Record<string, string>>({});

    const selectedCourseId = selectedLesson?.course.id;
    const selectedLessonId = selectedLesson?.lesson.id;

    const lessonReviews = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getLessonReviews(selectedCourseId, selectedLessonId)
                : [],
        [getLessonReviews, selectedCourseId, selectedLessonId]
    );

    const lessonQuestions = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getLessonQuestions(selectedCourseId, selectedLessonId)
                : [],
        [getLessonQuestions, selectedCourseId, selectedLessonId]
    );

    const averageRating = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getAverageRating(selectedCourseId, selectedLessonId)
                : null,
        [getAverageRating, selectedCourseId, selectedLessonId]
    );

    const reviewCount = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getReviewCount(selectedCourseId, selectedLessonId)
                : 0,
        [getReviewCount, selectedCourseId, selectedLessonId]
    );

    const userReview = useMemo(
        () =>
            selectedCourseId && selectedLessonId
                ? getUserReview(selectedCourseId, selectedLessonId, currentUser.id)
                : undefined,
        [currentUser.id, getUserReview, selectedCourseId, selectedLessonId]
    );

    const lessonStarted = selectedLessonId ? hasStartedLesson(selectedLessonId) : false;

    const selectedIngredients = selectedLesson?.lesson.ingredients ?? [];
    const selectedNutrition = selectedLesson?.lesson.nutrition ?? [];
    const hasIngredients = selectedIngredients.length > 0;
    const hasNutrition = selectedNutrition.length > 0;

    const handleOpenLesson = (entry: LessonWithCourse) => {
        setSelectedLesson(entry);
        if (entry.lesson.ingredients?.length) {
            setActiveInfoTab("ingredients");
        } else if (entry.lesson.nutrition?.length) {
            setActiveInfoTab("nutrition");
        } else {
            setActiveInfoTab("ingredients");
        }
        setReviewRating(null);
        setReviewComment("");
        setReviewPhoto(null);
        setQuestionText("");
        setAnswerDrafts({});
        setReviewResponseDrafts({});
        setLessonDialogOpen(true);
    };

    const handleCloseLesson = () => {
        setLessonDialogOpen(false);
        setSelectedLesson(null);
        setActiveInfoTab("ingredients");
        setReviewRating(null);
        setReviewComment("");
        setReviewPhoto(null);
        setQuestionText("");
        setAnswerDrafts({});
        setReviewResponseDrafts({});
    };

    const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedLesson || reviewRating === null || userReview) {
            return;
        }

        addReview({
            courseId: selectedLesson.course.id,
            lessonId: selectedLesson.lesson.id,
            rating: reviewRating,
            comment: reviewComment.trim() || undefined,
            photoDataUrl: reviewPhoto ?? undefined,
            userId: currentUser.id,
            userName: currentUser.name
        });

        setReviewRating(null);
        setReviewComment("");
        setReviewPhoto(null);
    };

    const handleReviewPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setReviewPhoto(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setReviewPhoto(reader.result);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleQuestionSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedLesson || !questionText.trim()) {
            return;
        }

        addQuestion({
            courseId: selectedLesson.course.id,
            lessonId: selectedLesson.lesson.id,
            question: questionText.trim(),
            userId: currentUser.id,
            userName: currentUser.name
        });

        setQuestionText("");
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswerDrafts(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleAnswerSubmit = (questionId: string) => {
        if (!selectedLesson) {
            return;
        }
        const message = answerDrafts[questionId]?.trim();
        if (!message) {
            return;
        }

        addAnswer({
            questionId,
            responderId: selectedLesson.course.instructorId,
            responderName: selectedLesson.course.instructorName,
            message
        });

        setAnswerDrafts(prev => ({
            ...prev,
            [questionId]: ""
        }));
    };

    const handleReviewResponseChange = (reviewId: string, value: string) => {
        setReviewResponseDrafts(prev => ({
            ...prev,
            [reviewId]: value
        }));
    };

    const handleReviewResponseSubmit = (reviewId: string) => {
        if (!selectedLesson) {
            return;
        }
        const message = reviewResponseDrafts[reviewId]?.trim();
        if (!message) {
            return;
        }

        respondToReview({
            reviewId,
            responderId: selectedLesson.course.instructorId,
            responderName: selectedLesson.course.instructorName,
            message
        });

        setReviewResponseDrafts(prev => ({
            ...prev,
            [reviewId]: ""
        }));
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Video lekcije i kvizovi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                Pregledajte lekcije i provjerite znanje na kraju svake lekcije kroz kviz.
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3
                }}
            >
                {lessons.map(({lesson, course}) => {
                    const lessonAverage = getAverageRating(course.id, lesson.id);
                    const lessonReviewCount = getReviewCount(course.id, lesson.id);
                    return (
                        <Box
                            key={lesson.id}
                            sx={{
                                flex: "1 1 280px",
                                minWidth: 280,
                                maxWidth: 380
                            }}
                        >
                            <Card className="lesson-card" sx={{height: "100%"}}>
                                <CardActionArea onClick={() => handleOpenLesson({lesson, course})}>
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={
                                            lesson.videoUrl
                                                ? getYoutubeThumbnail(lesson.videoUrl)
                                                : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=60"
                                        }
                                        alt={lesson.title}
                                    />
                                    <CardContent className="lesson-card-content">
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            spacing={1}
                                            flexWrap="wrap"
                                            useFlexGap
                                        >
                                            <Chip label={course.title} color="secondary" size="small" />
                                            {lesson.quiz ? (
                                                <Chip label="Ima kviz" color="success" size="small" />
                                            ) : (
                                                <Chip label="Bez kviza" size="small" />
                                            )}
                                            {lessonReviewCount > 0 && (
                                                <Chip
                                                    size="small"
                                                    color="warning"
                                                    label={`⭐ ${lessonAverage?.toFixed(1)} (${lessonReviewCount})`}
                                                />
                                            )}
                                        </Stack>

                                        <Typography variant="h6" sx={{mt: 2}} gutterBottom>
                                            {lesson.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {truncate(lesson.description)}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Box>
                    );
                })}
            </Box>

            <Dialog open={isLessonDialogOpen && !!selectedLesson} onClose={handleCloseLesson} maxWidth="md" fullWidth>
                {selectedLesson && (
                    <>
                        <DialogTitle>{selectedLesson.lesson.title}</DialogTitle>
                        <DialogContent dividers>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                Instruktor: {selectedLesson.course.instructorName}
                            </Typography>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{mb: 2}}>
                                <Rating value={averageRating ?? 0} precision={0.5} readOnly />
                                <Typography variant="body2" color="text.secondary">
                                    {reviewCount > 0 && averageRating !== null
                                        ? `${averageRating.toFixed(1)} / 5 · ${reviewCount} recenzija`
                                        : "Još nema ocjena za ovu lekciju."}
                                </Typography>
                            </Stack>
                            {!lessonStarted && (
                                <Box sx={{mb: 3}}>
                                    <Alert severity="info" sx={{mb: 1}}>
                                        Za ocjenjivanje i postavljanje pitanja označite da ste započeli lekciju instruktora{" "}
                                        {selectedLesson.course.instructorName}.
                                    </Alert>
                                    <Button variant="contained" size="small" onClick={() => markLessonStarted(selectedLesson.lesson.id)}>
                                        Označi lekciju započetom
                                    </Button>
                                </Box>
                            )}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: {xs: "column", md: "row"},
                                    gap: 3
                                }}
                            >
                                <Box sx={{flex: 1}}>
                                    {selectedLesson.lesson.videoUrl && (
                                        <Box sx={{position: "relative", pt: "56.25%", borderRadius: 2, overflow: "hidden"}}>
                                            <iframe
                                                src={
                                                    selectedLesson.lesson.videoUrl
                                                        ? getYoutubeEmbedUrl(selectedLesson.lesson.videoUrl)
                                                        : undefined
                                                }
                                                title={selectedLesson.lesson.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{position: "absolute", inset: 0, width: "100%", height: "100%", border: 0}}
                                            />
                                        </Box>
                                    )}
                                    <Typography variant="body2" sx={{mt: 3}}>
                                        {selectedLesson.lesson.content}
                                    </Typography>
                                </Box>
                                <Box sx={{flex: 1, display: "flex", flexDirection: "column", gap: 3}}>
                                    {selectedLesson.lesson.steps && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Koraci pripreme
                                            </Typography>
                                            <ol className="lesson-steps">
                                                {selectedLesson.lesson.steps.map((step, index) => (
                                                    <li key={index}>
                                                        <Typography variant="body2">{step}</Typography>
                                                    </li>
                                                ))}
                                            </ol>
                                        </Box>
                                    )}
                                    {(hasIngredients || hasNutrition) && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Detalji jela
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{mb: 2}}>
                                                <Button
                                                    variant={activeInfoTab === "ingredients" ? "contained" : "outlined"}
                                                    onClick={() => setActiveInfoTab("ingredients")}
                                                    disabled={!hasIngredients}
                                                    size="small"
                                                >
                                                    Ingredients
                                                </Button>
                                                <Button
                                                    variant={activeInfoTab === "nutrition" ? "contained" : "outlined"}
                                                    onClick={() => setActiveInfoTab("nutrition")}
                                                    disabled={!hasNutrition}
                                                    size="small"
                                                >
                                                    Nutrition
                                                </Button>
                                            </Stack>
                                            {activeInfoTab === "ingredients" ? (
                                                hasIngredients ? (
                                                    <ul className="lesson-info-list">
                                                        {selectedIngredients.map((item, index) => (
                                                            <li key={index}>
                                                                <Typography variant="body2">
                                                                    <strong>{item.name}</strong>: {item.amount}
                                                                </Typography>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Podaci o sastojcima nisu dostupni za ovu lekciju.
                                                    </Typography>
                                                )
                                            ) : hasNutrition ? (
                                                <ul className="lesson-info-list">
                                                    {selectedNutrition.map((fact, index) => (
                                                        <li key={index}>
                                                            <Typography variant="body2">
                                                                <strong>{fact.label}</strong>: {fact.value}
                                                            </Typography>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Nutritivne informacije nisu dostupne za ovu lekciju.
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                            <Divider sx={{my: 3}} />
                            <Box className="lesson-feedback-section">
                                <Typography variant="h6" gutterBottom>
                                    Ocjene i komentari
                                </Typography>
                                {lessonReviews.length > 0 ? (
                                    <Stack spacing={2}>
                                        {lessonReviews.map(review => (
                                            <Paper key={review.id} variant="outlined" className="lesson-review-card" sx={{p: 2}}>
                                                <Stack
                                                    direction={{xs: "column", sm: "row"}}
                                                    spacing={1}
                                                    justifyContent="space-between"
                                                    alignItems={{xs: "flex-start", sm: "center"}}
                                                >
                                                    <Box>
                                                        <Typography variant="subtitle2">{review.userName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDisplayDate(review.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    <Rating value={review.rating} readOnly precision={0.5} size="small" />
                                                </Stack>
                                                {review.comment && (
                                                    <Typography variant="body2" sx={{mt: 1.5}}>
                                                        {review.comment}
                                                    </Typography>
                                                )}
                                                {review.photoDataUrl && (
                                                    <Box
                                                        component="img"
                                                        src={review.photoDataUrl}
                                                        alt={`Fotografija recenzije od ${review.userName}`}
                                                        sx={{
                                                            mt: 1.5,
                                                            width: "100%",
                                                            maxHeight: 220,
                                                            objectFit: "cover",
                                                            borderRadius: 1
                                                        }}
                                                    />
                                                )}
                                                {review.instructorResponse ? (
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            mt: 2,
                                                            p: 1.5,
                                                            bgcolor: "action.hover"
                                                        }}
                                                    >
                                                        <Typography variant="subtitle2">
                                                            {review.responseAuthorName ?? selectedLesson.course.instructorName} (instruktor)
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {review.responseAt ? formatDisplayDate(review.responseAt) : undefined}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{mt: 0.5}}>
                                                            {review.instructorResponse}
                                                        </Typography>
                                                    </Paper>
                                                ) : (
                                                    <Box sx={{mt: 2}}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Instruktor još nije odgovorio na ovaj komentar.
                                                        </Typography>
                                                        <Stack
                                                            direction={{xs: "column", sm: "row"}}
                                                            spacing={1}
                                                            sx={{mt: 1}}
                                                            alignItems={{xs: "stretch", sm: "center"}}
                                                        >
                                                            <TextField
                                                                size="small"
                                                                label="Odgovor instruktora (demo)"
                                                                value={reviewResponseDrafts[review.id] ?? ""}
                                                                onChange={event => handleReviewResponseChange(review.id, event.target.value)}
                                                                fullWidth
                                                                multiline
                                                                minRows={1}
                                                            />
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => handleReviewResponseSubmit(review.id)}
                                                                disabled={!reviewResponseDrafts[review.id]?.trim()}
                                                            >
                                                                Objavi odgovor
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Još nema recenzija. Budite prvi koji će podijeliti dojam o lekciji.
                                    </Typography>
                                )}

                                {lessonStarted ? (
                                    userReview ? (
                                        <Alert severity="success" sx={{mt: 3}}>
                                            Već ste ocijenili ovu lekciju. Hvala na povratnim informacijama!
                                        </Alert>
                                    ) : (
                                        <Box
                                            component="form"
                                            onSubmit={handleReviewSubmit}
                                            sx={{mt: 3, display: "flex", flexDirection: "column", gap: 2}}
                                        >
                                            <Typography variant="subtitle2">Podijelite svoje iskustvo</Typography>
                                            <Rating
                                                value={reviewRating ?? 0}
                                                onChange={(_, value) => setReviewRating(value)}
                                                precision={0.5}
                                            />
                                            <TextField
                                                label="Komentar (opcionalno)"
                                                multiline
                                                minRows={3}
                                                value={reviewComment}
                                                onChange={event => setReviewComment(event.target.value)}
                                                placeholder="Što vam se posebno svidjelo ili gdje vidite prostor za napredak?"
                                            />
                                            <Stack
                                                direction={{xs: "column", sm: "row"}}
                                                spacing={1}
                                                alignItems={{xs: "stretch", sm: "center"}}
                                            >
                                                <Button component="label" variant="outlined" size="small">
                                                    {reviewPhoto ? "Zamijeni fotografiju" : "Dodaj fotografiju"}
                                                    <input type="file" hidden accept="image/*" onChange={handleReviewPhotoChange} />
                                                </Button>
                                                {reviewPhoto && (
                                                    <Button variant="text" color="secondary" size="small" onClick={() => setReviewPhoto(null)}>
                                                        Ukloni fotografiju
                                                    </Button>
                                                )}
                                            </Stack>
                                            {reviewPhoto && (
                                                <Box
                                                    component="img"
                                                    src={reviewPhoto}
                                                    alt="Pregled priložene fotografije"
                                                    sx={{
                                                        width: "100%",
                                                        maxHeight: 220,
                                                        objectFit: "cover",
                                                        borderRadius: 1
                                                    }}
                                                />
                                            )}
                                            <Button type="submit" variant="contained" disabled={reviewRating === null}>
                                                Spremi recenziju
                                            </Button>
                                        </Box>
                                    )
                                ) : (
                                    <Alert severity="warning" sx={{mt: 3}}>
                                        Za ostavljanje ocjene najprije označite da ste započeli lekciju.
                                    </Alert>
                                )}
                            </Box>

                            <Divider sx={{my: 3}} />
                            <Box className="lesson-feedback-section">
                                <Typography variant="h6" gutterBottom>
                                    Pitanja i odgovori
                                </Typography>
                                {lessonQuestions.length > 0 ? (
                                    <Stack spacing={2}>
                                        {lessonQuestions.map(question => (
                                            <Paper key={question.id} variant="outlined" className="lesson-question-card" sx={{p: 2}}>
                                                <Typography variant="subtitle2">{question.userName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDisplayDate(question.createdAt)}
                                                </Typography>
                                                <Typography variant="body2" sx={{mt: 1.5}}>
                                                    {question.question}
                                                </Typography>
                                                {question.answers.length > 0 ? (
                                                    <Stack spacing={1.5} sx={{mt: 2}}>
                                                        {question.answers.map(answer => (
                                                            <Paper
                                                                key={answer.id}
                                                                variant="outlined"
                                                                sx={{p: 1.5, bgcolor: "action.hover"}}
                                                            >
                                                                <Typography variant="subtitle2">
                                                                    {answer.responderName} (instruktor)
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {formatDisplayDate(answer.createdAt)}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{mt: 0.5}}>
                                                                    {answer.message}
                                                                </Typography>
                                                            </Paper>
                                                        ))}
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary" sx={{mt: 2, display: "block"}}>
                                                        Instruktor još nije odgovorio na ovo pitanje.
                                                    </Typography>
                                                )}
                                                {question.answers.length === 0 && (
                                                    <Stack
                                                        direction={{xs: "column", sm: "row"}}
                                                        spacing={1}
                                                        sx={{mt: 2}}
                                                        alignItems={{xs: "stretch", sm: "center"}}
                                                    >
                                                        <TextField
                                                            size="small"
                                                            label="Odgovor instruktora (demo)"
                                                            value={answerDrafts[question.id] ?? ""}
                                                            onChange={event => handleAnswerChange(question.id, event.target.value)}
                                                            fullWidth
                                                            multiline
                                                            minRows={1}
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() => handleAnswerSubmit(question.id)}
                                                            disabled={!answerDrafts[question.id]?.trim()}
                                                        >
                                                            Objavi odgovor
                                                        </Button>
                                                    </Stack>
                                                )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Još nema pitanja. Postavite prvo pitanje i pomozite drugim polaznicima!
                                    </Typography>
                                )}

                                {lessonStarted ? (
                                    <Box
                                        component="form"
                                        onSubmit={handleQuestionSubmit}
                                        sx={{mt: 3, display: "flex", flexDirection: "column", gap: 2}}
                                    >
                                        <Typography variant="subtitle2">Imate pitanje za instruktora?</Typography>
                                        <TextField
                                            label="Pitanje"
                                            multiline
                                            minRows={2}
                                            value={questionText}
                                            onChange={event => setQuestionText(event.target.value)}
                                            placeholder="Npr. Koju zamjenu preporučujete za..."
                                        />
                                        <Button type="submit" variant="outlined" disabled={!questionText.trim()}>
                                            Objavi pitanje
                                        </Button>
                                    </Box>
                                ) : (
                                    <Alert severity="warning" sx={{mt: 3}}>
                                        Pitanja možete postavljati tek nakon što krenete pohađati lekciju.
                                    </Alert>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseLesson}>Zatvori</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}