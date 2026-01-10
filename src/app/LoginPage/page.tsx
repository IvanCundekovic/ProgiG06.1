"use client";

import {useEffect, useState} from "react";
import {Box, Button, Checkbox, Container, Divider, FormControlLabel, Paper, TextField, Typography} from "@mui/material";
import {signIn} from "next-auth/react";
import Image from "next/image";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [availableProviders, setAvailableProviders] = useState<string[]>(["google", "github"]);

    // Učitaj dostupne OAuth providere
    useEffect(() => {
        fetch("/api/auth/providers")
            .then((res) => res.json())
            .then((data) => setAvailableProviders(data.providers || []))
            .catch(() => setAvailableProviders([]));
    }, []);

    const [isLoginMode, setIsLoginMode] = useState(true);

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [agree, setAgree] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLoginMode) {
                const result = await signIn('credentials', {
                    identifier,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    setError("Prijava neuspješna: Provjerite e-mail i lozinku.");
                } else if (result?.ok) {
                    router.refresh();
                    router.push("/Homepage");
                }

            } else {
                if (password !== repeatPassword) {
                    setError("Lozinka i ponovljena lozinka se ne podudaraju.");
                    setLoading(false);
                    return;
                }
                if (!agree) {
                    setError("Morate se složiti s uvjetima korištenja.");
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Registracija neuspješna. Pokušajte ponovno.");
                } else {
                    const loginResult = await signIn('credentials', {
                        identifier: email,
                        password: password,
                        redirect: false,
                    });

                    if (loginResult?.ok) {
                        router.refresh();
                        router.push("/Homepage");
                    } else {
                        setError("Registracija je uspješna! Molimo se sada prijavite.");
                        setIsLoginMode(true);
                    }
                }
            }
        } catch (err) {
            console.error("Greška prilikom obrade zahtjeva:", err);
            setError("Došlo je do neočekivane greške.");
        } finally {
            setLoading(false);
        }
    }

    const handleOAuthSignIn = (provider: 'github' | 'google') => {
        void signIn(provider, {callbackUrl: "/Homepage"});
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
            disabled={loading}
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

    const GitHubIcon = (
        <Image src="/github.svg" alt="GitHub Logo" width={24} height={24} />
    );

    const GoogleIcon = (
        <Image src="/google.svg" alt="Google Logo" width={24} height={24} />
    );

    const toggleMode = () => {
        setIsLoginMode(prev => !prev);
        setError("");
        setIdentifier(email || identifier);
        setEmail("");
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

                    <Typography variant="caption" color="textSecondary" sx={{mt: 1, mb: 0.5}}>
                        {isLoginMode ? "Prijavi se s:" : "Registriraj se s:"}
                    </Typography>
                    {availableProviders.includes("google") && (
                        <SocialButton
                            icon={GoogleIcon}
                            label={isLoginMode ? "Prijavi se s Google-om" : "Registriraj se s Google-om"}
                            onClick={() => handleOAuthSignIn('google')}
                            color="#EA4335"
                        />
                    )}
                    {availableProviders.includes("github") && (
                        <SocialButton
                            icon={GitHubIcon}
                            label={isLoginMode ? "Prijavi se s GitHub-om" : "Registriraj se s GitHub-om"}
                            onClick={() => handleOAuthSignIn('github')}
                            color="#333"
                        />
                    )}
                    {availableProviders.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: "center"}}>
                            OAuth prijava trenutno nije dostupna. Koristite e-mail i lozinku za prijavu.
                        </Typography>
                    )}

                    <Divider sx={{my: 2, width: '100%'}}>
                        <Typography variant="caption" color="textSecondary">
                            — ILI —
                        </Typography>
                    </Divider>


                    <Box component="form" onSubmit={handleSubmit} sx={{width: "100%"}}>
                        {isLoginMode ? (
                            <>
                                <TextField
                                    label="E-mail"
                                    type="email"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    required
                                    disabled={loading}
                                />
                            </>
                        ) : (
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
                                    disabled={loading}
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
                                    disabled={loading}
                                />
                            </>
                        )}

                        <TextField
                            label="Lozinka"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            required
                            disabled={loading}
                        />

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
                                    disabled={loading}
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={agree}
                                            onChange={(e) => setAgree(e.target.checked)}
                                            color="primary"
                                            disabled={loading}
                                        />
                                    }
                                    label={
                                        <span>
                                            Slažem se s{" "}
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.open("/terms", "_blank");
                                                }}
                                                sx={{textTransform: "none", p: 0, minWidth: "auto", textDecoration: "underline"}}
                                            >
                                                uvjetima korištenja
                                            </Button>
                                            {" "}i{" "}
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.open("/privacy", "_blank");
                                                }}
                                                sx={{textTransform: "none", p: 0, minWidth: "auto", textDecoration: "underline"}}
                                            >
                                                politikom privatnosti
                                            </Button>
                                        </span>
                                    }
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
                            disabled={loading}
                        >
                            {loading
                                ? "Molimo pričekajte..."
                                : isLoginMode ? "Prijava" : "Registracija"
                            }
                        </Button>
                    </Box>

                    <Button variant="text" fullWidth sx={{mt: 1, textTransform: 'none'}} onClick={toggleMode} disabled={loading}>
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