import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box, Container, Typography } from "@mui/material";

import './App.css';

import LoginForm from './login/login.jsx';
import RegisterForm from './register/register.jsx';
import DefaultForm from "./Forms/DefaultForm.jsx";
import DisplayForm from "./DisplayForm/DisplayForm.jsx";
import FormsList from "./pages/formslist/formslist.jsx";
import FormDataPage from "./pages/formdatapage/formdatapage.jsx";
import FormBuilder from "./pages/FormBuilder/FormBuilder.jsx";

function App() {
  const [authView, setAuthView] = useState("login");
  const [loggedIn, setLoggedIn] = useState(null);
  const [userOrg, setUserOrg] = useState(null); // <- store user's organization

  // Check authentication and get organization
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("https://formbuilderbackend-d26n.onrender.com/check-auth", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setLoggedIn(true);
          setUserOrg(data.organization); // <- set org from backend
        } else {
          setLoggedIn(false);
        }
      } catch {
        setLoggedIn(false);
      }
    }

    checkAuth();
  }, []);

  if (loggedIn === null) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PAGE */}
        <Route
          path="/"
          element={
            loggedIn && userOrg ? (
              <Navigate to={`/${userOrg}`} />
            ) : (
              <Container maxWidth="sm">
                <Box mt={8} textAlign="center">
                  <Typography variant="h4" gutterBottom>
                    Intake Form MVP
                  </Typography>

                  {authView === "login" ? (
                    <LoginForm
                      setAuthView={setAuthView}
                      setLoggedIn={setLoggedIn}
                      setUserOrg={setUserOrg} // <- pass setter to LoginForm
                    />
                  ) : (
                    <RegisterForm setAuthView={setAuthView} />
                  )}

                </Box>
              </Container>
            )
          }
        />

        {/* ORG FORMS LIST */}
        <Route
          path="/:orgName"
          element={
            loggedIn ? <FormsList setLoggedIn={setLoggedIn} /> : <Navigate to="/" />
          }
        />

        {/* DEV FORM */}
        <Route path="/dev-form" element={<DefaultForm />} />
        <Route path="/display-form" element={<DisplayForm />} />
        <Route path="/form-builder" element={<FormBuilder />} />

        {/* no log in form i hope */}
        <Route path="/form/:formId" element={<DisplayForm />} />

        {/* INDIVIDUAL FORM DATA PAGE */}
        <Route
          path="/:orgName/:formId"
          element={
            loggedIn ? <FormDataPage setLoggedIn={setLoggedIn} /> : <Navigate to="/" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;