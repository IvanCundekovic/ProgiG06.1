"use client";

import {useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Stack
} from "@mui/material";
import QuizDialog from "./QuizDialog";
import type {Quiz} from "@/app/types/quiz";
import {useRouter} from "next/navigation";

type LessonQuiz = {
    id: string;
    lessonTitle: string;
    courseId: string;
    courseTitle: string;
    description: string;
    quiz: Quiz;
};

const lessonQuizzes: LessonQuiz[] = [
    {
        id: "lesson-1",
        lessonTitle: "Svježa tjestenina od nule",
        courseId: "course-1",
        courseTitle: "Osnove mediteranske kuhinje",
        description:
            "Ponovite ključne korake pripreme svježe tjestenine nakon pogledane video lekcije.",
        quiz: {
            id: "quiz-1",
            title: "Svježa tjestenina od nule",
            description: "Provjera znanja o tehnici pripreme svježe tjestenine.",
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
                    text: "Što je ključno za sprječavanje lijepljenja svježe tjestenine?",
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
        lessonTitle: "Savršeni domaći pesto",
        courseId: "course-1",
        courseTitle: "Osnove mediteranske kuhinje",
        description: "Provjerite poznavanje sastojaka i tehnike pripreme tradicionalnog pesta.",
        quiz: {
            id: "quiz-2",
            title: "Savršeni domaći pesto",
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
                        "Zamrzavanje sastojaka"
                    ],
                    correctAnswer: 1
                }
            ]
        }
    },
    {
        id: "lesson-3",
        lessonTitle: "Pho juha u 30 minuta",
        courseId: "course-2",
        courseTitle: "Azijski street food kod kuće",
        description: "Testirajte znanje o ključnim sastojcima i začinima Pho juhe.",
        quiz: {
            id: "quiz-3",
            title: "Pho juha u 30 minuta",
            description: "Provjera znanja o pripremi Pho juhe.",
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
                    options: ["Pšenični rezanci", "Rižini rezanci", "Udon rezanci", "Soba rezanci"],
                    correctAnswer: 1
                }
            ]
        }
    },
    {
        id: "lesson-4",
        lessonTitle: "Japanske gyoze",
        courseId: "course-2",
        courseTitle: "Azijski street food kod kuće",
        description: "Provjerite tehnike oblikovanja i pečenja tradicionalnih gyoza.",
        quiz: {
            id: "quiz-4",
            title: "Japanske gyoze",
            description: "Provjera znanja o pripremi japanskih gyoza.",
            createdAt: new Date("2024-03-22"),
            questions: [
                {
                    id: "question-8",
                    text: "Što je ključno za postizanje hrskavog dna gyoza?",
                    options: [
                        "Dodavanje šećera",
                        "Parenje i prženje kombinirano",
                        "Korištenje kokosovog ulja",
                        "Pečenje u pećnici"
                    ],
                    correctAnswer: 1
                },
                {
                    id: "question-9",
                    text: "Koji je tradicionalni oblik gyoza?",
                    options: ["Trokut", "Polumjesec", "Krug", "Kvadrat"],
                    correctAnswer: 1
                }
            ]
        }
    },
    {
        id: "lesson-5",
        lessonTitle: "Burger od leće",
        courseId: "course-3",
        courseTitle: "Plant-based specijaliteti",
        description: "Ponovite ključne sastojke i tehniku pripreme burgera od leće.",
        quiz: {
            id: "quiz-5",
            title: "Burger od leće",
            description: "Provjera znanja o biljnom burgeru od leće.",
            createdAt: new Date("2024-04-05"),
            questions: [
                {
                    id: "question-10",
                    text: "Koji sastojak pomaže vezati smjesu za burger od leće?",
                    options: ["Lanene sjemenke", "Šećer", "Maslac", "Sojino mlijeko"],
                    correctAnswer: 0
                },
                {
                    id: "question-11",
                    text: "Što daje dimljenu aromu burgeru od leće?",
                    options: ["Dimljena paprika", "Cimet", "Vanilija", "Kumin"],
                    correctAnswer: 0
                }
            ]
        }
    }
];

export default function Extra() {
    const [selectedLessonQuiz, setSelectedLessonQuiz] = useState<LessonQuiz | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();

    const handleStartQuiz = (lessonQuiz: LessonQuiz) => {
        setSelectedLessonQuiz(lessonQuiz);
        setDialogOpen(true);
    };

    const handleCloseQuiz = () => {
        setDialogOpen(false);
        setSelectedLessonQuiz(null);
    };

    return (
        <Box className="extra-container">
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Kvizovi po video lekcijama
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Odaberite kviz i provjerite znanje stečeno kroz video lekcije.
                    </Typography>
                </Box>
                <Button variant="outlined" color="primary" onClick={() => router.push("/quiz-history")}>
                    Povijest kvizova
                </Button>
            </Box>

            <Box className="extra-quiz-grid">
                {lessonQuizzes.map((lessonQuiz) => (
                    <Card key={lessonQuiz.id} className="extra-quiz-card">
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={1}
                            >
                                <Chip label={lessonQuiz.courseTitle} color="secondary" size="small" />
                                <Chip label="Kviz" color="primary" size="small" />
                            </Stack>

                            <Typography variant="h6" sx={{mt: 2}} gutterBottom>
                                {lessonQuiz.quiz.title}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Lekcija: {lessonQuiz.lessonTitle}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                                {lessonQuiz.description}
                            </Typography>

                            <Box className="extra-quiz-actions">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleStartQuiz(lessonQuiz)}
                                >
                                    Pokreni kviz
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {selectedLessonQuiz && (
                <QuizDialog
                    open={isDialogOpen}
                    onClose={handleCloseQuiz}
                    quiz={selectedLessonQuiz.quiz}
                    lessonId={selectedLessonQuiz.id}
                    lessonTitle={selectedLessonQuiz.lessonTitle}
                    courseId={selectedLessonQuiz.courseId}
                    courseTitle={selectedLessonQuiz.courseTitle}
                />
            )}
        </Box>
    );
}