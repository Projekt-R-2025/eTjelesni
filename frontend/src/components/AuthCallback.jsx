import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = ({ onAuthenticate }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setCookie = async () => {
            const tokenId = searchParams.get('tokenId');

            if (!tokenId) {
                console.error('No tokenId found in URL');
                setError('Authentication failed: No token found');
                setLoading(false);
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            try {
                const backendHost = import.meta.env.VITE_API_BASE_URL;
                const response = await fetch(`${backendHost}/api/auth/set-cookie?tokenId=${tokenId}`, {
                    method: 'POST',
                    credentials: 'include', // Important: include cookies in the request
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Cookie has been set successfully
                    onAuthenticate();
                    navigate('/home', { replace: true });
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Failed to set cookie:', errorData);
                    setError('Authentication failed. Please try again.');
                    setLoading(false);
                    setTimeout(() => navigate('/'), 3000);
                }
            } catch (error) {
                console.error('Error setting cookie:', error);
                setError('Authentication failed. Please try again.');
                setLoading(false);
                setTimeout(() => navigate('/'), 3000);
            }
        };

        setCookie();
    }, [searchParams, navigate, onAuthenticate]);

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="text-center">
                {loading ? (
                    <>
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h4>Completing authentication...</h4>
                        <p className="text-muted">Please wait while we log you in.</p>
                    </>
                ) : error ? (
                    <>
                        <div className="alert alert-danger" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                        <p className="text-muted">Redirecting to login page...</p>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default AuthCallback;
