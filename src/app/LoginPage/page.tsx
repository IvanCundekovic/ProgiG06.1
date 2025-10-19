"use client";
import {useState} from "react";
import {Box, Button, TextField, Typography, Paper, Container} from "@mui/material";

export default function LoginPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Logging in with:", email, password);
    }
    return (
        <Box sx = {{
            background: "linear-gradient(135deg, #101111, #818380)",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}
        >
            <Container maxWidth = "xs">
                <Paper elevation = {6}
                       sx = {{
                        padding: 4,
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                       }}
                >
                    <Typography variant = "h5" color = "primary" gutterBottom>
                       Postani majstor kuhaone!
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{width: "100%"}}>
                        <TextField
                            label = "Email"
                            type = "email"
                            value = {email}
                            onChange = {(e) => setEmail(e.target.value)}
                            fullWidth
                            margin = "normal"
                            variant = "outlined"
                            required
                        />
                        <TextField
                            label = "Password"
                            type = "password"
                            value = {password}
                            onChange = {(e) => setPassword(e.target.value)}
                            fullWidth
                            margin = "normal"
                            variant = "outlined"
                            required
                        />

                        <Button
                            type = "submit"
                            variant = "contained"
                            fullWidth
                            sx = {{
                                mt: 2,
                                backgroundColor: "#00acc1",
                                "&:hover": {backgroundColor: "#00838f"},
                            }}
                        >
                            Log in
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}