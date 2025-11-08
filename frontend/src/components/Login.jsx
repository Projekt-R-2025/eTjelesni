import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onAuthenticate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const handleMicrosoftLogin = () => {
    // Api login
    const backendHost = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${backendHost}/api/login`;
  };

  return (
    <div className="login-container">
      <div className="row g-0 h-100">
        {/* Livo - Login form */}
        <div className="col-lg-5 col-md-6 d-flex align-items-center justify-content-center bg-white">
          <div className="login-form-wrapper">

            <div className="text-center mb-4">
              <h2 className="mb-2">eTjelesni</h2>
            </div>

            {/* Microsoft Login Button */}
            <button
              onClick={handleMicrosoftLogin}
              className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center"
              style={{ gap: '10px' }}
            >
              <i className="bi bi-microsoft" style={{ fontSize: '1.5rem' }}></i>
              Prijava s Microsoft računom
            </button>

            {/* Dodatno */}
            <div className="mt-4 text-center">
              <small className="text-muted">
                Koristite Vaš FER račun (@fer.hr) za prijavu
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
                className={`carousel-image ${index === currentImageIndex ? 'active' : ''
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