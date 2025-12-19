"use client";

import {SessionProvider} from "next-auth/react";
import React, {useState, useEffect, createContext, useContext} from "react";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";
import {ThemeProvider, createTheme, CssBaseline} from "@mui/material";

// NF-013: Dark mode context
type ThemeMode = "light" | "dark";

interface ThemeContextType {
    mode: ThemeMode;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeMode must be used within ThemeModeProvider");
    }
    return context;
}

function ThemeModeProvider({children}: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>("light");

    useEffect(() => {
        // Učitaj preferenciju iz localStorage
        const savedMode = localStorage.getItem("themeMode") as ThemeMode;
        if (savedMode === "light" || savedMode === "dark") {
            setMode(savedMode);
        } else {
            // Provjeri system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setMode(prefersDark ? "dark" : "light");
        }
    }, []);

    const toggleMode = () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("themeMode", newMode);
    };

    const theme = createTheme({
        palette: {
            mode,
            primary: {
                main: "#df0000",
            },
            secondary: {
                main: "#818380",
            },
        },
    });

    return (
        <ThemeContext.Provider value={{mode, toggleMode}}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

export default function Providers({children}: { children: React.ReactNode }) {
    return (
        <SessionProvider
            basePath="/api/auth"
            refetchInterval={0}
            refetchOnWindowFocus={false}
            refetchWhenOffline={false}
        >
            <AppRouterCacheProvider>
                <ThemeModeProvider>
                    {children}
                </ThemeModeProvider>
            </AppRouterCacheProvider>
        </SessionProvider>
    );
}