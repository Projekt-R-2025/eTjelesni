import React, { useState } from 'react';

import './Bike.css';
import initialData from './podatci.js';
import notifications from './notifications.js';

function Bike() {
    const [data, setData] = useState(initialData);
    const [selectedId, setSelectedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPointA, setNewPointA] = useState('');
    const [newPointB, setNewPointB] = useState('');

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
                            <p>{note.content}</p>
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
                                <p className='opis'>{ad.description}</p>
                                <p className='ruta'>
                                    <strong>📍A:</strong> {ad.A}
                                </p>
                                <p className='ruta'>
                                    <strong>📍B:</strong> {ad.B}
                                </p>
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
                        <button onClick={addAd}>Spremi</button>
                        <button onClick={closeForm}>Odustani</button>
                    </div>
                </div>
            )}

        </>
    )
}

export default Bike