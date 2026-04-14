import { useContext, useState } from 'react';
import { context, dispatchContext } from '../context.js';
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
// import './register.css';

function RegisterForm({ setAuthView }) {

    const state = useContext(context);
    const dispatch = useContext(dispatchContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [organization, setOrganization] = useState('');
    const [error, setError] = useState('');
    

    async function handleRegister() {
    if (!email || !password || !organization) {
        setError("Please enter both email and password.");
        return;
    }

    try {
        const res = await fetch("https://formbuilderbackend-d26n.onrender.com/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password, organization }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Registration failed");
            return;
        }

        console.log("User created:", data);
        setError("Account created! You can now log in.");

        // Optional: clear fields
        setEmail("");
        setPassword("");
        setOrganization("");

    } catch (err) {
        setError("Network error: " + err.message);
    }
    }

    return (
        <Paper
            elevation={3}
            sx={{
                padding: 4,
                maxWidth: 600,
                width: "100%",
                margin: "auto",
                mt: 3,
            }}
        >
            <Typography variant="h5" gutterBottom>
            Register
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
            <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
            />

            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
            />

            <TextField
                label="Organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                fullWidth
            />

            <Button variant="contained" onClick={handleRegister}>
                Register
            </Button>

            {error && (
                <Typography color="error">{error}</Typography>
            )}

            <Typography variant="body2">
                Already have an account?{" "}
                <span
                style={{ color: "#1976d2", cursor: "pointer" }}
                onClick={() => setAuthView("login")}
                >
                Login here
                </span>
            </Typography>
            </Box>
        </Paper>
    );
}

export default RegisterForm;
