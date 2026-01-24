import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { getToken } from "../utils/token";
import { formatTimestamp } from "../utils/formatters";
import "./Users.css";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const roleLabel = {
    ADMIN: "Admin",
    PROFESSOR: "Profesor",
    LEADER: "Voditelj",
    STUDENT: "Student",
};

const Users = ({ onLogout }) => {
    const [users, setUsers] = useState([]);
    const [sectionsMap, setSectionsMap] = useState({});
    const [viewerRole, setViewerRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const token = getToken();
                if (!token) {
                    throw new Error("Niste prijavljeni.");
                }

                // 1) Dohvati trenutno prijavljenog korisnika
                const meRes = await fetch(`${backendBase}/api/users/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!meRes.ok) {
                    throw new Error("Greška pri dohvaćanju korisnika.");
                }

                const meData = await meRes.json();
                if (!isMounted) return;
                setViewerRole(meData.role);
                // 2) Dohvati sve sekcije radi imena i passingPoints
                const sectionsRes = await fetch(`${backendBase}/api/sections`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!sectionsRes.ok) {
                    throw new Error("Greška pri dohvaćanju sekcija.");
                }

                const sectionsData = await sectionsRes.json();
                if (!isMounted) return;

                const map = sectionsData.reduce((acc, section) => {
                    acc[section.id] = {
                        name: section.name,
                        passingPoints: section.passingPoints,
                    };
                    return acc;
                }, {});
                setSectionsMap(map);

                // 3) Dohvati korisnike ovisno o ulozi
                let fetchedUsers = [];

                if (meData.role === "ADMIN" || meData.role === "PROFESSOR") {
                    const usersRes = await fetch(`${backendBase}/api/users`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!usersRes.ok) {
                        throw new Error("Greška pri dohvaćanju korisnika.");
                    }

                    fetchedUsers = await usersRes.json();
                } else if (meData.role === "LEADER") {
                    const ids = meData.leadingSectionIds || [];

                    if (ids.length === 0) {
                        fetchedUsers = [];
                    } else {
                        const responses = await Promise.all(
                            ids.map(async (id) => {
                                const res = await fetch(`${backendBase}/api/users/section/${id}`, {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                });

                                if (!res.ok) {
                                    throw new Error("Greška pri dohvaćanju korisnika sekcije.");
                                }

                                return res.json();
                            })
                        );

                        // Spoji rezultate i makni duplikate po userId
                        const merged = responses.flat();
                        const uniqueById = new Map();
                        merged.forEach((u) => {
                            if (u?.id != null) {
                                uniqueById.set(u.id, u);
                            }
                        });
                        fetchedUsers = Array.from(uniqueById.values());
                    }
                } else {
                    throw new Error("Nemate dopuštenje za pregled korisnika.");
                }

                if (!isMounted) return;
                setUsers(fetchedUsers);
            } catch (err) {
                if (!isMounted) return;
                setError(err.message || "Neočekivana greška.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, []);

    const resolveSectionName = (sectionId) =>
        sectionsMap[sectionId]?.name || "-";

    const resolvePassingPoints = (sectionId) =>
        sectionsMap[sectionId]?.passingPoints;

    const resolveLeadingSections = (leadingSectionIds) => {
        if (!leadingSectionIds || leadingSectionIds.length === 0) return "-";
        const names = leadingSectionIds
            .map((id) => sectionsMap[id]?.name)
            .filter(Boolean);

        return names.length > 0 ? names.join(", ") : "-";
    };

    const renderPoints = (user) => {
        // LEADER nema bodove ni članstvo
        if (user.role === "LEADER") return "-";
        // Ako korisnik nije član sekcije ili sekcija nije mapirana, prikazuj "-"
        if (!user.sectionId || !sectionsMap[user.sectionId]) return "-";

        const passingPoints = resolvePassingPoints(user.sectionId);
        const hasPoints = user.currentPoints != null;

        if (!passingPoints && !hasPoints) return "-";

        if (!passingPoints) {
            return `${user.currentPoints ?? 0} / -`;
        }

        const passed = user.currentPoints != null && user.currentPoints >= passingPoints;
        const label = `${user.currentPoints ?? 0} / ${passingPoints}`;

        return (
            <span className={passed ? "points-pill pass" : "points-pill"}>{label}</span>
        );
    };

    return (
        <div>
            <Navbar onLogout={onLogout} />

            <div className="users-page">
                <h1 className="page-title">KORISNICI</h1>

                {loading && (
                    <div className="loading-container">
                        <p>Učitavanje...</p>
                    </div>
                )}

                {!loading && error && <p className="message error">{error}</p>}

                {!loading && !error && (
                    <div className="data-block">
                        <div className="table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Ime</th>
                                        <th>Prezime</th>
                                        <th>EMail</th>
                                        <th>Uloga</th>
                                        <th>Kreiran</th>
                                        <th>Član sekcije</th>
                                        <th>Broj bodova</th>
                                        {viewerRole !== "LEADER" && <th>Voditelj sekcija</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={viewerRole !== "LEADER" ? 8 : 7} className="empty-cell">
                                                Nema dostupnih korisnika.
                                            </td>
                                        </tr>
                                    )}
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.firstName}</td>
                                            <td>{user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>{roleLabel[user.role] || user.role}</td>
                                            <td>{user.createdAt ? formatTimestamp(user.createdAt) : "-"}</td>
                                            <td>{user.sectionName || "-"}</td>
                                            <td>{renderPoints(user)}</td>
                                            {viewerRole !== "LEADER" && (
                                                <td>{resolveLeadingSections(user.leadingSectionIds)}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
