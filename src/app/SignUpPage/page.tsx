"use client";
import {useState} from "react";
import {Box, Button, TextField, Typography, 
        Paper, Container, FormControlLabel, Checkbox} from "@mui/material";

export default function SignUpPage(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState("");


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password != repeatPassword){
            setError("Password must match repeat password");
            return
        } 
        if (!agree) {
            setError("You must agree to the terms and conditions")
            return
        }
        console.log("Logging in with:", username, email, password);
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
                            label = "Username"
                            type = "username"
                            value = {username}
                            onChange = {(e) => setUsername(e.target.value)}
                            fullWidth
                            margin = "normal"
                            variant = "outlined"
                            required
                        />
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
                        <TextField
                            label = "Repeat password"
                            type = "password"
                            value = {repeatPassword}
                            onChange = {(e) => setRepeatPassword(e.target.value)}
                            fullWidth
                            margin = "normal"
                            variant = "outlined"
                            required
                        />

                        <FormControlLabel 
                            control = {
                                <Checkbox
                                    checked = {agree}
                                    onChange = {(e) => setAgree(e.target.checked)}
                                    color = "primary"
                                />
                            }
                            label = "I agree to the terms and conditions"
                        />

                        {error &&(
                            <Typography color = "error" variant = "body2" textAlign = {"center"} sx = {{mt:1}}>
                                {error}
                            </Typography>

                        )}

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
                            Sign up
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}