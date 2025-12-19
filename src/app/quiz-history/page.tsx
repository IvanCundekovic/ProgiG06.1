"use client";
import {useState, useEffect} from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    AppBar,
    Toolbar,
    Container,
    CircularProgress
} from "@mui/material";
import {useRouter} from "next/navigation";
import {QuizResult} from "../types/quiz";
import "../styles.css";
import {useSession} from "next-auth/react";

export default function QuizHistory() {
    const router = useRouter();
    const {data: session} = useSession();
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResults = async () => {
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch("/api/quiz-results");
                if (!response.ok) {
                    throw new Error("Greška pri učitavanju rezultata");
                }
                const data = await response.json();
                const convertedResults = data.map((result: QuizResult) => ({
                    ...result,
                    completedAt: new Date(result.completedAt)
                }));
                setResults(convertedResults);
            } catch (error) {
                console.error("Error loading quiz results:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, [session]);

    const handleBack = () => {
        router.push("/Homepage");
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString("hr-HR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <Box sx={{display: "flex", flexDirection: "column", minHeight: "100vh"}}>
            <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1, background: "#df0000ff"}}>
                <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
                    <Typography variant="h6" noWrap>
                        Povijest rezultata kvizova
                    </Typography>
                    <Button color="inherit" variant="outlined" onClick={handleBack}>
                        Natrag na početnu
                    </Button>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    background: "linear-gradient(135deg, #e2e2e2ff, #818380)",
                    color: "black",
                    minHeight: "calc(100vh - 64px)"
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h4" gutterBottom sx={{mb: 4}}>
                        Povijest rezultata
                    </Typography>

                    {loading ? (
                        <Box className="quiz-loading" sx={{display: "flex", justifyContent: "center", p: 4}}>
                            <CircularProgress />
                        </Box>
                    ) : results.length === 0 ? (
                        <Box className="quiz-empty-state">
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Nemate još riješenih kvizova
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Riješite kvizove u lekcijama da biste vidjeli svoje rezultate ovdje.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBack}
                                sx={{mt: 3}}
                            >
                                Vrati se na lekcije
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            {results
                                .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
                                .map((result) => (
                                    <Paper
                                        key={result.id}
                                        className="quiz-history-item"
                                        sx={{
                                            mb: 2,
                                            p: 3,
                                            borderRadius: 2,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                                        }}
                                    >
                                        <Box className="quiz-history-header">
                                            <Box>
                                                <Typography variant="h6" className="quiz-history-title" gutterBottom>
                                                    {result.quizTitle}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Lekcija: {result.lessonTitle}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Kurs: {result.courseTitle}
                                                </Typography>
                                            </Box>
                                            <Box sx={{textAlign: "right"}}>
                                                <Typography
                                                    variant="h4"
                                                    className="quiz-history-score"
                                                    color="primary"
                                                >
                                                    {result.score}/{result.totalQuestions}
                                                </Typography>
                                                <Typography variant="h6" color="text.secondary">
                                                    {result.percentage}%
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box className="quiz-history-meta" sx={{mt: 2}}>
                                            <Typography variant="caption" className="quiz-history-date">
                                                Riješeno: {formatDate(result.completedAt)}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                display="block"
                                                color={result.isCompleted ? "success.main" : "warning.main"}
                                                sx={{mt: 1}}
                                            >
                                                Status: {result.isCompleted ? "Dovršeno" : "Nedovršeno"}
                                            </Typography>
                                        </Box>
                                        {/* Detalji odgovora */}
                                        <Box sx={{mt: 2, pt: 2, borderTop: "1px solid #e0e0e0"}}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Detalji odgovora:
                                            </Typography>
                                            {result.answers.map((answer, index) => {
                                                {/* Pitanja se učitavaju iz QuizResult.answers JSON-a */}
                                                return (
                                                    <Typography
                                                        key={index}
                                                        variant="caption"
                                                        display="block"
                                                        color="text.secondary"
                                                        sx={{mt: 0.5}}
                                                    >
                                                        Pitanje {index + 1}: Odgovor {answer.selectedAnswer + 1}
                                                    </Typography>
                                                );
                                            })}
                                        </Box>
                                    </Paper>
                                ))}
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
}

