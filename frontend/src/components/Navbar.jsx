import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { removeToken, getToken } from "../utils/token";
import "./Navbar.css";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const Navbar = ({ onLogout }) => {
    const navigate = useNavigate();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [sectionType, setSectionType] = useState(null);

    const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
    const closeSidebar = () => setSidebarVisible(false);

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

    // Dohvati tip sekcije (za bike/sekcije filtraciju)
    useEffect(() => {
        const fetchSectionType = async () => {
            if (!userData?.sectionId) {
                setSectionType(null);
                return;
            }

            try {
                const token = getToken();
                const response = await fetch(`${backendBase}/api/sections/${userData.sectionId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSectionType(data.sectionType);
                }
            } catch (error) {
                console.error("Greška pri dohvaćanju sekcije:", error);
            }
        };

        fetchSectionType();
    }, [userData]);

    const isBikeMember = sectionType === "BIKE";
    const hasSection = Boolean(userData?.sectionId);

    const handleLogout = async () => {
        try {
            console.log('Šaljem logout zahtjev...');
            const token = getToken();

            const response = await fetch(`${backendBase}/api/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Logout response status:', response.status);

            if (!response.ok) {
                console.error('Logout nije uspio:', response.status, response.statusText);
            } else {
                console.log('Token uspješno revokean na backendu');
            }
        } catch (error) {
            console.error('Greška pri odjavi:', error);
        } finally {
            localStorage.removeItem('user');
            removeToken();
            if (typeof onLogout === "function") onLogout();
            navigate('/');
        }
    };

    return (
        <>
            {/* NAVBAR */}
            <header className="navbar-header">
                <button className="menu-button" onClick={toggleSidebar}>
                    ☰
                </button>

                <Link to="/home" className="logo-link">
                    <h1 className="logo">eTjelesni</h1>
                </Link>

                <div className="user-container">
                    <Link to="/korisnik" className="user-link">
                        <svg className="user-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="user-name">
                            {userData?.firstName || "Ime"} {userData?.lastName || "Prezime"}
                        </span>
                    </Link>
                </div>
            </header>

            {/* SIDEBAR */}
            {sidebarVisible && (
                <>
                    <aside className="sidebar">
                        <Link to="/home" className="sidebar-button" onClick={closeSidebar}>HOME</Link>
                        {hasSection && isBikeMember && (
                            <Link to="/bike" className="sidebar-button" onClick={closeSidebar}>BIKE</Link>
                         )}
                        {hasSection && !isBikeMember && (
                            <>
                                <Link to="/sekcija" className="sidebar-button" onClick={closeSidebar}>SEKCIJA</Link>
                                <Link to="/treninzi" className="sidebar-button" onClick={closeSidebar}>TRENINZI</Link>
                            </>
                        )}
                        {userData?.role === "PROFESSOR" && (
                            <Link to="/sectionCreate" className="sidebar-button" onClick={closeSidebar}>NOVA SEKCIJA</Link>
                        )}
                        <Link to="/prijave" className="sidebar-button" onClick={closeSidebar}>PRIJAVE</Link>
                        {userData?.role !== "STUDENT" && (
                            <Link to="/korisnici" className="sidebar-button" onClick={closeSidebar}>KORISNICI</Link>
                        )}
                        <Link to="/konzultacije" className="sidebar-button" onClick={closeSidebar}>KONZULTACIJE</Link>
                        <button className="sidebar-button logout" onClick={handleLogout}>ODJAVA</button>
                    </aside>
                    <div className="sidebar-overlay" onClick={closeSidebar}></div>
                </>
            )}
        </>
    );
};

export default Navbar;