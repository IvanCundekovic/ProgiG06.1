"use client"
import {useState} from "react";
import {
    AppBar,
    Box,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";
import Link from "next/link";
import CookingRecipes from "../Components/CookingRecipes";
import Extra from "../Components/Extra";
import LiveWorkshops from "../Components/LiveWorkshops";
import VideoLectures from "../Components/VideoLectures";
import {useLocalStorage} from "@/app/functions/useLocalStorage";

export default function Homepage() {
    const [selectedCategory, setSelectedCategory] = useState("Cooking recipes");
    const categories = ["Cooking recipes", "Live workshops", "Video lectures", "Extra"];
    const [username, setUsername] = useLocalStorage<string>("username", "");

    return (
        <Box sx={{display: "flex", height: "100vh"}}>

            <AppBar position="fixed"
                    sx={{zIndex: (theme) => theme.zIndex.drawer + 1, background: "#df0000ff"}}>

                <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>

                    <Typography variant="h6" noWrap>
                        Kuhaona
                    </Typography>
                    {username === "" ? (
                        <Link href="/LoginPage">
                            <Button color="inherit" variant="outlined">
                                Log In
                            </Button>
                        </Link>
                    ) : (
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <Typography variant="h6" noWrap sx={{mr: 2}}>
                                {username}
                            </Typography>

                            <Button color="inherit" variant="outlined"
                                    onClick={() => {
                                        setUsername("");
                                    }}>
                                Sign out
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent"
                    sx={{
                        width: "18vw",
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: "18vw",
                            boxSizing: "border-box",
                            background: "#f5f5f5",
                            mt: 8,
                        }
                    }}>

                <List>
                    {categories.map((text) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton selected={selectedCategory === text}
                                            onClick={() => setSelectedCategory(text)}>
                                <ListItemText primary={text}></ListItemText>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

            </Drawer>
            <Box component="main"
                 sx={{
                     flexGrow: 1,
                     p: 3,
                     mt: 8,
                     background: "linear-gradient(135deg, #e2e2e2ff, #818380)",
                     color: "black",
                 }}>
                <Typography variant="h4" gutterBottom>
                    {selectedCategory}
                </Typography>

                {selectedCategory === "Cooking recipes" && (<CookingRecipes/>)}

                {selectedCategory === "Live workshops" && (<LiveWorkshops/>)}

                {selectedCategory === "Video Lectures" && (<VideoLectures/>)}

                {selectedCategory === "Extra" && (<Extra/>)}

            </Box>
        </Box>
    )
}