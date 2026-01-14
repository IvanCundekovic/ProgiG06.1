"use client";

import {useState, useEffect} from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Stack,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import QuizDialog from "./QuizDialog";
import Recommendations from "./Recommendations";
import type {Quiz} from "@/app/types/quiz";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";

type LessonQuiz = {
    id: string;
    lessonTitle: string;
    courseId: string;
    courseTitle: string;
    description: string;
    quiz: Quiz;
};

export default function Extra() {
    const [selectedLessonQuiz, setSelectedLessonQuiz] = useState<LessonQuiz | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const {data: session} = useSession();

    const canCreateQuiz = session?.user?.role === "ADMINISTRATOR" || session?.user?.role === "INSTRUCTOR";

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/quizzes");
            if (!response.ok) {
                throw new Error("Greska pri ucitavanju kvizova");
            }
            const data = await response.json();
            setQuizzes(data);
        } catch (err) {
            console.error("Error loading quizzes:", err);
            setError(err instanceof Error ? err.message : "Greska pri ucitavanju kvizova");
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quiz: Quiz) => {
        const lessonQuiz: LessonQuiz = {
            id: quiz.id,
            lessonTitle: "Lekcija",
            courseId: "",
            courseTitle: "",
            description: quiz.description || "",
            quiz: quiz,
        };
        setSelectedLessonQuiz(lessonQuiz);
        setDialogOpen(true);
    };

    const handleCloseQuiz = () => {
        setDialogOpen(false);
        setSelectedLessonQuiz(null);
    };

    return (
        <Box className="extra-container">
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{mb: 3}}>
                <Tab label="Kvizovi" />
                <Tab label="Preporuke" />
            </Tabs>

            {activeTab === 0 && (
                <>
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Kvizovi
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Odaberite kviz i provjerite svoje znanje.
                            </Typography>
                        </Box>
                        <Stack direction="column" spacing={1} alignItems="flex-end">
                            {canCreateQuiz && (
                                <Button 
                                    variant="contained" 
                                    color="error" 
                                    startIcon={<AddIcon />}
                                    onClick={() => router.push("/quiz-create")}
                                >
                                    Kreiraj kviz
                                </Button>
                            )}
                            <Button variant="outlined" color="primary" onClick={() => router.push("/quiz-history")}>
                                Povijest kvizova
                            </Button>
                        </Stack>
                    </Box>

                    {loading ? (
                        <Box sx={{display: "flex", justifyContent: "center", p: 4}}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    ) : quizzes.length === 0 ? (
                        <Box sx={{textAlign: "center", py: 8}}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Nema dostupnih kvizova
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {canCreateQuiz ? "Kliknite 'Kreiraj kviz' za dodavanje novog kviza." : "Kvizovi ce biti dostupni uskoro."}
                            </Typography>
                        </Box>
                    ) : (
                        <Box className="extra-quiz-grid">
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                {quizzes.map((quiz) => (
                                    <Box
                                        key={quiz.id}
                                        sx={{
                                            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
                                        }}
                                    >
                                        <Card className="extra-quiz-card">
                                            <CardContent sx={{flexGrow: 1}}>
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    spacing={1}
                                                >
                                                    <Chip label="Kviz" color="primary" size="small" />
                                                    <Chip label={`${quiz.questions.length} pitanja`} size="small" />
                                                </Stack>

                                                <Typography variant="h6" sx={{mt: 2}} gutterBottom>
                                                    {quiz.title}
                                                </Typography>

                                                {quiz.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                                                        {quiz.description}
                                                    </Typography>
                                                )}

                                                <Box className="extra-quiz-actions" sx={{mt: 2}}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleStartQuiz(quiz)}
                                                        fullWidth
                                                    >
                                                        Pokreni kviz
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {selectedLessonQuiz && (
                        <QuizDialog
                            open={isDialogOpen}
                            onClose={handleCloseQuiz}
                            quiz={selectedLessonQuiz.quiz}
                            lessonTitle={selectedLessonQuiz.lessonTitle}
                        />
                    )}
                </>
            )}

            {activeTab === 1 && (
                <Box>
                    <Recommendations />
                </Box>
            )}
        </Box>
    );
}