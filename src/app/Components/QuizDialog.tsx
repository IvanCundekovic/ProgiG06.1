"use client";
import {useState, useEffect} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    CircularProgress,
    Alert
} from "@mui/material";
import {Quiz, QuizAnswer, QuizResult} from "../types/quiz";
import "../styles.css";

interface QuizDialogProps {
    open: boolean;
    onClose: () => void;
    quiz: Quiz;
    lessonTitle: string;
}

export default function QuizDialog({
    open,
    onClose,
    quiz,
    lessonTitle
}: QuizDialogProps) {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [isAbandoned, setIsAbandoned] = useState(false);

    // Reset state kada se otvori dialog
    useEffect(() => {
        if (open) {
            setAnswers({});
            setCurrentQuestionIndex(0);
            setIsSubmitting(false);
            setError(null);
            setShowResults(false);
            setResult(null);
            setIsAbandoned(false);
        }
    }, [open]);

    const handleAnswerChange = (questionId: string, answerIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Provjeri da li su sva pitanja odgovorena
        const unansweredQuestions = quiz.questions.filter(q => answers[q.id] === undefined);
        if (unansweredQuestions.length > 0) {
            setError(`Molimo odgovorite na sva pitanja. Neodgovoreno pitanja: ${unansweredQuestions.length}`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const quizAnswers: QuizAnswer[] = quiz.questions.map(q => ({
                questionId: q.id,
                selectedAnswer: answers[q.id]
            }));

            // Predaj kviz preko API-ja
            const response = await fetch("/api/quiz-results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quizId: quiz.id,
                    answers: quizAnswers,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Greška pri predaji kviza");
            }

            const quizResult = await response.json();
            
            // Transformacija datuma
            const transformedResult: QuizResult = {
                ...quizResult,
                completedAt: new Date(quizResult.completedAt),
            };

            setResult(transformedResult);
            setShowResults(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri spremanju rezultata");
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setError(null);
        setIsSubmitting(false);
        handleSubmit();
    };

    const handleClose = () => {
        if (!showResults && Object.keys(answers).length > 0) {
            // Korisnik napušta kviz prije završetka
            setIsAbandoned(true);
            // Rezultat se ne sprema (prema specifikaciji)
        }
        onClose();
    };

    const handleCloseAfterResults = () => {
        setShowResults(false);
        setResult(null);
        onClose();
    };

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const allAnswered = quiz.questions.every(q => answers[q.id] !== undefined);

    if (showResults && result) {
        return (
            <Dialog open={open} onClose={handleCloseAfterResults} maxWidth="sm" fullWidth>
                <DialogTitle>Rezultati kviza</DialogTitle>
                <DialogContent className="quiz-result-container">
                    <Typography variant="h6" gutterBottom>
                        {quiz.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                        {lessonTitle}
                    </Typography>
                    <Typography className="quiz-result-score">
                        {result.score} / {result.totalQuestions}
                    </Typography>
                    <Typography className="quiz-result-percentage">
                        {result.percentage}%
                    </Typography>
                    <Box sx={{mt: 3}}>
                        {quiz.questions.map((question, index) => {
                            const userAnswer = result.answers.find(a => a.questionId === question.id);
                            const isCorrect = userAnswer?.selectedAnswer === question.correctAnswer;
                            return (
                                <Box key={question.id} sx={{mb: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2}}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Pitanje {index + 1}: {question.text}
                                    </Typography>
                                    <Typography variant="body2" color={isCorrect ? "success.main" : "error.main"}>
                                        {isCorrect ? "✓ Točno" : "✗ Netočno"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Vaš odgovor: {question.options[userAnswer?.selectedAnswer || 0]}
                                    </Typography>
                                    {!isCorrect && (
                                        <Typography variant="caption" color="success.main" display="block">
                                            Točan odgovor: {question.options[question.correctAnswer]}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions className="quiz-actions">
                    <Button onClick={handleCloseAfterResults} variant="contained" color="primary">
                        Zatvori
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    if (isAbandoned) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Kviz napušten</DialogTitle>
                <DialogContent>
                    <Typography>
                        Napustili ste kviz prije završetka. Rezultat se ne sprema.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Zatvori</Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {quiz.title}
                <Typography variant="caption" display="block" color="text.secondary">
                    Pitanje {currentQuestionIndex + 1} od {quiz.questions.length}
                </Typography>
            </DialogTitle>
            <DialogContent className="quiz-dialog-content">
                {error && (
                    <Alert severity="error" sx={{mb: 2}} className="quiz-error-message">
                        {error}
                        {error.includes("Network error") && (
                            <Box className="quiz-retry-container">
                                <Button
                                    onClick={handleRetry}
                                    variant="contained"
                                    color="primary"
                                    className="quiz-retry-button"
                                    disabled={isSubmitting}
                                >
                                    Pokušaj ponovo
                                </Button>
                            </Box>
                        )}
                    </Alert>
                )}

                <Box className="quiz-question-container">
                    <Typography className="quiz-question-text" variant="h6" gutterBottom>
                        {currentQuestion.text}
                    </Typography>
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={answers[currentQuestion.id] !== undefined ? answers[currentQuestion.id].toString() : ""}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                        >
                            {currentQuestion.options.map((option, index) => (
                                <FormControlLabel
                                    key={index}
                                    value={index.toString()}
                                    control={<Radio />}
                                    label={option}
                                    className={`quiz-option-button ${answers[currentQuestion.id] === index ? 'selected' : ''}`}
                                    sx={{
                                        mb: 1,
                                        p: 1,
                                        border: "2px solid #e0e0e0",
                                        borderRadius: 2,
                                        "&:hover": {
                                            backgroundColor: "#f5f5f5",
                                            borderColor: "#1976d2"
                                        },
                                        "&.selected": {
                                            backgroundColor: "#e3f2fd",
                                            borderColor: "#1976d2"
                                        }
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Box>

                {/* Progress indicator */}
                <Box sx={{mt: 3, mb: 2}}>
                    <Typography variant="caption" color="text.secondary">
                        Odgovoreno: {Object.keys(answers).length} / {quiz.questions.length}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions className="quiz-actions">
                <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    Prethodno
                </Button>
                <Box sx={{flex: 1}} />
                {isLastQuestion ? (
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || !allAnswered}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : "Predaj odgovore"}
                    </Button>
                ) : (
                    <Button onClick={handleNext} variant="contained" color="primary">
                        Sljedeće
                    </Button>
                )}
                <Button onClick={handleClose} color="inherit">
                    Odustani
                </Button>
            </DialogActions>
        </Dialog>
    );
}

