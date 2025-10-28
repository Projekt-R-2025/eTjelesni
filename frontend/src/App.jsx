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
/* import Bike from './components/Bike'; */

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //Provjera autentifikacije pri ucitavanju
  useEffect(() => {
    const checkAuth = () => {
      const userStr = sessionStorage.getItem("user");
      setIsAuthenticated(!!userStr);
    };
    checkAuth();
  }, []);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("user");
  };

  // Komponenta za zasticene rute
  const ProtectedRoute = ({ children }) => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      return <Navigate to="/" />;
    }
    return children;
  };

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
            <ProtectedRoute>
              <Home onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />


      </Routes>
    </Router>
  );
}

export default App
