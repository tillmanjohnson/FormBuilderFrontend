import { useState } from 'react';
// import './login.css';

import { TextField, Button, Paper, Typography, Box } from "@mui/material";

function LoginForm({ setAuthView, setLoggedIn, setUserOrg }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("https://formbuilderbackend-d26n.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || data.error || "Login failed");
        return;
      }

      console.log("Login success:", data);

      // Update App state for redirect
      setUserOrg(data.organization);
      setLoggedIn(true);

      // No need to navigate manually; App.jsx handles redirect based on userOrg

    } catch (err) {
      setError("Network error: " + err.message);
    }
  }

  return (
    <Paper elevation={3} sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Login
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

        <Button variant="contained" onClick={handleLogin}>
          Login
        </Button>

        {error && (
          <Typography color="error">{error}</Typography>
        )}

        <Typography variant="body2">
          Don’t have an account?{" "}
          <span
            style={{ color: "#1976d2", cursor: "pointer" }}
            onClick={() => setAuthView("register")}
          >
            Register here
          </span>
        </Typography>
      </Box>
    </Paper>
  );
}

export default LoginForm;