"use client";

import { Box, Typography, Paper, Container, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
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
                    Politika privatnosti
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Zadnja ažurirana: {new Date().toLocaleDateString("hr-HR")}
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        1. Uvod
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Kuhaona (&quot;mi&quot;, &quot;nas&quot;, &quot;naš&quot;) poštuje vašu privatnost i obvezuje se zaštititi vaše osobne podatke.
                        Ova politika privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše podatke u skladu s GDPR-om.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        2. Podaci koje prikupljamo
                    </Typography>
                    <Typography variant="body1" component="div">
                        <ul>
                            <li>E-mail adresa (za autentikaciju i komunikaciju)</li>
                            <li>Ime i prezime</li>
                            <li>Preferencije kuhanja, alergije, razina vještine</li>
                            <li>Povijest tečajeva i napredak</li>
                            <li>Recenzije i komentare</li>
                            <li>Podaci o sesiji (kroz NextAuth.js)</li>
                        </ul>
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        3. Kako koristimo vaše podatke
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Vaše podatke koristimo za:
                    </Typography>
                    <Typography variant="body1" component="div">
                        <ul>
                            <li>Pružanje pristupa platformi i funkcionalnostima</li>
                            <li>Personalizaciju preporuka tečajeva</li>
                            <li>Slanje obavijesti o novim lekcijama i radionicama</li>
                            <li>Poboljšanje korisničkog iskustva</li>
                            <li>Pridržavanje zakonskih obveza</li>
                        </ul>
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        4. Vaša prava (GDPR)
                    </Typography>
                    <Typography variant="body1" component="div">
                        <ul>
                            <li><strong>Pravo na pristup:</strong> Možete zatražiti pristup svojim osobnim podacima</li>
                            <li><strong>Pravo na ispravak:</strong> Možete ažurirati svoje podatke u profilu</li>
                            <li><strong>Pravo na brisanje:</strong> Možete zatražiti brisanje svih svojih podataka</li>
                            <li><strong>Pravo na ograničenje:</strong> Možete zatražiti ograničenje obrade</li>
                            <li><strong>Pravo na prigovor:</strong> Možete prigovoriti obradi podataka</li>
                            <li><strong>Pravo na prenosivost:</strong> Možete zatražiti izvoz svojih podataka</li>
                        </ul>
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        5. Sigurnost podataka
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Koristimo moderne sigurnosne mjere uključujući:
                    </Typography>
                    <Typography variant="body1" component="div">
                        <ul>
                            <li>Hashirane lozinke (bcrypt)</li>
                            <li>HTTPS enkripciju</li>
                            <li>OAuth 2.0 autentikaciju</li>
                            <li>Redovne sigurnosne provjere</li>
                            <li>Dnevne backup-e podataka</li>
                        </ul>
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        6. Kontakt
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Za pitanja o privatnosti ili zahtjeve za brisanje podataka, kontaktirajte nas putem profila ili
                        administratora sustava.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
