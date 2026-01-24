import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/token";
import Navbar from "../components/Navbar";
import "./Prijave.css";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const Prijave = () => {
  const [activeForm, setActiveForm] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Role request state
  const [roleReason, setRoleReason] = useState("");
  const [requestedSectionId, setRequestedSectionId] = useState("");

  // Application state
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [appReason, setAppReason] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" ili "error"

  // Requests (podnesene prijave)
  const [applications, setApplications] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);

  // Uklanja poruku nakon 3 sekunde
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Dohvati podatke o korisniku
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${backendBase}/api/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju korisnika:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Dohvat sekcija za APPLICATION i ROLE formu
  useEffect(() => {
    if (activeForm === "APPLICATION" || activeForm === "ROLE") {
      const fetchSections = async () => {
        try {
          const token = getToken();
          const response = await fetch(`${backendBase}/api/sections`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setSections(data);
          }
        } catch (error) {
          console.error("Greška pri dohvaćanju sekcija:", error);
        }
      };
      fetchSections();
    }
  }, [activeForm]);

  // Dohvat prijava za sekciju (LEADER)
  useEffect(() => {
    if (
      userData?.role === "LEADER" &&
      userData?.leadingSectionIds?.length > 0
    ) {
      const fetchApplications = async () => {
        try {
          const token = getToken();
          const response = await fetch(`${backendBase}/api/applications`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            // Zadrži sve statuse; filtriraj samo na sekcije koje voditelj vodi
            const leaderSectionIds = userData.leadingSectionIds || [];
            const filtered = data.filter((app) =>
              leaderSectionIds.includes(app.sectionId),
            );
            setApplications(filtered);
          }
        } catch (error) {
          console.error("Greška pri dohvaćanju prijava:", error);
        }
      };
      fetchApplications();
    }
  }, [userData]);

  // Dohvat zahtjeva za ulogu (PROFESSOR)
  useEffect(() => {
    if (userData?.role === "PROFESSOR") {
      const fetchRoleRequests = async () => {
        try {
          const token = getToken();
          const response = await fetch(`${backendBase}/api/role-requests`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            // Zadrži sve statuse; profesor vidi sve zahtjeve
            setRoleRequests(data);
          }
        } catch (error) {
          console.error("Greška pri dohvaćanju zahtjeva za ulogu:", error);
        }
      };
      fetchRoleRequests();
    }
  }, [userData]);

  // Submit zahtjeva za ulogu (LEADER)
  const submitRoleRequest = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      const res = await fetch(`${backendBase}/api/role-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userData.id,
          requestedRole: "LEADER",
          requestedSectionId: parseInt(requestedSectionId),
          reason: roleReason,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Greška kod slanja zahtjeva");
      }

      setMessage("Zahtjev za ulogu voditelja uspješno poslan.");
      setMessageType("success");
      setRoleReason("");
      setRequestedSectionId("");
      setActiveForm(null);
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  // Submit prijave na sekciju
  const submitApplication = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      const res = await fetch(`${backendBase}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userData.id,
          requestedSectionId: parseInt(sectionId),
          reason: appReason,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Greška kod prijave na sekciju");
      }

      setMessage("Uspješno ste se prijavili na sekciju.");
      setMessageType("success");
      setSectionId("");
      setAppReason("");
      setActiveForm(null);
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  // Approve/Reject application (LEADER)
  const approveApplication = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(`${backendBase}/api/applications/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewNote: "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Greška pri odobravanju prijave");
      }

      // Oznaci kao odobreno umjesto uklanjanja
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a)),
      );
    } catch (error) {
      console.error("Greška pri odobravanju prijave:", error.message);
    }
  };

  const rejectApplication = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(`${backendBase}/api/applications/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewNote: "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Greška pri odbijanju prijave");
      }

      // Oznaci kao odbijeno umjesto uklanjanja
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a)),
      );
    } catch (error) {
      console.error("Greška pri odbijanju prijave:", error.message);
    }
  };

  // Approve/Reject role request (PROFESSOR)
  const approveRoleRequest = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(`${backendBase}/api/role-requests/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewNote: "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Greška pri odobravanju zahtjeva");
      }

      // Oznaci kao odobreno umjesto uklanjanja
      setRoleRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)),
      );
    } catch (error) {
      console.error("Greška pri odobravanju zahtjeva:", error.message);
    }
  };

  const rejectRoleRequest = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(`${backendBase}/api/role-requests/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewNote: "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Greška pri odbijanju zahtjeva");
      }

      // Oznaci kao odbijeno umjesto uklanjanja
      setRoleRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)),
      );
    } catch (error) {
      console.error("Greška pri odbijanju zahtjeva:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="prijave-page">
        <div className="loading-container">
          <p>Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prijave-page">
      {/* HEADER */}
      <Navbar />

      <h1 className="page-title">
        {userData?.role === "STUDENT" ? "PRIJAVE" : userData?.role === "PROFESSOR" ? "PRIJAVE ZA VODITELJE SEKCIJA" : "PRIJAVE ZA ČLANSTVO U SEKCIJAMA"}
      </h1>

      {/* KARTICE ZA STUDENTE */}
      {userData?.role === "STUDENT" && !activeForm && (
        <div>
          <div className="cards-container">
            <div
              className="prijava-card"
              onClick={() => setActiveForm("ROLE")}
            >
              <div className="card-top">
                <p>ŽELIŠ BITI VODITELJ?</p>
                <span>PRIJAVI SE</span>
              </div>
              <div className="card-bottom image2" />
            </div>

            <div
              className="prijava-card"
              onClick={() => setActiveForm("APPLICATION")}
            >
              <div className="card-top">
                <p>ŽELIŠ BITI DIO NEKE SEKCIJE?</p>
                <span>PRIJAVI SE</span>
              </div>
              <div className="card-bottom image" />
            </div>
          </div>

          <div className="my-applications-cta">
            <button
              className="secondary-btn"
              type="button"
              onClick={() => navigate("/prijave/moje")}
            >
              Vidi moje prijave
            </button>
          </div>
        </div>
      )}

      {/* ROLE REQUEST FORMA */}
      {activeForm === "ROLE" && (
        <div className="form-page">
          <div className="form-card">
            <div className="form-card-header">
              <button className="card-back" onClick={() => setActiveForm(null)}>
                ← Nazad
              </button>
              <h2>Zahtjev za promjenu uloge</h2>
            </div>

            <form onSubmit={submitRoleRequest}>
              <label>
                <span>Željena uloga:</span>
                <input type="text" value="Voditelj" disabled />
              </label>

              <label>
                <span>Sekcija:</span>
                <select
                  value={requestedSectionId}
                  onChange={(e) => setRequestedSectionId(e.target.value)}
                  required
                >
                  <option value="">-- Odaberi sekciju --</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Razlog:</span>
                <textarea
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="primary-btn">
                Pošalji zahtjev
              </button>
            </form>
          </div>
        </div>
      )}

      {/* APPLICATION FORMA */}
      {activeForm === "APPLICATION" && (
        <div className="form-page">
          <div className="form-card">
            <div className="form-card-header">
              <button className="card-back" onClick={() => setActiveForm(null)}>
                ← Nazad
              </button>
              <h2>Prijava na sportsku sekciju</h2>
            </div>

            <form onSubmit={submitApplication}>
              <label>
                <span>Sekcija:</span>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  required
                >
                  <option value="">-- Odaberi sekciju --</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Razlog:</span>
                <textarea
                  value={appReason}
                  onChange={(e) => setAppReason(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="primary-btn">
                Pošalji prijavu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STRANICA ZA VODITELJE - pregled prijava na sekciju */}
      {userData?.role === "LEADER" && (
        <div>
          {/* Na čekanju */}
          <div className="approval-list">
            {applications.filter((a) => a.status === "PENDING").length ===
              0 ? (
              <p className="no-prijave">Nema prijava na čekanju.</p>
            ) : (
              applications
                .filter((a) => a.status === "PENDING")
                .map((a) => (
                  <div className="approval-card" key={a.id}>
                    <span className="approval-name">
                      {a.applicant?.firstName} {a.applicant?.lastName}
                    </span>
                    <span className="approval-section">
                      <span className="section-label">Sekcija:</span>
                      <span className="section-name">{a.sectionName || "-"}</span>
                    </span>
                    <span className="approval-reason">{a.reason}</span>
                    <div className="approval-actions">
                      <button
                        className="approve-btn"
                        onClick={() => approveApplication(a.id)}
                      >
                        ✓
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => rejectApplication(a.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Pregledane */}
          {applications.filter((a) => a.status !== "PENDING").length > 0 && (
            <div className="approval-list" style={{ marginTop: 24 }}>
              {applications
                .filter((a) => a.status !== "PENDING")
                .map((a) => (
                  <div className="approval-card" key={a.id}>
                    <span className="approval-name">
                      {a.applicant?.firstName} {a.applicant?.lastName}
                    </span>
                    <span className="approval-section">
                      <span className="section-label">Sekcija:</span>
                      <span className="section-name">{a.sectionName || "-"}</span>
                    </span>
                    <span className="approval-reason">{a.reason}</span>
                    <span
                      className={`status-badge status-${a.status?.toLowerCase()}`}
                    >
                      {a.status === "APPROVED" ? "ODOBRENO" : "ODBIJENO"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* STRANICA ZA PROFESORE - pregled zahtjeva za ulogu */}
      {userData?.role === "PROFESSOR" && (
        <div>
          {/* Na čekanju */}
          <div className="approval-list">
            {roleRequests.filter((r) => r.status === "PENDING").length ===
              0 ? (
              <p className="no-prijave">Nema zahtjeva na čekanju.</p>
            ) : (
              roleRequests
                .filter((r) => r.status === "PENDING")
                .map((r) => (
                  <div className="approval-card" key={r.id}>
                    <span className="approval-name">
                      {r.user?.firstName} {r.user?.lastName}
                    </span>
                    <span className="approval-section">
                      <span className="section-label">Sekcija:</span>
                      <span className="section-name">{r.requestedSectionName || "-"}</span>
                    </span>
                    <span className="approval-reason">{r.reason}</span>
                    <div className="approval-actions">
                      <button
                        className="approve-btn"
                        onClick={() => approveRoleRequest(r.id)}
                      >
                        ✓
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => rejectRoleRequest(r.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Pregledane */}
          {roleRequests.filter((r) => r.status !== "PENDING").length > 0 && (
            <div className="approval-list" style={{ marginTop: 24 }}>
              {roleRequests
                .filter((r) => r.status !== "PENDING")
                .map((r) => (
                  <div className="approval-card" key={r.id}>
                    <span className="approval-name">
                      {r.user?.firstName} {r.user?.lastName}
                    </span>
                    <span className="approval-section">
                      <span className="section-label">Sekcija:</span>
                      <span className="section-name">{r.requestedSectionName || "-"}</span>
                    </span>
                    <span className="approval-reason">{r.reason}</span>
                    <span
                      className={`status-badge status-${r.status?.toLowerCase()}`}
                    >
                      {r.status === "APPROVED" ? "ODOBRENO" : "ODBIJENO"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {message && <p className={`message message-${messageType}`}>{message}</p>}
    </div>
  );
};;

export default Prijave;