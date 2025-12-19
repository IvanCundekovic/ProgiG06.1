"use client";

import { Box, Typography, Paper, Container, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";

export default function TermsOfService() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, position: "relative" }}>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        color: "text.secondary",
                        "&:hover": {
                            backgroundColor: "action.hover",
                        },
                    }}
                    aria-label="Zatvori"
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h4" gutterBottom>
                    Uvjeti korištenja
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Zadnja ažurirana: {new Date().toLocaleDateString("hr-HR")}
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        1. Prihvaćanje uvjeta
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Korištenjem Kuhaona platforme, prihvaćate ove uvjete korištenja. Ako se ne slažete s ovim uvjetima,
                        molimo ne koristite našu platformu.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        2. Korisnički račun
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Vi ste odgovorni za:
                    </Typography>
                    <Typography variant="body1" component="div">
                        <ul>
                            <li>Čuvanje sigurnosti svoje lozinke</li>
                            <li>Sve aktivnosti koje se dogode pod vašim računom</li>
                            <li>Pružanje točnih i ažurnih informacija</li>
                        </ul>
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        3. Prihvatljivo ponašanje
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Zabranjeno je:
                    </Typography>
                    <Typography variant="body1" component="div">
                        <ul>
                            <li>Objavljivanje diskriminatornog sadržaja</li>
                            <li>Govor mržnje u komentarima i recenzijama</li>
                            <li>Zlouporaba platforme</li>
                            <li>Kopiranje ili distribucija sadržaja bez dozvole</li>
                        </ul>
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        4. Intelektualno vlasništvo
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Svi sadržaji na platformi (lekcije, video materijali, tekstovi) su vlasništvo Kuhaona ili
                        njenih licenciranih partnera. Ne smijete reproducirati, distribuirati ili koristiti sadržaj bez
                        izričite dozvole.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        5. Odricanje od odgovornosti
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Platforma se pruža &quot;kakva jest&quot;. Ne garantujemo da će platforma biti dostupna 100% vremena ili
                        da će biti bez grešaka. Ne snosimo odgovornost za bilo kakve štete nastale korištenjem platforme.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        6. Promjene uvjeta
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Zadržavamo pravo mijenjati ove uvjete u bilo kojem trenutku. O značajnim promjenama ćemo vas
                        obavijestiti putem e-maila ili obavijesti na platformi.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
