import './Korisnik.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { removeToken, getToken } from '../utils/token';
import Navbar from "../components/Navbar";

const Korisnik = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [sectionName, setSectionName] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const backendBase = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getToken();

        const response = await fetch(`${backendBase}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          localStorage.setItem('user', JSON.stringify(data));

          // Ako korisnik ima sekciju, dohvati naziv sekcije
          if (data.sectionId) {
            const sectionResponse = await fetch(`${backendBase}/api/sections/${data.sectionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            if (sectionResponse.ok) {
              const sectionData = await sectionResponse.json();
              setSectionName(sectionData.name);
            }
          }
        } else {
          console.error('Neuspješno dohvaćanje korisničkih podataka');
          removeToken();
          navigate('/');
        }

      } catch (error) {
        console.error('Greška pri dohvaćanju korisničkih podataka:', error);
        removeToken();
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, backendBase]);

  // Mapiranje role na hrvatski
  const getRoleName = (role) => {
    switch (role) {
      case 'PROFESSOR':
        return 'Profesor';
      case 'LEADER':
        return 'Voditelj';
      case 'STUDENT':
        return 'Student';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="korisnik-page">
        <Navbar onLogout={onLogout} />
        <div className="loading-container">
          <p>Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="korisnik-page">
      <Navbar onLogout={onLogout} />

      <main className="korisnik-content">
        <div className="korisnik-card">
          <div className="korisnik-card-header">
            <h2>Korisnički podaci</h2>
          </div>
          
          <div className="korisnik-card-body">
            {userData ? (
              <div className="korisnik-data-grid">
                <div className="korisnik-data-column">
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Ime:</span>
                    <span className="korisnik-value">{userData.firstName}</span>
                  </div>
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Prezime:</span>
                    <span className="korisnik-value">{userData.lastName}</span>
                  </div>
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Email:</span>
                    <span className="korisnik-value">{userData.email}</span>
                  </div>
                </div>

                <div className="korisnik-data-column">
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Uloga:</span>
                    <span className="korisnik-value">{getRoleName(userData.role)}</span>
                  </div>
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Bodovi:</span>
                    <span className="korisnik-value">{userData.currentPoints ?? 0}</span>
                  </div>
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Sekcija:</span>
                    <span className="korisnik-value">{sectionName || "Nije upisana"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="korisnik-no-data">Nema podataka o korisniku.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Korisnik;