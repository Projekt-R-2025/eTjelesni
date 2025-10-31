import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallback = ({ onAuthenticate }) => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleOAuthCallback = () => {
            try {
                // Pročitaj URL parametre poslane od Spring Boot backenda
                const urlParams = new URLSearchParams(location.search);

                const token = urlParams.get('token');
                const id = urlParams.get('id');
                const firstName = urlParams.get('firstName');
                const lastName = urlParams.get('lastName');
                const email = urlParams.get('email');
                const role = urlParams.get('role');

                console.log('OAuth callback received:', { token, id, firstName, lastName, email, role });

                if (token && id && email) {
                    // Spremi korisničke podatke u localStorage
                    const userData = {
                        id: parseInt(id),
                        firstName: firstName || '',
                        lastName: lastName || '',
                        email: email,
                        role: role || 'USER'
                    };

                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('token', token);

                    console.log('OAuth login uspješan! Podaci spremljeni:', userData);

                    // Pozovi authentication handler
                    onAuthenticate();

                    // Redirect na home stranicu
                    navigate('/home');
                } else {
                    console.error('Nedostaju podaci:', { token, id, email });
                    setError('Greška: Nedostaju podaci za autentifikaciju');
                    setTimeout(() => navigate('/'), 3000);
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError('Došlo je do greške prilikom autentifikacije');
                setTimeout(() => navigate('/'), 3000);
            }
        };

        handleOAuthCallback();
    }, [navigate, onAuthenticate, location]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                {error ? (
                    <div className="alert alert-danger" role="alert">
                        <h4>Greška prilikom prijave</h4>
                        <p>{error}</p>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/')}
                        >
                            Povratak na prijavu
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Učitavanje...</span>
                        </div>
                        <p>Prijava u tijeku...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
