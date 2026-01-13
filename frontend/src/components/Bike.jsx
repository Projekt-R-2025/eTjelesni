import React, { useState, useEffect } from 'react';

import './Bike.css';
import { getToken } from '../utils/token.js';

function Bike() {
    const [data, setData] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPointA, setNewPointA] = useState('');
    const [newPointB, setNewPointB] = useState('');
    const [newCapacity, setNewCapacity] = useState('');
    const [newPoints, setNewPoints] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');
    const [bikeSectionId, setBikeSectionId] = useState(null);

    useEffect(() => {
        const fetchBikeSectionAndSessions = async () => {
            try {
                const token = getToken();
                const response = await fetch('http://localhost:8080/api/sections', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const sections = await response.json();
                    const bikeSection = sections.find(section => section.sectionType === 'BIKE');

                    if (bikeSection) {
                        setBikeSectionId(bikeSection.id);
                        console.log('Bike section ID:', bikeSection.id);

                        // Dohvati notifikacije za BIKE sekciju
                        const notificationsResponse = await fetch(`http://localhost:8080/api/notifications/section/${bikeSection.id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (notificationsResponse.ok) {
                            const notificationsData = await notificationsResponse.json();
                            setNotifications(notificationsData);
                            console.log('Loaded notifications:', notificationsData);
                        }

                        // Dohvati sve sesije za BIKE sekciju
                        const sessionsResponse = await fetch(`http://localhost:8080/api/sessions/section/${bikeSection.id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (sessionsResponse.ok) {
                            const sessions = await sessionsResponse.json();
                            const formattedData = sessions.map(session => ({
                                id: session.id,
                                title: session.title,
                                description: session.description,
                                A: session.startLocation,
                                B: session.endLocation,
                                capacity: session.capacity,
                                points: session.points,
                                startTime: session.startTime,
                                endTime: session.endTime,
                                selected: false
                            }));
                            setData(formattedData);
                            console.log('Loaded sessions:', formattedData);
                        }
                    } else {
                        console.log('No BIKE section found');
                    }
                } else {
                    console.error('Failed to fetch sections:', response.status);
                }
            } catch (error) {
                console.error('Error fetching bike section:', error);
            }
        };

        fetchBikeSectionAndSessions();
    }, []);

    function joinGroup(id) {
        setData(prevData => prevData.map(ad =>
            ad.id === id ? { ...ad, capacity: ad.capacity - 1 } : ad
        ));
        setSelectedId(id);
    }

    function leaveGroup() {
        setData(prevData => prevData.map(ad =>
            ad.id === selectedId ? { ...ad, capacity: ad.capacity + 1 } : ad
        ));
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
        setNewCapacity('');
        setNewPoints('');
        setNewStartTime('');
        setNewEndTime('');
    }

    async function addAd() {
        if (!bikeSectionId) {
            console.error('Bike section ID not found');
            alert('Greška: Bike sekcija nije pronađena');
            return;
        }

        try {
            const token = getToken();
            const sessionData = {
                title: newTitle,
                description: newDescription,
                capacity: parseInt(newCapacity) || 10,
                points: parseInt(newPoints) || 0,
                startTime: newStartTime ? new Date(newStartTime).toISOString() : null,
                endTime: newEndTime ? new Date(newEndTime).toISOString() : null,
                startLocation: newPointA || 'Point A not entered',
                endLocation: newPointB || 'Point B not entered',
                sectionId: bikeSectionId
            };

            const response = await fetch('http://localhost:8080/api/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (response.ok) {
                const newSession = await response.json();
                console.log('Session created:', newSession);

                // Dodaj u lokalni state za prikaz
                const newAd = {
                    id: newSession.id,
                    title: newSession.title,
                    description: newSession.description,
                    A: newSession.startLocation,
                    B: newSession.endLocation,
                    capacity: newSession.capacity,
                    points: newSession.points,
                    startTime: newSession.startTime,
                    endTime: newSession.endTime,
                    selected: false,
                };
                setData([...data, newAd]);
                closeForm();
            } else {
                console.error('Failed to create session:', response.status);
                alert('Greška pri kreiranju treninga');
            }
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    }

    function openGoogleMaps(pointA, pointB) {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pointA)}&destination=${encodeURIComponent(pointB)}&travelmode=walking`;
        window.open(url, '_blank');
    }

    return (
        <>

            <div className="obrub">
                <div className="obavijesti">
                    {notifications.map((note) => (
                        <div key={note.id} className="obavijest-item">
                            <h4>{note.title}</h4>
                            <p>{note.body}</p>
                        </div>
                    ))}
                </div>
                <div className="razdvojnik">
                    <div className="naslov">
                        <h1>🚴🏼 OGLASNA PLOČA 🚴🏼</h1>
                    </div>

                    <div className="oglasna-grid">
                        {data.map((ad) => (
                            <div
                                key={ad.id}
                                className="oglas-item"
                            >
                                <h3 className='naslovOglasa'>{ad.title}</h3>
                                <div className='info-detalji'>
                                    <div className='info-red'>
                                        <strong>📋 Opis:</strong>
                                        <span>{ad.description}</span>
                                    </div>
                                    <div className='info-red'>
                                        <strong>📍 Polazište:</strong>
                                        <span>{ad.A}</span>
                                    </div>
                                    <div className='info-red'>
                                        <strong>📍 Odredište:</strong>
                                        <span>{ad.B}</span>
                                    </div>
                                    <div className='info-red'>
                                        <strong>👥 Preostali apacitet:</strong>
                                        <span>{ad.capacity || 'N/A'}</span>
                                    </div>
                                    <div className='info-red'>
                                        <strong>⭐ Bodovi:</strong>
                                        <span>{ad.points || 0}</span>
                                    </div>
                                    {ad.startTime && (
                                        <div className='info-red'>
                                            <strong>🕐 Početak:</strong>
                                            <span>{new Date(ad.startTime).toLocaleString('hr-HR')}</span>
                                        </div>
                                    )}
                                    {ad.endTime && (
                                        <div className='info-red'>
                                            <strong>🏁 Završetak:</strong>
                                            <span>{new Date(ad.endTime).toLocaleString('hr-HR')}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    className='pregledajRutu'
                                    onClick={() => openGoogleMaps(ad.A, ad.B)}
                                >
                                    Prikaži rutu
                                </button>
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
                        <input
                            type="number"
                            placeholder="Kapacitet"
                            value={newCapacity}
                            onChange={(e) => setNewCapacity(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Bodovi"
                            value={newPoints}
                            onChange={(e) => setNewPoints(e.target.value)}
                        />
                        <input
                            type="datetime-local"
                            placeholder="Vrijeme početka"
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                        />
                        <input
                            type="datetime-local"
                            placeholder="Vrijeme završetka"
                            value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
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