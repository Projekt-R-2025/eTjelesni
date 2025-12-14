import { useState } from "react";
import './Oglasnaploca.css'
import initialData from './podatci.js';

function Oglasnaploca({ onAdHover }) {
    const [data, setData] = useState(initialData);
    const [selectedId, setSelectedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');

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
    }

    function addAd() {
        const newId = data.length > 0 ? Math.max(...data.map(o => o.id)) + 1 : 1;
        const newAd = {
            id: newId,
            title: newTitle,
            description: newDescription,
            A: "Point A not entered",
            B: "Point B not entered",
            selected: false
        };
        setData([...data, newAd]);
        closeForm();
    }



    return (
        <>
            <h1 className="naslov">Notice Board</h1>
            {showForm && (
                <div className="forma-overlay">
                    <div className="forma">
                        <h2>New Ad</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Description"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                        />
                        <button onClick={addAd}>Save</button>
                        <button onClick={closeForm}>Cancel</button>
                    </div>
                </div>
            )}
            <div className="obrub">
                <div className="oglasna-grid">
                    {data.map((ad) => (
                        <div
                            key={ad.id}
                            className="oglas-item"
                            onMouseEnter={() => onAdHover(ad)}
                            onMouseLeave={() => onAdHover(null)}>
                            <h3>{ad.title}</h3>
                            <p>{ad.description}</p>
                            {/* Display points A and B */}
                            <p><strong>Point A:</strong> {ad.A}</p>
                            <p><strong>Point B:</strong> {ad.B}</p>

                            {selectedId === null ? (
                                <button onClick={() => joinGroup(ad.id)}>
                                    Join
                                </button>
                            ) : selectedId === ad.id ? (
                                <button onClick={leaveGroup}>
                                    Leave Group
                                </button>
                            ) : null}
                        </div>
                    ))}
                </div>
                <button className="tipkaZaDodavanje" onClick={openForm}>+</button>
            </div>
        </>
    );
}

export default Oglasnaploca;
