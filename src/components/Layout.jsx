import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Container, Box } from "@mui/material";
import BrandLogo from "./BrandLogo.jsx";

export default function Layout({ children, userOrg, setLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      localStorage.removeItem("token"); 
      setLoggedIn(false);
      navigate("/"); // <-- This line kicks them immediately back to login.
    });
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: 'background.paper', 
          borderBottom: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <Toolbar>
          
          {/* LEFT SIDE (App Title/Logo) */}
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <BrandLogo onClick={() => navigate(`/${userOrg}`)} />
          </Box>

          {/* RIGHT SIDE (Logout) */}
          <Button color="inherit" onClick={handleLogout} sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Logout
          </Button>

        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 6 }}>
        {children}
      </Container>
    </>
  );
}