import './Home.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

const Home = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const backendBase = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Dohvaćam korisničke podatke s backenda...');

        const response = await fetch(`${backendBase}/api/users/me`, {
          method: 'GET',
          credentials: 'include', // Šalje cookie automatski
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          localStorage.setItem('user', JSON.stringify(data));
        } else {
          // Ako ne može dohvatiti podatke, vrati na login
          console.error('Neuspješno dohvaćanje korisničkih podataka');
          navigate('/');
        }

      } catch (error) {
        console.error('Greška pri dohvaćanju korisničkih podataka:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, backendBase]);

  const handleLogout = async () => {
    try {
      console.log('Šaljem logout zahtjev...');

      // Pošalji logout zahtjev na backend da revokea token i obriše cookie
      const response = await fetch(`${backendBase}/api/logout`, {
        method: 'POST',
        credentials: 'include', // Šalje cookie automatski
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Logout response status:', response.status);

      if (!response.ok) {
        console.error('Logout nije uspio:', response.status, response.statusText);
      } else {
        console.log('Token uspješno revokean na backendu i cookie obrisan');
      }
    } catch (error) {
      console.error('Greška pri odjavi:', error);
    } finally {
      // Uvijek obriši lokalne podatke i odjavi korisnika
      localStorage.removeItem('user');
      onLogout();
      // Preusmjeri na login stranicu
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Učitavanje...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dobrodošli {userData?.firstName || 'Korisnik'}! </h1>
        <button className="btn">
            <Link to="/bike" className="nav-link">ZA DEV SVRHE: BIKE</Link>
        </button>
        <button
          className="btn btn-danger"
          onClick={handleLogout}
        >
          Odjavi se
        </button>
      </div>

      {/* Korisnički podaci */}
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Korisnički podaci</h5>
        </div>
        <div className="card-body">
          {userData ? (
            <div>
              <div className="mb-3">
                <strong>Ime:</strong>
                <p className="text-muted mb-0">{userData.firstName}</p>
              </div>
              <div className="mb-3">
                <strong>Prezime:</strong>
                <p className="text-muted mb-0">{userData.lastName}</p>
              </div>
              <div className="mb-3">
                <strong>Email:</strong>
                <p className="text-muted mb-0">{userData.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted">Učitavanje korisničkih podataka...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;