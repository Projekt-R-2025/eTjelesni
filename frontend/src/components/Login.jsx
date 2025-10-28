import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onAuthenticate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const images = [
    '/images/login1.png',
    '/images/login2.png',
    '/images/login3.png',
    '/images/login4.png',
    '/images/login5.png'
  ];

  // Za rotiranje slika (4 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(intervalId);
  }, [images.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ovdje je potreban API za backend...
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          lozinka: password
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('Prijava uspješna:', data.user);
        
        // Spremi user data u sessionStorage
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Poziv na handler za autentifikaciju i navigate
        onAuthenticate();
        navigate('/home');
      } else {
        setError(data.message || 'Greška prilikom prijave');
      }
    } catch (err) {
      setError('Došlo je do greške prilikom komunikacije sa serverom');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="row g-0 h-100">
        {/* Livo - Login form */}
        <div className="col-lg-5 col-md-6 d-flex align-items-center justify-content-center bg-white">
          <div className="login-form-wrapper">
            
            <form onSubmit={handleSubmit}>
              {/* Error message */}
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}

              {/* Email input */}
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Unesi korisničko ime"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="mb-4">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Unesi lozinku"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Login button */}
              <button 
                type="submit" 
                className="btn btn-login w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Učitavanje...
                  </>
                ) : (
                  'Prijava'
                )}
              </button>
            </form>

            {/* Dodatno */}
            <div className="mt-4 text-center">
              <small className="text-muted">
                Koristi kredencijale za studentsku autentifikaciju
              </small>
            </div>
          </div>
        </div>

        {/* Desno - Images */}
        <div className="col-lg-7 col-md-6 position-relative overflow-hidden">
          <div className="image-carousel">
            {images.map((image, index) => (
              <div
                key={index}
                className={`carousel-image ${
                  index === currentImageIndex ? 'active' : ''
                }`}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;