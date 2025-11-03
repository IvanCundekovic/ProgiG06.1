"use client";
import {useState} from "react";
import {Box, Button, Container, Paper, TextField, Typography,} from "@mui/material";
import Link from "next/link";
import {redirect} from "next/navigation";
import {useLocalStorage} from "@/app/functions/useLocalStorage";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useLocalStorage<string>("username", "");


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (identifier.includes("@")) {
            console.log("Logging in with email:", identifier, password)
            return
        }
        console.log("Logging in with username:", identifier, password);
        // local storage samo temporary, da login ima bar neku funkcionalnost za sad
        if (identifier) setUsername(identifier);
        redirect("/Homepage");
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
                       }}
                >
                    <Typography variant="h5" color="primary" gutterBottom>
                        Uđi u kuhaonu!
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{width: "100%"}}>
                        <TextField
                            label="Username or Email"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            required
                        />

                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            required
                        />

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
                            Log in
                        </Button>

                        <Link href="/SignUpPage">
                            <Button variant="text" fullWidth sx={{mt: 1}}>
                                Sign up
                            </Button>
                        </Link>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}