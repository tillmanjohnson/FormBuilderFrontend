import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";

export default function Layout({ children, userOrg, setLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => setLoggedIn(false));
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
          
          {/* LEFT SIDE (App Title) */}
          <Typography
            variant="h6"
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main', 
              cursor: "pointer", 
              flexGrow: 1 // This pushes the Logout button to the far right
            }}
            onClick={() => navigate(`/${userOrg}`)}
          >
            Intake Form MVP
          </Typography>

          {/* RIGHT SIDE (Logout) */}
          <Button color="inherit" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
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