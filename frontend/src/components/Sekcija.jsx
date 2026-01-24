import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../utils/token";
import { formatTimestamp } from "../utils/formatters";
import Navbar from "../components/Navbar";
import "./Sekcija.css";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const Sekcija = ({ onLogout }) => {
    const navigate = useNavigate();
    
    // User state
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Section state
    const [currentSection, setCurrentSection] = useState(null);
    const [allSections, setAllSections] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    
    // Obavijesti state
    const [obavijesti, setObavijesti] = useState([]);
    const [loadingObavijesti, setLoadingObavijesti] = useState(false);
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingObavijest, setEditingObavijest] = useState(null);
    const [formData, setFormData] = useState({ title: "", body: "" });
    const [submitting, setSubmitting] = useState(false);
    
    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Dohvati korisnika
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = getToken();
                if (!token) {
                    navigate("/");
                    return;
                }

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
                } else {
                    navigate("/");
                }
            } catch (error) {
                console.error("Greška pri dohvaćanju korisnika:", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    // Dohvati sve sekcije (za profesora)
    useEffect(() => {
        if (userData?.role === "PROFESSOR") {
            const fetchAllSections = async () => {
                try {
                    const token = getToken();
                    const response = await fetch(`${backendBase}/api/sections`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setAllSections(data);
                    }
                } catch (error) {
                    console.error("Greška pri dohvaćanju sekcija:", error);
                }
            };
            fetchAllSections();
        }
    }, [userData]);

    // Dohvati sekciju korisnika (za studenta/leadera)
    useEffect(() => {
        if (userData && userData.role !== "PROFESSOR") {
            const sectionId = userData.role === "LEADER" 
                ? userData.leadingSectionIds?.[0] 
                : userData.sectionId;
            
            if (sectionId) {
                fetchSection(sectionId);
            }
        }
    }, [userData]);

    // Dohvati odabranu sekciju (za profesora)
    useEffect(() => {
        if (selectedSectionId) {
            fetchSection(selectedSectionId);
        }
    }, [selectedSectionId]);

    const fetchSection = async (sectionId) => {
        try {
            const token = getToken();
            const response = await fetch(`${backendBase}/api/sections/${sectionId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentSection(data);
                fetchObavijesti(sectionId);
            }
        } catch (error) {
            console.error("Greška pri dohvaćanju sekcije:", error);
        }
    };

    const fetchObavijesti = async (sectionId) => {
        try {
            setLoadingObavijesti(true);
            const token = getToken();
            const response = await fetch(`${backendBase}/api/notifications/section/${sectionId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setObavijesti(data);
            }
        } catch (error) {
            console.error("Greška pri dohvaćanju obavijesti:", error);
        } finally {
            setLoadingObavijesti(false);
        }
    };

    // Mapiranje tipa sekcije na sliku
    const getSectionBackground = (sectionType) => {
        const backgrounds = {
            'NOGOMET': '/images/nogomet.png',
            'RUKOMET': '/images/rukomet.png',
            'KOSARKA': '/images/kosarka.png',
            'ODBOJKA': '/images/odbojka.png',
            'PLIVANJE': '/images/plivanje.png',
            'TENIS': '/images/tenis.png',
            'OSTALO': '/images/ostalo.png'
        };
        return backgrounds[sectionType?.toUpperCase()] || '/images/ostalo.png';
    };

    // Provjeri može li korisnik uređivati obavijesti
    const canEdit = () => {
        if (!userData || !currentSection) return false;
        // Leader može uređivati samo svoju sekciju
        return userData.role === "LEADER" && userData.leadingSectionIds?.includes(currentSection.id);
    };

    // CRUD funkcije za obavijesti
    const handleNewObavijest = () => {
        setEditingObavijest(null);
        setFormData({ title: "", body: "" });
        setModalOpen(true);
    };

    const handleEdit = (obavijest) => {
        setEditingObavijest(obavijest);
        setFormData({ title: obavijest.title, body: obavijest.body });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingObavijest(null);
        setFormData({ title: "", body: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = getToken();
            let response;

            if (editingObavijest) {
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
                response = await fetch(`${backendBase}/api/notifications/section`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: formData.title,
                        body: formData.body,
                        sectionId: currentSection.id
                    })
                });
            }

            if (!response.ok) {
                throw new Error(editingObavijest ? "Greška pri uređivanju obavijesti" : "Greška pri dodavanju obavijesti");
            }

            await fetchObavijesti(currentSection.id);
            handleCloseModal();
        } catch (err) {
            console.error("Submit error:", err);
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = getToken();
            const response = await fetch(`${backendBase}/api/notifications/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Greška pri brisanju obavijesti");
            }

            await fetchObavijesti(currentSection.id);
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.message);
        }
    };

    // Profesor se vraća na grid
    const handleBackToGrid = () => {
        setCurrentSection(null);
        setSelectedSectionId(null);
        setObavijesti([]);
    };

    // Loading state
    if (loading) {
        return (
            <div className="sekcija-page">
                <Navbar onLogout={onLogout} />
                <div className="loading-container">
                    <p>Učitavanje...</p>
                </div>
            </div>
        );
    }

    // Korisnik nije u sekciji (STUDENT bez sekcije)
    if (userData?.role === "STUDENT" && !userData?.sectionId) {
        return (
            <div className="sekcija-page">
                <Navbar onLogout={onLogout} />
                <div className="no-section-container">
                    <div className="no-section-message">
                        <h2>Niste član nijedne sekcije</h2>
                        <p>Prijavite se na neku od dostupnih sportskih sekcija.</p>
                        <Link to="/prijave" className="btn-primary">
                            Idi na prijave
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // PROFESSOR - grid view za odabir sekcije
    if (userData?.role === "PROFESSOR" && !currentSection) {
        return (
            <div className="sekcija-page">
                <Navbar onLogout={onLogout} />
                <main className="sekcija-content">
                    <h1 className="sekcija-title">Odaberite sekciju</h1>
                    <div className="sections-grid">
                        {allSections.map((section) => (
                            <div 
                                key={section.id} 
                                className="section-card"
                                onClick={() => setSelectedSectionId(section.id)}
                                style={{
                                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${getSectionBackground(section.sectionType)})`
                                }}
                            >
                                <h3>{section.name}</h3>
                                <span className="section-type">{section.sectionType}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // Prikaz sekcije s obavijestima
    return (
      <div className="sekcija-page">
        <Navbar onLogout={onLogout} />

        <main
          className="sekcija-content with-background"
          style={{
            backgroundImage: `url(${getSectionBackground(currentSection?.sectionType)})`,
          }}
        >
          {/* Header s naslovom i back buttonom */}
          <div className="sekcija-header">
            {userData?.role === "PROFESSOR" && (
              <button className="btn-back-to-grid" onClick={handleBackToGrid}>
                ← Natrag
              </button>
            )}
            <h1 className="sekcija-naslov">{currentSection?.name}</h1>
          </div>

          {/* Loading obavijesti */}
          {loadingObavijesti && (
            <div className="loading-container">
              <p>Učitavanje obavijesti...</p>
            </div>
          )}

          {/* Prazno stanje */}
          {!loadingObavijesti && obavijesti.length === 0 && (
            <div className="no-obavijesti">
              <p>Nema obavijesti za ovu sekciju.</p>
            </div>
          )}

          {/* Lista obavijesti */}
          {!loadingObavijesti &&
            obavijesti.map((o) => (
              <div key={o.id} className="obavijest-card">
                <h3>{o.title}</h3>
                <p>{o.body}</p>
                <span className="obavijest-date">
                  {o.creator} | {formatTimestamp(o.createdAt)}
                </span>

                {canEdit() && (
                  <div className="obavijest-actions">
                    <button className="btn-edit" onClick={() => handleEdit(o)}>
                      Uredi
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => setDeleteConfirm(o.id)}
                    >
                      Obriši
                    </button>
                  </div>
                )}

                {deleteConfirm === o.id && (
                  <div className="delete-confirm">
                    <p>Jeste li sigurni da želite obrisati ovu obavijest?</p>
                    <button
                      className="btn-confirm-yes"
                      onClick={() => handleDelete(o.id)}
                    >
                      Da, obriši
                    </button>
                    <button
                      className="btn-confirm-no"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Odustani
                    </button>
                  </div>
                )}
              </div>
            ))}

          {/* Dodaj obavijest button (samo za leadera) */}
          {canEdit() && (
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
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="Unesite naslov obavijesti"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="body">Tekst obavijesti</label>
                  <textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({ ...formData, body: e.target.value })
                    }
                    required
                    placeholder="Unesite tekst obavijesti"
                    rows={5}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCloseModal}
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Spremanje..."
                      : editingObavijest
                        ? "Spremi promjene"
                        : "Dodaj obavijest"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
};

export default Sekcija;