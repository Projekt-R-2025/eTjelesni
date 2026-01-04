import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../utils/token';


const LoginCallback = ({ onAuthenticate }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = () => {
            try {
                // Backend preusmjerava na ovu stranicu s tokenom kao URL parametrom
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');

                if (token) {
                    // Spremimo token u localStorage
                    setToken(token);

                    // Obavijestimo App da je korisnik autentificiran
                    onAuthenticate();

                    // Preusmjeri na home
                    navigate('/home', { replace: true });
                } else {
                    // Ako nema tokena u URL-u, vrati na login
                    console.error('Token nije pronađen u URL-u nakon prijave');
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Greška pri obradi callback-a:', error);
                navigate('/', { replace: true });
            }
        };

        handleCallback();
    }, [navigate, onAuthenticate]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Autentifikacija u tijeku...</span>
            </div>
        </div>
    );
};

export default LoginCallback;
