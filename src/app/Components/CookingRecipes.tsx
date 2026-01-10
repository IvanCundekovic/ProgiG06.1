"use client";
import {Box, Grid, Card, CardContent, CardMedia, Typography, Button,
        Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Chip, Stack} from "@mui/material";
import {useState, useEffect} from "react";
import type {Lesson} from "../types/quiz";

type Recipe = {
    id: string;
    title: string;
    description: string | null;
    image: string;
    recipe: string;
    steps?: string[];
    ingredients?: Array<{name: string; amount: string}>;
    cuisine?: string | null;
    difficultyLevel?: string | null;
};

export default function CookingRecipes(){
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        async function fetchRecipes() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch("/api/courses");
                if (!response.ok) {
                    throw new Error("Greška pri učitavanju recepta");
                }
                const courses = await response.json();
                
                // Pretvori lekcije u recepte
                const allLessons: Recipe[] = [];
                courses.forEach((course: {lessons?: Lesson[]}) => {
                    if (course.lessons && Array.isArray(course.lessons)) {
                        course.lessons.forEach((lesson: Lesson) => {
                            if (lesson.published && lesson.ingredients) {
                                allLessons.push({
                                    id: lesson.id,
                                    title: lesson.title,
                                    description: lesson.description || null,
                                    image: lesson.videoUrl 
                                        ? `https://img.youtube.com/vi/${getYoutubeVideoId(lesson.videoUrl)}/maxresdefault.jpg`
                                        : "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500",
                                    recipe: lesson.content || lesson.description || "Recept detalji",
                                    steps: lesson.steps ? (typeof lesson.steps === 'string' ? JSON.parse(lesson.steps) : lesson.steps) : undefined,
                                    ingredients: lesson.ingredients,
                                    cuisine: lesson.cuisine || null,
                                    difficultyLevel: lesson.difficultyLevel || null,
                                });
                            }
                        });
                    }
                });

                // Ako nema lekcija, koristi fallback recepte
                if (allLessons.length === 0) {
                    setRecipes(getFallbackRecipes());
                } else {
                    setRecipes(allLessons);
                }
            } catch (err) {
                console.error("Error fetching recipes:", err);
                setError(err instanceof Error ? err.message : "Greška pri učitavanju");
                setRecipes(getFallbackRecipes());
            } finally {
                setLoading(false);
            }
        }

        fetchRecipes();
    }, []);

    function getYoutubeVideoId(url: string): string {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : "";
    }

    function getFallbackRecipes(): Recipe[] {
        return [
            {
                id: "1",
                title: "Spaghetti Carbonara",
                description: "Classic Italian pasta with eggs, cheese, pancetta, and pepper.",
                image: "https://images.unsplash.com/photo-1574969903809-3f7a1668ceb0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
                recipe: "1. Kuvajte špagete u slanoj vodi\n2. Pržite pancettu\n3. Miješajte jaja i sir\n4. Kombinirajte sve i poslužite",
                steps: [
                    "Kuvajte špagete u slanoj vodi",
                    "Pržite pancettu dok ne postane hrskava",
                    "Miješajte jaja i sir u zdjeli",
                    "Kombinirajte sve i poslužite toplo"
                ],
                ingredients: [
                    {name: "Špagete", amount: "400g"},
                    {name: "Pancetta", amount: "200g"},
                    {name: "Jaja", amount: "4 kom"},
                    {name: "Parmezan", amount: "100g"}
                ],
            },
            {
                id: "2",
                title: "Chicken Curry",
                description: "A flavorful and spicy curry with tender chicken pieces.",
                image: "https://plus.unsplash.com/premium_photo-1661419883163-bb4df1c10109?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
                recipe: "1. Marinirati piletinu\n2. Pržiti začine\n3. Dodati piletinu i kuhati\n4. Poslužiti s rižom",
            },
        ];
    }

    const handleOpen = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setSelectedRecipe(null);
    };

    if (loading) {
        return (
            <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px"}}>
                <CircularProgress />
            </Box>
        );
    }

    return(
        <Box>
            <Typography variant="h5" gutterBottom>
                Featured recipes
            </Typography>

            {error && (
                <Alert severity="warning" sx={{mb: 2}}>
                    {error} (Prikazujem primjer recepta)
                </Alert>
            )}

            {recipes.length === 0 ? (
                <Alert severity="info">
                    Trenutno nema dostupnih recepta. Provjerite kasnije!
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {recipes.map((recipe) => (
                        <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={recipe.id}> 
                            <Card sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                borderRadius: 3,
                                overflow: "hidden",
                                transition: "transform 0.2s ease",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                },
                            }}>
                                <CardMedia 
                                    component="img" 
                                    height="160" 
                                    image={recipe.image} 
                                    alt={recipe.title}
                                    sx={{objectFit: "cover"}}
                                />
                                <CardContent sx={{flexGrow: 1}}>
                                    <Typography variant="h6" gutterBottom>
                                        {recipe.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        {recipe.description || "Nema opisa"}
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{mb: 2}}>
                                        {recipe.cuisine && (
                                            <Chip label={recipe.cuisine} size="small" variant="outlined" />
                                        )}
                                        {recipe.difficultyLevel && (
                                            <Chip label={recipe.difficultyLevel} size="small" color="primary" />
                                        )}
                                    </Stack>
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        onClick={() => handleOpen(recipe)}
                                        fullWidth
                                    >
                                        View recipe
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                {selectedRecipe && (
                    <>
                        <DialogTitle>
                            {selectedRecipe.title}
                        </DialogTitle>
                        <DialogContent dividers>
                            {selectedRecipe.description && (
                                <Typography variant="body1" paragraph>
                                    {selectedRecipe.description}
                                </Typography>
                            )}

                            {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                                <Box sx={{mb: 3}}>
                                    <Typography variant="h6" gutterBottom>
                                        Sastojci:
                                    </Typography>
                                    <Box component="ul" sx={{pl: 2}}>
                                        {selectedRecipe.ingredients.map((ing, idx) => (
                                            <li key={idx}>
                                                <Typography variant="body2">
                                                    {ing.name} - {ing.amount}
                                                </Typography>
                                            </li>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {selectedRecipe.steps && selectedRecipe.steps.length > 0 ? (
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Koraci:
                                    </Typography>
                                    <Box component="ol" sx={{pl: 2}}>
                                        {selectedRecipe.steps.map((step, idx) => (
                                            <li key={idx}>
                                                <Typography variant="body2" paragraph>
                                                    {step}
                                                </Typography>
                                            </li>
                                        ))}
                                    </Box>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{whiteSpace: "pre-line"}}>
                                    {selectedRecipe.recipe}
                                </Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Zatvori</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    )
}