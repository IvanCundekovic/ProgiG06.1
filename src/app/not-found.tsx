"use client";

import {Box, Button, Typography} from "@mui/material";
import {useRouter} from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                background: "linear-gradient(135deg, #e2e2e2ff, #818380)",
                textAlign: "center",
                p: 3
            }}
        >
            <Typography variant="h2" component="h1" color="primary">
                404
            </Typography>
            <Typography variant="h5">Ups! Stranica nije pronađena.</Typography>
            <Typography variant="body1" color="text.secondary">
                Provjerite adresu ili se vratite na početnu stranicu.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.push("/Homepage")}>
                Natrag na početnu
            </Button>
        </Box>
    );
}

