import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../utils/token";
import Navbar from "../components/Navbar";
import "./Home.css";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const Home = ({ onLogout }) => {
    // User state
    const [userData, setUserData] = useState(null);
    
    // Obavijesti state
    const [obavijesti, setObavijesti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingObavijest, setEditingObavijest] = useState(null);
    const [formData, setFormData] = useState({ title: "", body: "" });
    const [submitting, setSubmitting] = useState(false);
    
    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const isJoined = Boolean(userData?.sectionId);
    const canEdit = userData?.role === "PROFESSOR";

    // Dohvati korisnika
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = getToken();
                if (!token) return;

                const response = await fetch(`${backendBase}/api/users/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                }
            } catch (error) {
                console.error("Greška pri dohvaćanju korisnika:", error);
            }
        };

        fetchUserData();
    }, []);

    // Dohvati generalne obavijesti
    const fetchObavijesti = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();
            
            const response = await fetch(`${backendBase}/api/notifications/general`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Greška pri dohvaćanju obavijesti");
            }

            const data = await response.json();
            setObavijesti(data);
        } catch (err) {
            console.error("Fetch obavijesti error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchObavijesti();
    }, []);

    // Otvori modal za novu obavijest
    const handleNewObavijest = () => {
        setEditingObavijest(null);
        setFormData({ title: "", body: "" });
        setModalOpen(true);
    };

    // Otvori modal za uređivanje
    const handleEdit = (obavijest) => {
        setEditingObavijest(obavijest);
        setFormData({ title: obavijest.title, body: obavijest.body });
        setModalOpen(true);
    };

    // Zatvori modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingObavijest(null);
        setFormData({ title: "", body: "" });
    };

    // Submit forme (dodaj ili uredi)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = getToken();
            let response;

            if (editingObavijest) {
                // PUT - uređivanje postojeće obavijesti
                response = await fetch(`${backendBase}/api/notifications/${editingObavijest.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: formData.title,
                        body: formData.body
                    })
                });
            } else {
                // POST - nova obavijest
                response = await fetch(`${backendBase}/api/notifications/general`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: formData.title,
                        body: formData.body
                    })
                });
            }

            if (!response.ok) {
                throw new Error(editingObavijest ? "Greška pri uređivanju obavijesti" : "Greška pri dodavanju obavijesti");
            }

            // Ponovno dohvati obavijesti
            await fetchObavijesti();
            handleCloseModal();
        } catch (err) {
            console.error("Submit error:", err);
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Brisanje obavijesti
    const handleDelete = async (id) => {
        try {
            const token = getToken();
            
            const response = await fetch(`${backendBase}/api/notifications/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Greška pri brisanju obavijesti");
            }

            // Ponovno dohvati obavijesti
            await fetchObavijesti();
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.message);
        }
    };

    return (
        <div className="home-page">
            <Navbar onLogout={onLogout} />

            {/* HOME CONTENT */}
            <main className="home-content">
                
                {/* Loading state */}
                {loading && (
                    <div className="loading-container">
                        <p>Učitavanje obavijesti...</p>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="error-container">
                        <p>Greška: {error}</p>
                        <button onClick={fetchObavijesti} className="btn-retry">
                            Pokušaj ponovno
                        </button>
                    </div>
                )}

                {/* Obavijesti lista */}
                {!loading && !error && obavijesti.length === 0 && (
                    <div className="no-obavijesti">
                        <p>Nema obavijesti za prikaz.</p>
                    </div>
                )}

                {!loading && !error && obavijesti.map(o => (
                    <div key={o.id} className="obavijest-card">
                        <h3>{o.title}</h3>
                        <p>{o.body}</p>
                        <span className="obavijest-date">
                            {new Date(o.createdAt).toLocaleDateString('hr-HR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>

                        {canEdit && (
                            <div className="obavijest-actions">
                                <button className="btn-edit" onClick={() => handleEdit(o)}>
                                    Uredi
                                </button>
                                <button className="btn-delete" onClick={() => setDeleteConfirm(o.id)}>
                                    Obriši
                                </button>
                            </div>
                        )}

                        {/* Delete confirmation */}
                        {deleteConfirm === o.id && (
                            <div className="delete-confirm">
                                <p>Jeste li sigurni da želite obrisati ovu obavijest?</p>
                                <button className="btn-confirm-yes" onClick={() => handleDelete(o.id)}>
                                    Da, obriši
                                </button>
                                <button className="btn-confirm-no" onClick={() => setDeleteConfirm(null)}>
                                    Odustani
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {canEdit && (
                    <button className="btn-add-obavijest" onClick={handleNewObavijest}>
                        + Nova obavijest
                    </button>
                )}
            </main>

            {/* Modal za dodavanje/uređivanje obavijesti */}
            {modalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingObavijest ? "Uredi obavijest" : "Nova obavijest"}</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Naslov</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="Unesite naslov obavijesti"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="body">Tekst obavijesti</label>
                                <textarea
                                    id="body"
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    required
                                    placeholder="Unesite tekst obavijesti"
                                    rows={5}
                                />
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Odustani
                                </button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? "Spremanje..." : (editingObavijest ? "Spremi promjene" : "Dodaj obavijest")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!isJoined && (
                <Link to="/prijave" className="btn-prijavi-se">
                    PRIJAVI SE
                </Link>
            )}
        </div>
    );
};

export default Home;