import { useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


export default function Layout({ children, userOrg, setLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isFormPage = location.pathname.split("/").length > 2;

  const handleLogout = () => {
    fetch("https://formbuilderbackend-d26n.onrender.com/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => setLoggedIn(false));
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
            
            {/* Back button (only show on form pages) */}
            {isFormPage && (
                <Button
                    color="inherit"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/${userOrg}`)}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
            )}

          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate(`/${userOrg}`)}
          >
            Intake Form MVP
          </Typography>

          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ marginTop: 4 }}>
        {children}
      </Container>
    </>
  );
}