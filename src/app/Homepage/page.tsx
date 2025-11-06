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
import CookingRecipes from "../Components/CookingRecipes";
import Extra from "../Components/Extra";
import LiveWorkshops from "../Components/LiveWorkshops";
import VideoLectures from "../Components/VideoLectures";
import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

export default function Homepage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("Cooking recipes");
    const categories = ["Cooking recipes", "Live workshops", "Video lectures", "Extra"];

    const {data: session, status} = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoading = status === "loading";

    const username = session?.user?.name || session?.user?.email;

    const handleSignOut = () => {
        void signOut({callbackUrl: "/Homepage"});
    }

    const handleLoginClick = () => {
        router.push("/LoginPage");
    }

    if (isLoading) {
        return (
            <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
                <Typography variant="h5">Učitavanje...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{display: "flex", height: "100vh"}}>

            <AppBar position="fixed"
                    sx={{zIndex: (theme) => theme.zIndex.drawer + 1, background: "#df0000ff"}}>

                <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>

                    <Typography variant="h6" noWrap>
                        Kuhaona
                    </Typography>

                    {!isAuthenticated ? (
                        <Button
                            color="inherit"
                            variant="outlined"
                            onClick={handleLoginClick}
                        >
                            Log In
                        </Button>
                    ) : (
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <Typography variant="h6" noWrap sx={{mr: 2}}>
                                Pozdrav, {username}!
                            </Typography>

                            <Button color="inherit" variant="outlined"
                                    onClick={handleSignOut}>
                                Odjava
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