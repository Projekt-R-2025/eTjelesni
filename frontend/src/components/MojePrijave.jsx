import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../utils/token";
import { formatTimestamp } from "../utils/formatters";
import Navbar from "../components/Navbar";

import "./MojePrijave.css";
import "./Prijave.css";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const statusLabel = {
    PENDING: "U obradi",
    APPROVED: "Odobreno",
    REJECTED: "Odbijeno",
};

const MojePrijave = () => {
    const [applications, setApplications] = useState([]);
    const [roleRequests, setRoleRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = getToken();
                const res = await fetch(`${backendBase}/api/applications/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Greška pri dohvaćanju prijava.");
                const data = await res.json();
                setApplications(data);
            } catch (err) {
                setError(err.message || "Neočekivana greška.");
            }
        };

        const fetchRoleRequests = async () => {
            try {
                const token = getToken();
                const res = await fetch(`${backendBase}/api/role-requests/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Greška pri dohvaćanju zahtjeva za ulogu.");
                const data = await res.json();
                setRoleRequests(data);
            } catch (err) {
                setError(err.message || "Neočekivana greška.");
            }
        };

        const fetchData = async () => {
            await Promise.all([fetchApplications(), fetchRoleRequests()]);
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="moje-prijave-page">
                <div className="back-global">
                    <Link to="/prijave" className="back-btn">
                        ← Prijave
                    </Link>
                </div>

                <h1 className="page-title">MOJE PRIJAVE</h1>

                {loading && (
                    <div className="loading-container">
                        <p>Učitavanje...</p>
                    </div>
                )}

                {!loading && error && <p className="message">{error}</p>}



                {!loading && !error && (
                    <div className="data-block">
                        <h5>Prijave za članstvo u sekcijama:</h5>
                        <div className="my-applications-table-wrapper">
                            <table className="my-applications-table">
                                <thead>
                                    <tr>
                                        <th>Sekcija</th>
                                        <th>Razlog prijave</th>
                                        <th>Predano</th>
                                        <th>Odobravatelj</th>
                                        <th>Komentar</th>
                                        <th>Pregledano</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => {
                                        const statusClass = app.status ? app.status.toLowerCase() : "";

                                        return (
                                            <tr key={app.id}>
                                                <td>{app.sectionName || "-"}</td>
                                                <td>{app.reason || "-"}</td>
                                                <td>{formatTimestamp(app.createdAt)}</td>
                                                <td>{app.reviewer || "-"}</td>
                                                <td>{app.reviewNote || "-"}</td>
                                                <td>{app.reviewedAt ? formatTimestamp(app.reviewedAt) : "-"}</td>
                                                <td>
                                                    <p className={`status-chip status-${statusClass}`}>
                                                        {statusLabel[app.status] || app.status}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="data-block">
                        <h5>Prijave za voditelja sekcija:</h5>
                        <div className="my-applications-table-wrapper">
                            <table className="my-applications-table">
                                <thead>
                                    <tr>
                                        <th>Sekcija</th>
                                        <th>Razlog prijave</th>
                                        <th>Predano</th>
                                        <th>Odobravatelj</th>
                                        <th>Komentar</th>
                                        <th>Pregledano</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roleRequests.map((req) => {
                                        const statusClass = req.status ? req.status.toLowerCase() : "";

                                        return (
                                            <tr key={req.id}>
                                                <td>{req.requestedSectionName || "-"}</td>
                                                <td>{req.reason || "-"}</td>
                                                <td>{formatTimestamp(req.createdAt)}</td>
                                                <td>{req.reviewer || "-"}</td>
                                                <td>{req.reviewNote || "-"}</td>
                                                <td>{req.reviewedAt ? formatTimestamp(req.reviewedAt) : "-"}</td>
                                                <td>
                                                    <p className={`status-chip status-${statusClass}`}>
                                                        {statusLabel[req.status] || req.status}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MojePrijave;
