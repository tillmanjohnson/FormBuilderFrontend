import React, { useContext, useState } from 'react';
import { context, dispatchContext } from '../../../context.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Card, SignInContainer } from '../AuthStyles.jsx'; // STYLED COMPONENTS FROM TEMPLATE (MATCHING LOGIN)


// --- MAIN COMPONENT ---
export default function RegisterForm({ setAuthView }) {
  const state = useContext(context);
  const dispatch = useContext(dispatchContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [serverMessage, setServerMessage] = useState(''); // Handles both errors and success

  // Template's UI error state logic
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [orgError, setOrgError] = useState(false);
  const [orgErrorMessage, setOrgErrorMessage] = useState('');

  // Front-end Validation
  const validateInputs = () => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password || password.length < 3) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 3 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!organization || organization.trim().length === 0) {
      setOrgError(true);
      setOrgErrorMessage('Organization name is required.');
      isValid = false;
    } else {
      setOrgError(false);
      setOrgErrorMessage('');
    }

    return isValid;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setServerMessage('');

    if (!validateInputs()) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.toLowerCase(), 
          password,
          organization: organization.trim().toLowerCase(),
        }),});

      const data = await res.json();

      if (!res.ok) {
        setServerMessage(data.error || "Registration failed");
        return;
      }

      console.log("User created:", data);
      setServerMessage("Account created! You can now sign in.");

      // Clear fields on success
      setEmail("");
      setPassword("");
      setOrganization("");

    } catch (err) {
      setServerMessage("Network error: " + err.message);
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" sx={{ justifyContent: 'center' }}>
        <Card variant="outlined">
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            Intake Form MVP
          </Typography>

          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Register
          </Typography>

          <Box
            component="form"
            onSubmit={handleRegister}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                helperText={emailErrorMessage}
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="organization">Organization</FormLabel>
              <TextField
                id="organization"
                name="organization"
                placeholder="Company"
                required
                fullWidth
                variant="outlined"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                error={orgError}
                helperText={orgErrorMessage}
                color={orgError ? 'error' : 'primary'}
              />
            </FormControl>

            {serverMessage && (
              <Typography 
                color={serverMessage.includes("created") ? "success.main" : "error"} 
                variant="body2" 
                textAlign="center"
              >
                {serverMessage}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              Register
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => setAuthView("login")}
                sx={{ alignSelf: 'center' }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </>
  );
}