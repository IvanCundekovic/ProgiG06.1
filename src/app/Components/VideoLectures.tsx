"use client";
import {Box, Grid, Card, CardContent, CardMedia, Typography, Button,
        Dialog, DialogTitle, DialogContent, DialogActions, Rating, Stack} from "@mui/material";
import {useState} from "react";
import {ReactNode} from "react";

type VideoLecture = {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    videoUrl: string;
    rating: number;
    commentsCount: number;
    recipe: ReactNode;
    ingredients: ReactNode;
    nutrition: ReactNode;
}

export default function VideoLectures(){
    const videos: VideoLecture[] = [
        {
            id: 1,
            title: "Spaghetti carbonara",
            description: "Easily make spaghetti carbonara.",
            thumbnail: "https://images.unsplash.com/photo-1574969903809-3f7a1668ceb0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
            videoUrl: "https://www.youtube.com/embed/D_2DBLAt57c",
            rating: 4.6,
            commentsCount: 25,
            recipe: (
                <Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 2</Typography>
                        <Typography>Finely chop the 100g pancetta, having first removed any rind.
                                    Finely grate 50g pecorino cheese and 50g parmesan
                                    and mix them together.</Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 3</Typography>
                        <Typography>Beat the 3 large eggs in a medium bowl and season with a litle 
                                    freshly grated black pepper.
                                    Set everything aside.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 4</Typography>
                        <Typography>Add 1 tsp salt to the boiling water, 
                                    add 350g spaghetti and when the water comes back to the boil, 
                                    cook at a constant simmer, covered, 
                                    for 10 minutes or until al dente (just cooked).
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 5</Typography>
                        <Typography>Squash 2 peeled plump garlic cloves with the blade of a knife,
                                    just to bruise it.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 6</Typography>
                        <Typography>While the spaghetti is cooking, fry the pancetta with the garlic. 
                                    Drop 50g unsalted butter into a large frying pan or wok and,
                                    as soon as the butter has melted, tip in the pancetta and garlic.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 7</Typography>
                        <Typography>Leave to cook on a medium heat for about 5 minutes, stirring often,
                                    until the pancetta is golden and crisp.
                                    The garlic has now imparted its flavour, 
                                    so take it out with a slotted spoon and discard.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 8</Typography>
                        <Typography>Keep the heat under the pancetta on low. 
                                    When the pasta is ready, lift it from the water with a pasta fork or 
                                    tongs and put it in the frying pan with the pancetta. 
                                    Don’t worry if a little water drops in the pan as well (you want this to happen) 
                                    and don’t throw the pasta water away yet.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 9</Typography>
                        <Typography>Mix most of the cheese in with the eggs, keeping a small handful
                                    back for sprinkling over later.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 10</Typography>
                        <Typography>Take the pan of spaghetti and pancetta off the heat. 
                                    Now quickly pour in the eggs and cheese. Using the tongs or a long fork, 
                                    lift up the spaghetti so it mixes easily with the egg mixture, 
                                    which thickens but doesn’t scramble, and everything is coated.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 11</Typography>
                        <Typography>Add extra pasta cooking water to keep it saucy 
                                    (several tablespoons should do it).
                                    You don't want it wet, just moist.
                                    Season it with a little salt, if needed.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Step 12</Typography>
                        <Typography>Use a long-pronged fork to twist the pasta on to the serving plate or bowl.
                                    Serve immediately with a little sprinkling of the remaining cheese and 
                                    a grating of black pepper. If the dish does get a little dry before serving, 
                                    splash in some more hot pasta water and the glossy sauciness will be revived.
                        </Typography>
                    </Box>
                </Box>
            ),
            ingredients: (
                <Box>
                    <Box>
                        <Typography>100g pancetta</Typography>
                    </Box>
                    <Box>
                        <Typography>50g pecorino cheese</Typography>
                    </Box>
                    <Box>
                        <Typography>50g parmesan</Typography>
                    </Box>
                    <Box>
                        <Typography>3 large eggs</Typography>
                    </Box>
                    <Box>
                        <Typography>350g spaghetti</Typography>
                    </Box>
                    <Box>
                        <Typography>2 pump garlic gloves</Typography>
                        <Typography>peeled and left whole</Typography>
                    </Box>
                    <Box>
                        <Typography>50g unsalted butter</Typography>   
                    </Box>
                    <Box>
                        <Typography>Sea salt and freshly ground black pepper</Typography>   
                    </Box>
                    
                </Box>
            ),
            nutrition: (
                <Box>
                    <Typography variant = "h6" sx = {{fontWeight: "bold"}}>Per serving:</Typography>
                    <Box>
                        <Typography>kcal: 656</Typography>
                    </Box>
                    <Box>
                        <Typography>fat: 30.03g</Typography>
                    </Box>
                    <Box>
                        <Typography>saturates: 15g</Typography>
                    </Box>
                    <Box>
                        <Typography>carbs: 66g</Typography>
                    </Box>
                    <Box>
                        <Typography>sugars: 4g</Typography>
                    </Box>
                    <Box>
                        <Typography>fibre: 4g</Typography>
                    </Box>
                    <Box>
                        <Typography>protein: 29g</Typography>
                    </Box>
                    <Box>
                        <Typography>salt: 1.65g</Typography>
                    </Box>
                   
                </Box>
            ),
        },

        {
            id: 2,
            title: "Chicken curry",
            description: "Easily make chicken curry.",
            thumbnail: "https://plus.unsplash.com/premium_photo-1661419883163-bb4df1c10109?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
            videoUrl: "https://www.youtube.com/embed/s2_DepctcIc",
            rating: 4.2,
            commentsCount: 15,
            recipe: (
                <Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
            ingredients: (
                <Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
            nutrition: (
                <Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
        },

        {
            id: 3,
            title: "Avocado toast",
            description: "Easily make avocado toast.",
            thumbnail: "https://plus.unsplash.com/premium_photo-1676106624038-81d1e17573db?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
            videoUrl: "https://www.youtube.com/embed/dP6btliLGy4",
            rating: 4.9,
            commentsCount: 12,
            recipe: (
                <Box>
                    <Box>
                        <Typography >Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
            ingredients: (
                <Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
            nutrition: (
                <Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
        },

        {
            id: 4,
            title: "Chocolate cake",
            description: "Easily make spaghetti carbonara.",
            thumbnail: "https://plus.unsplash.com/premium_photo-1715015439764-1e8d37d5c6c9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=388",
            videoUrl: "https://www.youtube.com/embed/vI5w-fK25w4",
            rating: 2.3,
            commentsCount: 1223,
            recipe: (
                <Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
            ingredients: (
                <Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
            nutrition: (
                <Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                    <Box>
                        <Typography>Step 1</Typography>
                        <Typography>Put a large saucepan of water on to boil.</Typography>
                    </Box>
                </Box>
            ),
        },
    ];

    const [open, setOpen] = useState (false);
    const [selectedTab, setSelectedTab] = useState("Recipe");
    const [selectedVideo, setSelectedVideo] = useState<VideoLecture | null>(null);

    const handleOpen = (video: VideoLecture) => {
        setSelectedVideo(video);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedVideo(null);
    };

    return(
        <Box>
            <Grid container spacing = {3}>
                {videos.map((video) => (
                    <Grid size = {{xs: 12, sm: 6, md: 4, lg: 3}} key = {video.id}> 
                        <Card sx = {{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "#f9f9f9",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            borderRadius: 3,
                            overflow: "hidden",
                            transition: "transform 0.2s ease",
                            "&:hover": {transform: "scale(1.02)"},
                        }}>
                            <CardMedia 
                                component = "img"
                                height = "160"
                                image = {video.thumbnail}
                                alt = {video.title}>
                            </CardMedia>
                            <CardContent sx = {{ flexGrow: 1}}>
                                <Typography variant = "h6" gutterBottom>
                                    {video.title}
                                </Typography>
                                <Stack direction = "row" alignItems = "center" spacing = {1} mb = {2}>
                                    <Rating
                                        name = "read-only"
                                        value = {video.rating}
                                        precision = {0.1}
                                        readOnly
                                        size = "small">
                                    </Rating>
                                    <Typography variant = "body2" color = "text.secondary">
                                        ({video.commentsCount} comments)
                                    </Typography>
                                </Stack>
                                <Button
                                    variant = "contained"
                                    color = "primary"
                                    onClick = {() => handleOpen(video)}>
                                    Play
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open = {open} onClose = {handleClose} maxWidth = "xl" fullWidth>
                {selectedVideo && (
                    <>
                        
                        <DialogContent dividers>
                           <Grid container spacing = {2}>
                                <Grid size = {{ xs: 12, md: 6}}>
                                    <Box sx = {{
                                         position: "relative",
                                         paddingBottom: "56.25%",
                                         height: 0,
                                         overflow: "hidden",
                                         borderRadius: 2,
                                    }}>
                                        <iframe src = {selectedVideo.videoUrl}
                                                title = {selectedVideo.title}
                                                allow = {"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"}
                                                allowFullScreen
                                                style = {{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    border: 0,
                                                }}>    
                                        </iframe>
                                    </Box>
                                    <Box>
                                        Tu ce bit komentari
                                    </Box>
                                </Grid>

                                <Grid size = {{ xs: 12, md: 6}}>
                                    <Box sx = {{ display: "flex", flexDirection: "column", height: "100%"}}>
                                        <Box sx = {{ display: "flex", gap: 1, mb: 2}}>
                                            {["Recipe","Ingredients","Nutrition"].map((tab) => (
                                                <Button key = {tab}
                                                        variant = {selectedTab === tab ? "contained" : "outlined"}
                                                        onClick = {() => setSelectedTab(tab)}
                                                        color = "primary"
                                                        fullWidth>
                                                        {tab}
                                                </Button>
                                            ))}
                                        </Box>

                                        <Box
                                            sx = {{
                                                flexGrow: 1,
                                                backgroundColor: "#fafafa",
                                                borderRadius: 2,
                                                p: 2,
                                                boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
                                                overflowY: "auto",
                                                minHeight: 300,
                                            }}>
                                            
                                            {selectedTab === "Recipe" && (
                                                <Typography variant = "body2" color = "text.secondary">
                                                    {selectedVideo.recipe ?? "999 jaja"} 
                                                </Typography> //recept
                                            )} 

                                            {selectedTab === "Ingredients" && (
                                                <Typography variant = "body2" color = "text.secondary">
                                                    {selectedVideo.ingredients ?? "999 jaja"} 
                                                </Typography> //ingredients
                                            )}

                                            {selectedTab === "Nutrition" && (
                                                <Typography variant = "body2" color = "text.secondary">
                                                    {selectedVideo.nutrition ?? "999 jaja"} 
                                                </Typography> //nutrition
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                           </Grid>
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