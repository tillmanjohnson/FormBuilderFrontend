import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box, Container, Typography } from "@mui/material";

import './App.css';

import LoginForm from './pages/Auth/login/login.jsx';
import RegisterForm from './pages/Auth/register/register.jsx';
import DefaultForm from "./Forms/DefaultForm.jsx";
import DisplayForm from "./DisplayForm/DisplayForm.jsx";
import FormsList from "./pages/FormsList.jsx";
import FormDataPage from "./pages/FormDataPage.jsx";
import FormBuilder from "./pages/FormBuilder.jsx";
import LandingPage from "./pages/LandingPage.jsx"; // <-- 1. IMPORT LANDING PAGE

function App() {
  const [authView, setAuthView] = useState("login");
  const [loggedIn, setLoggedIn] = useState(null);
  const [userOrg, setUserOrg] = useState(null); // <- store user's organization

  console.log("My API URL is:", import.meta.env.VITE_API_URL);

  // Check authentication and get organization
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/check-auth`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}` 
          },
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

        {/* 2. NEW ROOT ROUTE: PUBLIC LANDING PAGE */}
        <Route
          path="/"
          element={
            loggedIn && userOrg ? (
              <Navigate to={`/${userOrg}`} />
            ) : (
              <LandingPage setAuthView={setAuthView} />
            )
          }
        />

        {/* 3. DEDICATED LOGIN/REGISTER ROUTE */}
        <Route
          path="/login"
          element={
            loggedIn && userOrg ? (
              <Navigate to={`/${userOrg}`} />
            ) : (
              authView === "login" ? (
                <LoginForm
                  setAuthView={setAuthView}
                  setLoggedIn={setLoggedIn}
                  setUserOrg={setUserOrg}
                />
              ) : (
                <RegisterForm setAuthView={setAuthView} />
              )
            )
          }
        />

        {/* ORG FORMS LIST */}
        <Route
          path="/:orgName"
          element={
            loggedIn ? <FormsList setLoggedIn={setLoggedIn} /> : <Navigate to="/login" />
          }
        />

        {/* DEV FORM */}
        <Route path="/dev-form" element={<DefaultForm />} />
        
        {/* PROTECTED FORM BUILDER */}
        <Route 
          path="/form-builder" 
          element={
            loggedIn && userOrg ? (
              <FormBuilder setLoggedIn={setLoggedIn} organization={userOrg} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* PUBLIC FORM RESPONDER */}
        <Route path="/form/:formId" element={<DisplayForm />} />

        {/* INDIVIDUAL FORM DATA PAGE */}
        <Route
          path="/:orgName/:formId"
          element={
            loggedIn ? <FormDataPage setLoggedIn={setLoggedIn} /> : <Navigate to="/login" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;