import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { Typography, Button, List, ListItem, ListItemText } from "@mui/material";

export default function FormsList({ setLoggedIn }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userOrg, setUserOrg] = useState(null);
  const navigate = useNavigate();
  const { orgName } = useParams();

  function handleLogout() {
    fetch("https://formbuilderbackend-d26n.onrender.com/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => setLoggedIn(false));
  }

  function handleCreateForm() {
    // dummy button for now

    // eventually this needs to navigate to a form builder page
    // I think this button will render FormBuilder.jsx eventually
    navigate(`/form-builder`);
    //alert("Create Form clicked! This will navigate to the form builder in the future.");
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // 🔐 Get real org from backend
        const authRes = await fetch("https://formbuilderbackend-d26n.onrender.com/check-auth", {
          credentials: "include",
        });

        const authData = await authRes.json();
        const realOrg = authData.organization;
        setUserOrg(realOrg);

        // Fix URL if someone typed wrong org
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
  }, [orgName]);

  if (loading) return <div>Loading forms...</div>;
  if (forms.length === 0) return <div>
    No forms found

    <button onClick={handleLogout}>Logout</button>
    

  </div>;

  return (
    <Layout userOrg={userOrg} setLoggedIn={setLoggedIn}>
      <Typography variant="h4" gutterBottom>
        {userOrg} Forms
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleCreateForm}>
        Create New Form
      </Button>

      <List>
        {forms.map((form) => (
          <ListItem
            button
            key={form.id}
            onClick={() => navigate(`/${userOrg}/${form.id}`)}
          >
            <ListItemText primary={form.title} />
          </ListItem>
        ))}
      </List>
    </Layout>
  );
}