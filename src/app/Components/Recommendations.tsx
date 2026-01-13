"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    useTheme,
} from "@mui/material";
import { useSession } from "next-auth/react";
import StarIcon from "@mui/icons-material/Star";

interface Recommendation {
    id: string;
    title: string;
    description: string | null;
    instructorName: string;
    score: number;
    lessonsCount: number;
}

export default function Recommendations() {
    const { data: session } = useSession();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            loadRecommendations();
        } else {
            setLoading(false);
            setError(null);
        }
    }, [session]);

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/recommendations");
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Morate biti prijavljeni da biste vidjeli preporuke");
                }
                throw new Error("Greška pri učitavanju preporuka");
            }
            const data = await response.json();
            setRecommendations(data.recommendations || []);
        } catch (err) {
            console.error("Error loading recommendations:", err);
            setError(err instanceof Error ? err.message : "Greška pri učitavanju preporuka");
        } finally {
            setLoading(false);
        }
    };

    if (!session?.user) {
        return (
            <Paper 
                sx={{ 
                    p: 3,
                    bgcolor: isDarkMode ? '#2a2a2a' : 'background.paper',
                    border: isDarkMode ? '1px solid #444' : 'none'
                }}
            >
                <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ color: isDarkMode ? '#ffffff' : 'text.primary' }}
                >
                    Personalizirane preporuke
                </Typography>
                <Typography 
                    variant="body2" 
                    paragraph
                    sx={{ color: isDarkMode ? '#b0b0b0' : 'text.secondary' }}
                >
                    Prijavite se da biste vidjeli personalizirane preporuke temeljene na vašim preferencijama i razini vještine.
                </Typography>
            </Paper>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (recommendations.length === 0) {
        return (
            <Paper 
                sx={{ 
                    p: 3,
                    bgcolor: isDarkMode ? '#2a2a2a' : 'background.paper',
                    border: isDarkMode ? '1px solid #444' : 'none'
                }}
            >
                <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ color: isDarkMode ? '#ffffff' : 'text.primary' }}
                >
                    Personalizirane preporuke
                </Typography>
                <Typography 
                    variant="body2"
                    sx={{ color: isDarkMode ? '#b0b0b0' : 'text.secondary' }}
                >
                    Nema dostupnih preporuka. Ažurirajte svoj profil da biste dobili personalizirane preporuke.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography 
                variant="h6" 
                gutterBottom
                sx={{ color: isDarkMode ? '#ffffff' : 'text.primary' }}
            >
                Personalizirane preporuke za vas
            </Typography>
            <Typography 
                variant="body2" 
                sx={{ 
                    mb: 3,
                    color: isDarkMode ? '#b0b0b0' : 'text.secondary'
                }}
            >
                Preporuke temeljene na vašim preferencijama i razini vještine
            </Typography>

            <Stack spacing={2}>
                {recommendations.map((rec) => (
                    <Card 
                        key={rec.id}
                        sx={{
                            bgcolor: isDarkMode ? '#2a2a2a' : 'background.paper',
                            border: isDarkMode ? '1px solid #444' : 'none'
                        }}
                    >
                        <CardActionArea>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography 
                                            variant="h6" 
                                            gutterBottom
                                            sx={{ color: isDarkMode ? '#ffffff' : 'text.primary' }}
                                        >
                                            {rec.title}
                                        </Typography>
                                        {rec.description && (
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    mb: 1,
                                                    color: isDarkMode ? '#b0b0b0' : 'text.secondary'
                                                }}
                                            >
                                                {rec.description}
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Chip 
                                                label={`Instruktor: ${rec.instructorName}`} 
                                                size="small"
                                                sx={{
                                                    bgcolor: isDarkMode ? '#3a3a3a' : undefined,
                                                    color: isDarkMode ? '#ffffff' : undefined
                                                }}
                                            />
                                            <Chip 
                                                label={`${rec.lessonsCount} lekcija`} 
                                                size="small"
                                                sx={{
                                                    bgcolor: isDarkMode ? '#3a3a3a' : undefined,
                                                    color: isDarkMode ? '#ffffff' : undefined
                                                }}
                                            />
                                            <Chip
                                                icon={<StarIcon />}
                                                label={`Relevantnost: ${rec.score.toFixed(0)}`}
                                                color="primary"
                                                size="small"
                                            />
                                        </Stack>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}