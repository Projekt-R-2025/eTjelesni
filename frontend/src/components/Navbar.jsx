import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { removeToken, getToken } from "../utils/token";
import "./Navbar.css";

const backendBase = import.meta.env.VITE_API_BASE_URL;

const Navbar = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [userData, setUserData] = useState(null);

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

                <h1 className="logo">eTjelesni</h1>

                <div className="user-container">
                    <span className="user-name">
                        <Link to="/korisnik">
                            {userData?.firstName || "Ime"} {userData?.lastName || "Prezime"}
                        </Link>
                    </span>
                </div>
            </header>

            {/* SIDEBAR */}
            {sidebarVisible && (
                <>
                    <aside className="sidebar">
                        <Link to="/home" className="sidebar-button" onClick={closeSidebar}>HOME</Link>
                        <Link to="/sekcija" className="sidebar-button" onClick={closeSidebar}>SEKCIJA</Link>
                         {location.pathname.startsWith("/sekcija") && (
                            <Link to="/treninzi" className="sidebar-button" onClick={closeSidebar}>TRENINZI</Link>
                        )}
                        {userData?.role === "PROFESSOR" && (
                            <Link to="/sectionCreate" className="sidebar-button" onClick={closeSidebar}>NOVA SEKCIJA</Link>
                        )}
                        <Link to="/bike" className="sidebar-button" onClick={closeSidebar}>BIKE</Link>
                        <Link to="/prijave" className="sidebar-button" onClick={closeSidebar}>PRIJAVE</Link>
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