"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Card,
    Divider,
    Chip,
    Stack,
    AppBar,
    Toolbar,
    Container,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface QuizQuestion {
    text: string;
    options: string[];
    correctAnswer: number;
}

interface Lesson {
    id: string;
    title: string;
    courseTitle: string;
}

export default function CreateQuiz() {
    const router = useRouter();
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [lessonId, setLessonId] = useState("");
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        { text: "", options: ["", "", "", ""], correctAnswer: 0 }
    ]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingLessons, setLoadingLessons] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadLessons();
    }, []);

    const loadLessons = async () => {
        try {
            setLoadingLessons(true);
            const response = await fetch("/api/lessons");
            if (!response.ok) throw new Error("Greska pri ucitavanju lekcija");
            const data = await response.json();
            setLessons(data);
        } catch (err) {
            console.error("Error loading lessons:", err);
            setError("Nije moguce ucitati lekcije");
        } finally {
            setLoadingLessons(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: string | number | string[]) => {
        const updated = [...questions];
        if (field === "correctAnswer" && typeof value === "number") {
            updated[index].correctAnswer = value;
        } else if (field === "text" && typeof value === "string") {
            updated[index].text = value;
        } else if (field === "options" && Array.isArray(value)) {
            updated[index].options = value;
        }
        setQuestions(updated);
    };

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        const updated = [...questions];
        updated[questionIndex].options[optionIndex] = value;
        setQuestions(updated);
    };

    const validateForm = (): boolean => {
        if (!title.trim()) {
            setError("Naziv kviza je obavezan");
            return false;
        }

        if (questions.length === 0) {
            setError("Kviz mora imati barem jedno pitanje");
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                setError(`Pitanje ${i + 1} je prazno`);
                return false;
            }
            if (q.options.some(opt => !opt.trim())) {
                setError(`Pitanje ${i + 1} ima prazne opcije`);
                return false;
            }
            if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                setError(`Pitanje ${i + 1} nema oznacen tocan odgovor`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccess(false);

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await fetch("/api/quizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    lessonId: lessonId || null,
                    questions: questions.map(q => ({
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                    })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Greska pri kreiranju kviza");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/Homepage");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greska pri kreiranju kviza");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "#df0000ff" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <IconButton color="inherit" onClick={() => router.back()}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            Kreiraj novi kviz
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    background: "linear-gradient(135deg, #e2e2e2ff, #818380)",
                    minHeight: "calc(100vh - 64px)",
                }}
            >
                <Container maxWidth="md">
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
                            Kviz uspjesno kreiran! Preusmjeravanje...
                        </Alert>
                    )}

                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
                        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                            Osnovne informacije
                        </Typography>

                        <Stack spacing={3}>
                            <TextField
                                label="Naziv kviza"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                fullWidth
                                required
                                variant="outlined"
                            />

                            <TextField
                                label="Opis kviza"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                            />

                            <FormControl fullWidth>
                                <InputLabel>Lekcija (opcionalno)</InputLabel>
                                <Select
                                    value={lessonId}
                                    onChange={(e) => setLessonId(e.target.value)}
                                    label="Lekcija (opcionalno)"
                                    disabled={loadingLessons}
                                >
                                    <MenuItem value="">
                                        <em>Nema povezanu lekciju</em>
                                    </MenuItem>
                                    {lessons.map((lesson) => (
                                        <MenuItem key={lesson.id} value={lesson.id}>
                                            {lesson.title} ({lesson.courseTitle})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                Pitanja
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={addQuestion}
                                sx={{
                                    background: "#df0000ff",
                                    "&:hover": { background: "#b00000" },
                                }}
                            >
                                Dodaj pitanje
                            </Button>
                        </Box>

                        <Stack spacing={3}>
                            {questions.map((question, qIndex) => (
                                <Card
                                    key={qIndex}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        boxShadow: 2,
                                        border: "2px solid #e0e0e0",
                                    }}
                                >
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Chip label={`Pitanje ${qIndex + 1}`} color="primary" />
                                        {questions.length > 1 && (
                                            <IconButton
                                                onClick={() => removeQuestion(qIndex)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <TextField
                                        label="Tekst pitanja"
                                        value={question.text}
                                        onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                                        fullWidth
                                        required
                                        sx={{ mb: 3 }}
                                    />

                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                        Opcije odgovora:
                                    </Typography>

                                    <Stack spacing={2}>
                                        {question.options.map((option, oIndex) => (
                                            <Box key={oIndex} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                                <TextField
                                                    label={`Opcija ${oIndex + 1}`}
                                                    value={option}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    fullWidth
                                                    required
                                                />
                                                <Button
                                                    variant={question.correctAnswer === oIndex ? "contained" : "outlined"}
                                                    color={question.correctAnswer === oIndex ? "success" : "primary"}
                                                    onClick={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                                                    sx={{ minWidth: 120 }}
                                                >
                                                    {question.correctAnswer === oIndex ? "Tocno ✓" : "Odaberi"}
                                                </Button>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Card>
                            ))}
                        </Stack>

                        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Button
                                variant="outlined"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Odustani
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{
                                    background: "#df0000ff",
                                    "&:hover": { background: "#b00000" },
                                    minWidth: 150,
                                }}
                            >
                                {loading ? <CircularProgress size={24} /> : "Kreiraj kviz"}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}