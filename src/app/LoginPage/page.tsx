"use client";

import {useState} from "react";
import {Box, Button, Checkbox, Container, Divider, FormControlLabel, Paper, TextField, Typography} from "@mui/material";
import {redirect} from "next/navigation";

export default function LoginPage() {
    const [isLoginMode, setIsLoginMode] = useState(true);

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [agree, setAgree] = useState(false);

    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isLoginMode) {
            // Log in
            console.log("Pokušaj PRIJAVE (Login) s:", identifier, password);

            if (identifier === "test" && password === "pass") {
                alert("Prijava uspješna!");
                redirect("/Homepage");
            } else {
                setError("Korisničko ime/e-mail ili lozinka nisu ispravni.");
            }

        } else {
            // Sign up
            if (password !== repeatPassword) {
                setError("Lozinka i ponovljena lozinka se ne podudaraju.");
                return;
            }
            if (!agree) {
                setError("Morate se složiti s uvjetima korištenja.");
                return;
            }

            console.log("Pokušaj REGISTRACIJE (Sign-Up) s:", username, email, password);

            // TODO: Add api call za registraciju ovdje
            setError("Registracija uspješna! Molimo implementirajte pravu backend logiku.");
        }
    }

    // Funkcija za pokretanje OAuth prijave
    const handleOAuthSignIn = (provider: 'github' | 'google') => {
        const callbackUrl = encodeURIComponent("/Homepage");
        window.location.href = `/api/auth/signin/${provider}?callbackUrl=${callbackUrl}`;
    }

    const SocialButton = ({icon, label, onClick, color}: {
        icon: React.ReactNode,
        label: string,
        onClick: () => void,
        color: string
    }) => (
        <Button
            onClick={onClick}
            fullWidth
            variant="outlined"
            startIcon={icon}
            sx={{
                mt: 1,
                py: 1.5,
                borderColor: color,
                color: color,
                '&:hover': {
                    backgroundColor: `${color === '#333' ? 'rgba(51, 51, 51, 0.1)' : 'rgba(234, 67, 53, 0.1)'}`,
                    borderColor: color,
                }
            }}
        >
            {label}
        </Button>
    );

    // Ikone za GitHub
    const GitHubIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.087-.744.084-.693.084-.693 1.205.084 1.839 1.237 1.839 1.237 1.07 1.836 2.809 1.305 3.492.998.108-.77.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.118-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.294-1.552 3.301-1.23 3.301-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.8.576C20.564 21.795 24 17.292 24 12 24 5.373 18.627 0 12 0z"/>
        </svg>
    );

    // Ikone za Google
    const GoogleIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#4285F4"
                  d="M21.6 12.2c0-.7-.1-1.3-.2-2h-9.4v3.5h5.3c-.2 1.1-.9 2.1-1.9 2.8v2.3h3c1.7-1.6 2.7-4 2.7-6.6z"/>
            <path fill="#34A853"
                  d="M12 24c3.3 0 6.4-1.1 8.5-3.1l-3-2.3c-1.1.7-2.6 1.1-4.5 1.1-3.4 0-6.3-2.3-7.3-5.5H1.2v2.4C3.8 22.3 7.6 24 12 24z"/>
            <path fill="#FBBC05"
                  d="M4.7 14.5c-.3-.8-.5-1.7-.5-2.5s.2-1.7.5-2.5V7.4H1.2C.4 9.1 0 10.5 0 12s.4 2.9 1.2 4.6l3.5-2.1z"/>
            <path fill="#EA4335"
                  d="M12 4.7c1.8 0 3.3.6 4.6 1.8l2.7-2.7C17.7 1.5 15 0 12 0 7.6 0 3.8 1.7 1.2 4.1l3.5 2.7c1-.4 2.3-.7 3.8-.7z"/>
            <path fill="none" d="M0 0h24v24H0z"/>
        </svg>
    );

    const toggleMode = () => {
        setIsLoginMode(prev => !prev);
        setError("");
    }

    return (
        <Box sx={{
            background: "linear-gradient(135deg, #e2e2e2ff, #818380)",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}
        >
            <Container maxWidth="xs">
                <Paper elevation={6}
                       sx={{
                           padding: 4,
                           borderRadius: 3,
                           display: "flex",
                           flexDirection: "column",
                           alignItems: "center",
                           minWidth: 350,
                       }}
                >
                    <Typography variant="h5" color="primary" gutterBottom>
                        {isLoginMode ? "Uđi u kuhaonu!" : "Postani majstor kuhaone!"}
                    </Typography>

                    {/* Dva OAuth Gumba */}
                    <Typography variant="caption" color="textSecondary" sx={{mt: 1, mb: 0.5}}>
                        {isLoginMode ? "Prijavi se s:" : "Registriraj se s:"}
                    </Typography>
                    <SocialButton
                        icon={GoogleIcon}
                        label={isLoginMode ? "Prijavi se s Google-om" : "Registriraj se s Google-om"}
                        onClick={() => handleOAuthSignIn('google')}
                        color="#EA4335" // Crvena za Google
                    />
                    <SocialButton
                        icon={GitHubIcon}
                        label={isLoginMode ? "Prijavi se s GitHub-om" : "Registriraj se s GitHub-om"}
                        onClick={() => handleOAuthSignIn('github')}
                        color="#333" // Crna za GitHub
                    />

                    {/* Separator */}
                    <Divider sx={{my: 2, width: '100%'}}>
                        <Typography variant="caption" color="textSecondary">
                            — ILI —
                        </Typography>
                    </Divider>


                    {/* Lokalna Forma (Login ili Registracija) */}
                    <Box component="form" onSubmit={handleSubmit} sx={{width: "100%"}}>
                        {isLoginMode ? (
                            // --- LOGIN FORMA ---
                            <>
                                <TextField
                                    label="Korisničko ime ili E-mail"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                            </>
                        ) : (
                            // --- REGISTRACIJA FORMA ---
                            <>
                                <TextField
                                    label="Korisničko ime"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                                <TextField
                                    label="E-mail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                            </>
                        )}

                        {/* Polje za lozinku je zajedničko za oba moda */}
                        <TextField
                            label="Lozinka"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            required
                        />

                        {/* Dodatna polja samo za Registraciju */}
                        {!isLoginMode && (
                            <>
                                <TextField
                                    label="Ponovi lozinku"
                                    type="password"
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={agree}
                                            onChange={(e) => setAgree(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Slažem se s uvjetima korištenja"
                                />
                            </>
                        )}

                        {error && (
                            <Typography color="error" variant="body2" textAlign={"center"} sx={{mt: 1}}>
                                {error}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 2,
                                backgroundColor: "#df0000ff",
                                "&:hover": {backgroundColor: "#e73d3dff"},
                            }}
                        >
                            {isLoginMode ? "Prijava" : "Registracija"}
                        </Button>
                    </Box>

                    {/* Prebacivanje mode-a */}
                    <Button variant="text" fullWidth sx={{mt: 1, textTransform: 'none'}} onClick={toggleMode}>
                        {isLoginMode
                            ? "Nemaš račun? Registriraj se!"
                            : "Već imaš račun? Prijavi se!"
                        }
                    </Button>
                </Paper>
            </Container>
        </Box>
    )
}