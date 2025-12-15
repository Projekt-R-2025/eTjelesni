import React, { useState, useCallback, useEffect } from 'react';
import {
    GoogleMap,
    LoadScript,
    DirectionsService,
    DirectionsRenderer,
} from '@react-google-maps/api';

import './Bike.css';
import initialData from './podatci.js';

function Bike() {
    const [hoveredAd, setHoveredAd] = useState(null);

    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [responseError, setResponseError] = useState(null);

    const [data, setData] = useState(initialData);
    const [selectedId, setSelectedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPointA, setNewPointA] = useState('');
    const [newPointB, setNewPointB] = useState('');

    const containerStyle = { width: '100%', height: '400px' };
    const center = { lat: 45.815, lng: 15.9819 };

    const directionsCallback = useCallback((response) => {
        if (response !== null) {
            if (response.status === 'OK') {
                setDirectionsResponse(response);
                setResponseError(null);
            } else {
                setResponseError('Nije moguće pronaći rutu.');
            }
        }
    }, []);

    useEffect(() => {
        setDirectionsResponse(null);
        setResponseError(null);
    }, [hoveredAd]);

    function joinGroup(id) {
        setSelectedId(id);
    }

    function leaveGroup() {
        setSelectedId(null);
    }

    function openForm() {
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setNewTitle('');
        setNewDescription('');
        setNewPointA('');
        setNewPointB('');
    }

    function addAd() {
        const newId = data.length > 0 ? Math.max(...data.map((o) => o.id)) + 1 : 1;
        const newAd = {
            id: newId,
            title: newTitle,
            description: newDescription,
            A: newPointA || 'Point A not entered',
            B: newPointB || 'Point B not entered',
            selected: false,
        };
        setData([...data, newAd]);
        closeForm();
    }

    return (
        <>
            <div className="mapaOkvir">
                <div className='mapa'>
                    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
                            {hoveredAd && hoveredAd.A && hoveredAd.B && (
                                <DirectionsService
                                    options={{
                                        origin: hoveredAd.A,
                                        destination: hoveredAd.B,
                                        travelMode: 'DRIVING',
                                    }}
                                    callback={directionsCallback}
                                />
                            )}
                            {directionsResponse && (
                                <DirectionsRenderer directions={directionsResponse} />
                            )}
                        </GoogleMap>
                    </LoadScript>
                    {responseError && <p className="error">{responseError}</p>}
                </div>
            </div>
            <h1 className="naslov">🚴🏼 OGLASNA PLOČA 🚴🏼</h1>
            <div className="obrub">
                <div className="oglasna-grid">
                    {data.map((ad) => (
                        <div
                            key={ad.id}
                            className="oglas-item"
                            onMouseEnter={() => setHoveredAd(ad)}
                            onMouseLeave={() => setHoveredAd(null)}
                        >
                            <h3 className='naslovOglasa'>{ad.title}</h3>
                            <p>{ad.description}</p>
                            <p>
                                <strong>📍A:</strong> {ad.A}
                            </p>
                            <p>
                                <strong>📍B:</strong> {ad.B}
                            </p>
                            <div className='pridruziSe'>
                                {selectedId === null ? (
                                    <button onClick={() => joinGroup(ad.id)}>Pridruži se</button>
                                ) : selectedId === ad.id ? (
                                    <button onClick={leaveGroup}>Napusti grupu</button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="tipkaZaDodavanje" onClick={openForm}>
                    +
                </button>
            </div>


            {showForm && (
                <div className="forma-overlay">
                    <div className="forma">
                        <h2>Novi oglas</h2>
                        <input
                            type="text"
                            placeholder="Naslov"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Opis"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="📍 Polazište (A)"
                            value={newPointA}
                            onChange={(e) => setNewPointA(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="📍 Destinacija (B)"
                            value={newPointB}
                            onChange={(e) => setNewPointB(e.target.value)}
                        />
                        <button onClick={addAd}>Spremi</button>
                        <button onClick={closeForm}>Odustani</button>
                    </div>
                </div>
            )}

        </>
    )
}

export default Bike