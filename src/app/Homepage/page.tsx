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
    Typography,
    IconButton,
    useMediaQuery,
    useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Extra from "../Components/Extra";
import LiveWorkshops from "../Components/LiveWorkshops";
import VideoLectures from "../Components/VideoLectures";
import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useThemeMode} from "../providers";

export default function Homepage() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const {mode, toggleMode} = useThemeMode();
    const [selectedCategory, setSelectedCategory] = useState("Video lekcije");
    const [mobileOpen, setMobileOpen] = useState(false);
    const categories = ["Video lekcije", "Live radionice", "Dodatno"];

    const {data: session, status} = useSession();

    const isAuthenticated = status === "authenticated";
    const isLoading = status === "loading";

    const username = session?.user?.name || session?.user?.email;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

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
        <Box sx={{display: "flex"}}>

            <AppBar position="fixed"
                    sx={{zIndex: (theme) => theme.zIndex.drawer + 1, background: "#df0000ff"}}>

                <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{mr: 2}}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h6" noWrap>
                            Kuhaona
                        </Typography>
                    </Box>

                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        {/* NF-013: Dark mode toggle */}
                        <IconButton onClick={toggleMode} color="inherit">
                            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>

                        {!isAuthenticated ? (
                            <Button
                                color="inherit"
                                variant="outlined"
                                onClick={handleLoginClick}
                                size={isMobile ? "small" : "medium"}
                            >
                                {isMobile ? "Login" : "Log In"}
                            </Button>
                        ) : (
                            <Box sx={{display: "flex", alignItems: "center", gap: {xs: 0.5, sm: 1}, flexWrap: "wrap"}}>
                                {!isMobile && (
                                    <Typography variant="body2" noWrap sx={{mr: 1}}>
                                        Pozdrav, {username}!
                                    </Typography>
                                )}

                                {session?.user?.role === "ADMINISTRATOR" && (
                                    <Button
                                        color="inherit"
                                        variant="outlined"
                                        onClick={() => router.push("/admin")}
                                        size={isMobile ? "small" : "medium"}
                                    >
                                        {isMobile ? "Admin" : "Admin Panel"}
                                    </Button>
                                )}

                                <Button
                                    color="inherit"
                                    variant="outlined"
                                    onClick={() => router.push("/profile")}
                                    size={isMobile ? "small" : "medium"}
                                >
                                    Profil
                                </Button>

                                <Button
                                    color="inherit"
                                    variant="outlined"
                                    onClick={handleSignOut}
                                    size={isMobile ? "small" : "medium"}
                                >
                                    {isMobile ? "Odjava" : "Odjava"}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* NF-001: Responzivni Drawer */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                sx={{
                    width: isMobile ? 240 : "18vw",
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: isMobile ? 240 : "18vw",
                        boxSizing: "border-box",
                        mt: {xs: 7, md: 8},
                    }
                }}
            >

                <List>
                    {categories.map((text) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton
                                selected={selectedCategory === text}
                                onClick={() => {
                                    setSelectedCategory(text);
                                    if (isMobile) {
                                        setMobileOpen(false);
                                    }
                                }}
                            >
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: {xs: 2, sm: 3},
                    mt: {xs: 7, md: 8},
                    minHeight: "100vh",
                    width: {xs: "100%", md: `calc(100% - ${isMobile ? 0 : "18vw"})`},
                }}
            >
                

                {selectedCategory === "Live radionice" && (<LiveWorkshops/>)}

                {selectedCategory === "Video lekcije" && (<VideoLectures/>)}

                {selectedCategory === "Dodatno" && (<Extra/>)}

            </Box>

            {/* NF-006: Footer sa linkovima na Privacy Policy i Terms */}
            <Box
                component="footer"
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: {xs: 0, md: "18vw"},
                    right: 0,
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    py: 1,
                    px: 2,
                    zIndex: 1000,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    fontSize: "0.75rem",
                }}
            >
                <Button
                    color="inherit"
                    size="small"
                    onClick={() => router.push("/privacy")}
                    sx={{textTransform: "none", fontSize: "0.75rem"}}
                >
                    Politika privatnosti
                </Button>
                <Typography sx={{fontSize: "0.75rem"}}>|</Typography>
                <Button
                    color="inherit"
                    size="small"
                    onClick={() => router.push("/terms")}
                    sx={{textTransform: "none", fontSize: "0.75rem"}}
                >
                    Uvjeti korištenja
                </Button>
            </Box>
        </Box>
    )
}