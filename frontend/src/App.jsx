import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import './App.css'
import Login from "./components/Login";
import LoginCallback from "./components/LoginCallback";
import Home from "./components/Home";
import Bike from './components/Bike';
import Sekcija from './components/Sekcija';
import Prijave from './components/Prijave';
import MojePrijave from './components/MojePrijave';
import Korisnik from './components/Korisnik';
import Treninzi from './components/Treninzi';
import SectionCreate from './components/SectionCreate';
import Konzultacije from './components/konzultacije';
import Users from './components/Users';
import { hasToken, removeToken, getToken } from './utils/token';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const backendBase = import.meta.env.VITE_API_BASE_URL;

  // Provjera autentifikacije pri učitavanju aplikacije koristeći Bearer token iz localStorage
  useEffect(() => {
    const checkAuth = async () => {
      // Provjeri postoji li token u localStorage
      if (!hasToken()) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const token = getToken();

        // Pokušaj dohvatiti korisničke podatke s tokenom
        const response = await fetch(`${backendBase}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('user', JSON.stringify(data));
          setIsAuthenticated(true);
        } else {
          // Token je nevažeći ili istekao - ukloni ga
          removeToken();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Greška pri provjeri autentifikacije:', error);
        removeToken();
        setIsAuthenticated(false);
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
    removeToken();
  };

  // Protected routing will be handled inline below based on isAuthenticated

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

        {/* OAuth callback ruta */}
        <Route
          path="/login/callback"
          element={<LoginCallback onAuthenticate={handleAuthentication} />}
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

        <Route
          path="/sekcija"
          element={
            isAuthenticated ? (
              <Sekcija onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/prijave"
          element={
            isAuthenticated ? (
              <Prijave onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/prijave/moje"
          element={
            isAuthenticated ? (
              <MojePrijave />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/korisnik"
          element={
            isAuthenticated ? (
              <Korisnik onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/treninzi"
          element={
            isAuthenticated ? (
              <Treninzi onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/sectionCreate"
          element={
            isAuthenticated ? (
              <SectionCreate onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/konzultacije"
          element={
            isAuthenticated ? (
              <Konzultacije onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/users"
          element={
            isAuthenticated ? (
              <Users onLogout={handleLogout} />
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
