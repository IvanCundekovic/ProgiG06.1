"use client";
import {Box, Grid, Card, CardContent, CardMedia, Typography, Button,
        Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import {useState} from "react";

type Recipe = {
    id: number;
    title: string;
    description: string;
    image: string;
    recipe: string;
};

export default function CookingRecipes(){
    const recipes: Recipe[] = [
        {
            id: 1,
            title: "Spaghetti Carbonara",
            description: "Classic Italian pasta with eggs, cheese, pancetta, and pepper.",
            image: "https://images.unsplash.com/photo-1574969903809-3f7a1668ceb0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
            recipe: "Recept 1 ce se dodati naknadno",
        },
        {
            id: 2,
            title: "Chicken Curry",
            description: "A flavorful and spicy curry with tender chicken pieces.",
            image: "https://plus.unsplash.com/premium_photo-1661419883163-bb4df1c10109?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
            recipe: "Recept 2 ce se dodati naknadno",
        },
        {
            id: 3,
            title: "Avocado Toast",
            description: "Crispy toast topped with creamy avocado and chili flakes.",
            image: "https://plus.unsplash.com/premium_photo-1676106624038-81d1e17573db?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
            recipe: "Recept 3 ce se dodati naknadno",
        },
        {
            id: 4,
            title: "Chocolate Cake",
            description: "Rich and moist chocolate cake topped with ganache.",
            image: "https://plus.unsplash.com/premium_photo-1715015439764-1e8d37d5c6c9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=388",
            recipe: "Recept 4 ce se dodati naknadno",
        },
    ];

    const [open, setOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState <Recipe | null> (null);

    const handleOpen = (recipe:Recipe) => {
        setSelectedRecipe(recipe);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false)
        setSelectedRecipe(null)
    };

    return(
        <Box>
            <Typography variant = "h5" gutterBottom>
                Featured recipes
            </Typography>

            <Grid container spacing = {3}>
                {recipes.map((recipe) => (
                    <Grid size = {{ xs: 12, sm: 6, md: 4, lg: 3 }} key={recipe.id}> 
                        <Card sx = {{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "#f9f9f9",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            borderRadius: 3,
                            overflow: "hidden",
                            transition: "transform 0.2s ease",
                            "&:hover": {
                                transform: "scale(1.02)",
                            },
                        }}>
                            <CardMedia component = "img" 
                                       height = "160" 
                                       image = {recipe.image} 
                                       alt = {recipe.title}>
                            </CardMedia>
                            <CardContent sx = {{flexGrow: 1}}>
                                <Typography variant = "h6" gutterBottom>
                                    {recipe.title}
                                </Typography>
                                <Typography variant = "body2" color = "text.secondary" sx = {{mb: 2}}>
                                    {recipe.description}
                                </Typography>
                                <Button variant = "contained" color = "primary"
                                        onClick = {() => handleOpen(recipe)}>
                                    View recipe
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open = {open} onClose = {handleClose} maxWidth = "sm" fullWidth>
                {selectedRecipe && (
                    <>
                        <DialogTitle>
                            {selectedRecipe.title}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Typography variant = "body2" color = "text.secondary">
                                {selectedRecipe.recipe}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick = {handleClose}> Close </Button>
                        </DialogActions>
                    </>
                )}

            </Dialog>
        </Box>
    )
}