import './Korisnik.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { removeToken, getToken } from '../utils/token';
import Navbar from "../components/Navbar";

const Korisnik = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [sectionName, setSectionName] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [leadingSections, setLeadingSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetMessage, setResetMessage] = useState(null);
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
              const sectionDataRes = await sectionResponse.json();
              setSectionName(sectionDataRes.name);
              setSectionData(sectionDataRes);
            }
          }

          // Ako korisnik vodi sekcije, dohvati njihove podatke
          if (data.leadingSectionIds && data.leadingSectionIds.length > 0) {
            const sectionsPromises = data.leadingSectionIds.map(sectionId =>
              fetch(`${backendBase}/api/sections/${sectionId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              }).then(res => res.ok ? res.json() : null)
            );

            const sectionsData = await Promise.all(sectionsPromises);
            setLeadingSections(sectionsData.filter(section => section !== null));
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
      case 'ADMIN':
        return 'Administrator';
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

  const handleResetPoints = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${backendBase}/api/users/points/reset`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setResetMessage({ type: 'success', text: 'Bodovi su uspješno resetirani' });
        setTimeout(() => setResetMessage(null), 3000);
      } else {
        console.error('Neuspješno resetiranje bodova');
        setResetMessage({ type: 'error', text: 'Greška pri resetiranju bodova' });
        setTimeout(() => setResetMessage(null), 3000);
      }
    } catch (error) {
      console.error('Greška pri slanju zahtjeva:', error);
      setResetMessage({ type: 'error', text: 'Greška pri resetiranju bodova' });
      setTimeout(() => setResetMessage(null), 3000);
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
                </div>

                <div className="korisnik-data-column">
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Email:</span>
                    <span className="korisnik-value">{userData.email}</span>
                  </div>
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Uloga:</span>
                    <span className="korisnik-value">{getRoleName(userData.role)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="korisnik-no-data">Nema podataka o korisniku.</p>
            )}
          </div>
        </div>

        {userData && userData.role !== 'PROFESSOR' && userData.role !== 'ADMIN' && (
          <div className="korisnik-card">
            <div className="korisnik-card-header">
              <h2>Moja aktivnost</h2>
            </div>
            <div className="korisnik-card-body">
              <div className="korisnik-data-grid">
                <div className="korisnik-data-column">
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Sekcija:</span>
                    <span className="korisnik-value">{sectionName || "Nije upisana"}</span>
                  </div>
                </div>
                <div className="korisnik-data-column">
                  <div className="korisnik-data-item">
                    <span className="korisnik-label">Bodovi:</span>
                    {!userData.sectionId ? (
                      <span className="korisnik-value">—</span>
                    ) : (
                      <span
                        className={`korisnik-value ${sectionData && userData.currentPoints >= sectionData.passingPoints ? 'passing' : ''
                          }`}
                      >
                        {userData.currentPoints ?? 0} / {sectionData?.passingPoints ?? 0}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {userData && leadingSections.length > 0 && (
          <div className="korisnik-card">
            <div className="korisnik-card-header">
              <h2>Voditelj sekcija</h2>
            </div>
            <div className="korisnik-card-body">
              <div className="leading-sections-list">
                {leadingSections.map((section) => (
                  <div key={section.id} className="leading-section-item">
                    <span className="section-name">{section.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {userData && (userData.role === 'PROFESSOR' || userData.role === 'ADMIN') && (
          <div className="korisnik-card">
            <div className="korisnik-card-body reset-points-section">
              <div className="reset-points-content">
                <p className="reset-points-text">
                  Postavi svim studentima broj bodova na nula. Akcija koja se smije provoditi samo početkom novog semestra.
                </p>
                <button
                  className="reset-points-btn"
                  onClick={handleResetPoints}
                >
                  Resetiraj bodove
                </button>
              </div>
              {resetMessage && (
                <div className={`reset-message reset-message-${resetMessage.type}`}>
                  {resetMessage.text}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Korisnik;