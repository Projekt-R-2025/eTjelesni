import './Home.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Učitaj podatke iz localStorage
    const userStr = localStorage.getItem('user');

    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        console.log('Šaljem logout zahtjev sa tokenom:', token.substring(0, 20) + '...');

        // Pošalji logout zahtjev na backend da revokea token
        const response = await fetch('http://localhost:8080/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Logout response status:', response.status);

        if (!response.ok) {
          console.error('Logout nije uspio:', response.status, response.statusText);
        } else {
          console.log('Token uspješno revokean na backendu');
        }
      }
    } catch (error) {
      console.error('Greška pri odjavi:', error);
    } finally {
      // Uvijek obriši lokalne podatke i odjavi korisnika
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      onLogout();
      // Preusmjeri na login stranicu
      navigate('/');
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dobrodošli {userData?.firstName || 'Korisnik'}! 🏐</h1>
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