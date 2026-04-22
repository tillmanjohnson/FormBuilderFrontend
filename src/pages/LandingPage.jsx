import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Stack, Paper, AppBar, Toolbar } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoDeleteIcon from '@mui/icons-material/AutoDelete';
import BrandLogo from '../components/BrandLogo'; // Adjust path if needed

export default function LandingPage({ setAuthView }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setAuthView('register');
    navigate('/login');
  };

  const handleSignIn = () => {
    setAuthView('login');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Simple Public Nav */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <BrandLogo />
          <Button variant="outlined" onClick={handleSignIn} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Sign In
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" fontWeight="800" gutterBottom sx={{ fontSize: { xs: '3rem', md: '4rem' } }}>
          Ditch the Clipboard.
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 5, lineHeight: 1.6 }}>
          No more messy handwriting. No more manual data entry. <br/>
          Let your patients scan a QR code, fill out their forms digitally, and get the data instantly.
        </Typography>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mb={10}>
          <Button variant="contained" size="large" onClick={handleGetStarted} sx={{ px: 4, py: 1.5, fontSize: '1.1rem', textTransform: 'none', borderRadius: '8px' }}>
            Get Started for Free
          </Button>
          <Button variant="text" size="large" onClick={handleSignIn} sx={{ px: 4, py: 1.5, fontSize: '1.1rem', textTransform: 'none' }}>
            I already have an account
          </Button>
        </Stack>

        {/* Feature Highlights */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
          <Paper elevation={0} sx={{ p: 4, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: '16px', bgcolor: 'background.paper' }}>
            <AutoDeleteIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Zero Paperwork</Typography>
            <Typography color="text.secondary">Keep all your forms in one secure, digital location.</Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 4, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: '16px', bgcolor: 'background.paper' }}>
            <QrCode2Icon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Scan & Go</Typography>
            <Typography color="text.secondary">Patients just point their phone camera and fill it out.</Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 4, flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: '16px', bgcolor: 'background.paper' }}>
            <SpeedIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Instant Data</Typography>
            <Typography color="text.secondary">Responses appear in your dashboard the second they hit submit.</Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}