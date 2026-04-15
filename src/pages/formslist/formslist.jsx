import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { 
  Typography, 
  Button, 
  Box, 
  Card, 
  CardActionArea,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// An array of theme colors to cycle through for our card tops
const cardColors = [
  'primary.main', 
  'secondary.main', 
  'info.main', 
  'success.main', 
  'warning.main'
];

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function FormsList({ setLoggedIn }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userOrg, setUserOrg] = useState(null);
  const navigate = useNavigate();
  const { orgName } = useParams();

  function handleLogout() {
    fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => setLoggedIn(false));
  }

  function handleCreateForm() {
    navigate(`/form-builder`);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // 🔐 Get real org from backend
        const authRes = await fetch(`${import.meta.env.VITE_API_URL}/check-auth`, {
          credentials: "include",
        });

        const authData = await authRes.json();
        const realOrg = authData.organization;
        setUserOrg(realOrg);

        if (orgName !== realOrg) {
          navigate(`/${realOrg}`, { replace: true });
          return;
        }

        // Fetch forms
        const res = await fetch("https://formbuilderbackend-d26n.onrender.com/built-forms-list", {
          credentials: "include",
        });

        const data = await res.json();
        setForms(data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [orgName, navigate]);

  if (loading) {
    return (
      <Layout userOrg={userOrg || orgName} setLoggedIn={setLoggedIn}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout userOrg={userOrg} setLoggedIn={setLoggedIn}>
      
      {/* PAGE TITLE */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" fontWeight="600">
          {toTitleCase(userOrg)} Forms
        </Typography>
      </Box>

      {/* ACTION BAR */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
        <Button 
          variant="contained" 
          onClick={handleCreateForm}
          startIcon={<AddIcon />}
        >
          Create New Form
        </Button>
      </Box>

      {/* CONDITIONAL RENDER: Empty State vs CSS Grid */}
      {forms.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: "center", 
            py: 8, 
            px: 2, 
            bgcolor: "background.paper", 
            borderRadius: 2, 
            border: "1px dashed", 
            borderColor: "divider" 
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No forms found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Create New Form" to get started.
          </Typography>
        </Box>
      ) : (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: 3 
          }}
        >
          {/* We added 'index' to our map function here! */}
          {forms.map((form, index) => (
            <Card 
              key={form.id}
              variant="outlined" 
              sx={{ 
                height: 200,
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[4]
                }
              }}
            >
              <CardActionArea 
                sx={{ height: '100%', width: '100%' }}
                onClick={() => navigate(`/${userOrg}/${form.id}`)}
              >
                <Box 
                  sx={{ 
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  {/* TOP COLORED SECTION */}
                  <Box 
                    sx={{ 
                      flexGrow: 1, 
                      // Cycles through our color array using the card's index!
                      bgcolor: cardColors[index % cardColors.length], 
                      // 0.15 gives a gorgeous, subtle wash of color without blinding the user
                      opacity: 0.15, 
                    }} 
                  />
                  
                  {/* BOTTOM SEAMLESS LABEL STRIP */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      // Removed the borderTop and bgcolor so it blends perfectly
                      width: '100%',
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      component="div" 
                      fontWeight="500"
                      color="text.secondary"
                      textAlign="left" 
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {form.title}
                    </Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

    </Layout>
  );
}