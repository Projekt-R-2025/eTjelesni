import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import './App.css'         // Msn da nije potrebno vise
import Login from "./components/Login";
import Home from "./components/Home";
import Bike from './components/Bike';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const backendBase = import.meta.env.VITE_API_BASE_URL;

  // Check authentication on app load using cookie-based JWT (no localStorage trust)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${backendBase}/api/users/me`, {
          method: 'GET',
          credentials: 'include', // send cookie
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // optionally cache user locally, but do not rely on it for auth decisions
          const data = await response.json();
          localStorage.setItem('user', JSON.stringify(data));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Greška pri provjeri autentifikacije:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [backendBase]);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  // Protected routing will be handled inline below based on isAuthenticated

  if (isLoading) {
    return <div className="text-center mt-5"><p>Učitavanje...</p></div>;
  }

  return (
    <Router>
      <Routes>
        {/* Root route za autentifikaciju (Login) */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Login onAuthenticate={handleAuthentication} />
            )
          }
        />

        {/* Zasticene rute */}
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Home onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/bike"
          element={
            isAuthenticated ? (
              <Bike onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

      </Routes>

    </Router>
  );
}

export default App
