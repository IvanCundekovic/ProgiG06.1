"use client";

import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Rating,
    Typography,
    Box,
    Alert,
    CircularProgress,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

interface InstructorReviewDialogProps {
    open: boolean;
    onClose: () => void;
    instructorId: string;
    instructorName: string;
    onReviewSubmitted?: () => void;
}

export default function InstructorReviewDialog({
    open,
    onClose,
    instructorId,
    instructorName,
    onReviewSubmitted,
}: InstructorReviewDialogProps) {
    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!rating || rating < 1 || rating > 5) {
            setError("Molimo odaberite ocjenu (1-5 zvjezdica)");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/instructor-reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    instructorId,
                    rating,
                    comment: comment.trim() || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Greška pri slanju recenzije");
            }

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                if (onReviewSubmitted) onReviewSubmitted();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri slanju recenzije");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setRating(0);
            setComment("");
            setError(null);
            setSuccess(false);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Ocijenite instruktora</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Instruktor: <strong>{instructorName}</strong>
                    </Typography>

                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Typography component="legend" variant="body2" gutterBottom>
                            Ocjena (1-5 zvjezdica)
                        </Typography>
                        <Rating
                            name="instructor-rating"
                            value={rating}
                            onChange={(_, newValue) => {
                                setRating(newValue);
                                setError(null);
                            }}
                            size="large"
                            icon={<StarIcon fontSize="inherit" />}
                            emptyIcon={<StarIcon fontSize="inherit" />}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Komentar (opcionalno)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Podijelite svoje iskustvo s ovim instruktorom..."
                        sx={{ mt: 2 }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Recenzija uspješno poslana!
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={submitting}>
                    Odustani
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting || !rating || rating < 1}
                    startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                    {submitting ? "Šalje se..." : "Pošalji recenziju"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
