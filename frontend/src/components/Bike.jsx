import React, { useState, useEffect } from 'react';

import './Bike.css';
import Navbar from './Navbar';
import { getToken } from '../utils/token.js';

const backendBase = import.meta.env.VITE_API_BASE_URL;

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
    const [attendanceCounts, setAttendanceCounts] = useState({});
    const [userRole, setUserRole] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [isJoining, setIsJoining] = useState(false);
    const [attendanceStatuses, setAttendanceStatuses] = useState({});
    const [attendanceIds, setAttendanceIds] = useState({});
    const [allAttendances, setAllAttendances] = useState([]);
    const [userInfoMap, setUserInfoMap] = useState({});

    const isAdminRole = userRole && ['LEADER', 'PROFESSOR', 'ADMIN'].includes(userRole);
    const canJoin = !isAdminRole;

    useEffect(() => {
        const fetchBikeSectionAndSessions = async () => {
            try {
                const token = getToken();
                const response = await fetch(`${backendBase}/api/sections`, {
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

                        const notificationsResponse = await fetch(`${backendBase}/api/notifications/section/${bikeSection.id}`, {
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

                        const sessionsResponse = await fetch(`${backendBase}/api/sessions/section/${bikeSection.id}`, {
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

                            fetchAttendanceCounts(sessions);
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

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = getToken();
                const response = await fetch(`${backendBase}/api/users/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const user = await response.json();
                    setUserRole(user.role);
                    setStudentId(user.id || user.studentId);
                } else {
                    console.error('Failed to fetch user:', response.status);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    const fetchAttendanceCounts = async (sessions) => {
        const token = getToken();
        const counts = {};

        for (const session of sessions) {
            try {
                const response = await fetch(`${backendBase}/api/sessions/${session.id}/attendances`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const attendances = await response.json();
                    counts[session.id] = attendances.filter(att => att.status === 'APPROVED' && !att.cancelled).length;
                } else {
                    counts[session.id] = 0;
                }
            } catch (error) {
                console.error(`Error fetching attendances for session ${session.id}:`, error);
                counts[session.id] = 0;
            }
        }

        setAttendanceCounts(counts);
    };

    useEffect(() => {
        if (!studentId || data.length === 0) return;
        const fetchMyAttendances = async () => {
            try {
                const token = getToken();
                const statusMap = {};
                const idMap = {};
                for (const ad of data) {
                    const response = await fetch(`${backendBase}/api/sessions/${ad.id}/attendances`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const attendances = await response.json();
                        const mine = attendances.find(att => att.studentId === studentId);
                        if (mine) {
                            statusMap[ad.id] = mine.status;
                            idMap[ad.id] = mine.id;
                        }
                    }
                }
                if (Object.keys(statusMap).length > 0) {
                    setAttendanceStatuses(prev => ({ ...prev, ...statusMap }));
                }
                if (Object.keys(idMap).length > 0) {
                    setAttendanceIds(prev => ({ ...prev, ...idMap }));
                }
            } catch (error) {
                console.error('Error fetching my attendances:', error);
            }
        };
        fetchMyAttendances();
    }, [studentId, data]);

    useEffect(() => {
        if (!isAdminRole || data.length === 0) return;
        const fetchAllAttendances = async () => {
            try {
                const token = getToken();
                const allAtts = [];
                const studentIdsSet = new Set();
                for (const ad of data) {
                    const response = await fetch(`${backendBase}/api/sessions/${ad.id}/attendances`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const attendances = await response.json();
                        attendances.forEach(att => studentIdsSet.add(att.studentId));
                        allAtts.push(...attendances.map(att => ({ ...att, sessionTitle: ad.title })));
                    }
                }
                setAllAttendances(allAtts);
                const studentIds = Array.from(studentIdsSet).filter(id => userInfoMap[id] === undefined);
                if (studentIds.length > 0) {
                    const userResponses = await Promise.all(studentIds.map(async (id) => {
                        try {
                            const resp = await fetch(`${backendBase}/api/users/${id}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            if (resp.ok) {
                                const user = await resp.json();
                                return { id, user };
                            }
                        } catch (err) {
                            console.error(`Error fetching user ${id}:`, err);
                        }
                        return null;
                    }));
                    const mapUpdates = {};
                    userResponses.forEach(entry => {
                        if (entry && entry.user) {
                            mapUpdates[entry.id] = entry.user;
                        }
                    });
                    if (Object.keys(mapUpdates).length > 0) {
                        setUserInfoMap(prev => ({ ...prev, ...mapUpdates }));
                    }
                }
            } catch (error) {
                console.error('Error fetching attendances:', error);
            }
        };
        fetchAllAttendances();
    }, [isAdminRole, data]);

    async function approveAttendance(attendanceId) {
        const attendance = allAttendances.find(att => att.id === attendanceId);
        try {
            const token = getToken();
            const response = await fetch(`${backendBase}/api/attendances/${attendanceId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setAllAttendances(prev => prev.filter(att => att.id !== attendanceId));
                if (attendance) {
                    const sessionId = attendance.sessionId;
                    setAttendanceCounts(prev => ({
                        ...prev,
                        [sessionId]: (prev[sessionId] || 0) + 1
                    }));
                }
            } else {
                alert('Greška pri odobravanju prijave');
            }
        } catch (error) {
            console.error('Error approving attendance:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    }

    async function cancelAttendance(attendanceId) {
        try {
            const token = getToken();
            const response = await fetch(`${backendBase}/api/attendances/${attendanceId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setAllAttendances(prev => prev.filter(att => att.id !== attendanceId));
            } else {
                alert('Greška pri otkazivanju prijave');
            }
        } catch (error) {
            console.error('Error cancelling attendance:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    }

    function joinGroup(sessionId) {
        if (!studentId) {
            alert('Greška: Student ID nije pronađen');
            return;
        }
        if (isJoining) return;
        const joinAsync = async () => {
            setIsJoining(true);
            try {
                const token = getToken();
                const attendanceData = {
                    cancelled: false,
                    status: 'PENDING',
                    sessionId: sessionId,
                    studentId: studentId
                };
                const response = await fetch(`${backendBase}/api/sessions/${sessionId}/attendances`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(attendanceData)
                });
                if (response.ok) {
                    const attendance = await response.json();
                    setSelectedId(sessionId);
                    setAttendanceStatuses(prev => ({
                        ...prev,
                        [sessionId]: attendance.status
                    }));
                    setAttendanceIds(prev => ({
                        ...prev,
                        [sessionId]: attendance.id
                    }));
                } else {
                    alert('Greška pri pridruživanju sesiji');
                }
            } catch (error) {
                console.error('Error joining session:', error);
                alert('Greška pri komunikaciji sa serverom');
            } finally {
                setIsJoining(false);
            }
        };
        joinAsync();
    }

    function leaveGroup(sessionId) {
        const attendanceId = attendanceIds[sessionId];
        const currentStatus = attendanceStatuses[sessionId];
        if (!attendanceId) {
            alert('Greška: Prijava nije pronađena');
            return;
        }
        const leaveAsync = async () => {
            try {
                const token = getToken();
                const url = `${backendBase}/api/attendances/${attendanceId}/cancel`;
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    setSelectedId(null);
                    setAttendanceStatuses(prev => ({
                        ...prev,
                        [sessionId]: undefined
                    }));
                    setAttendanceIds(prev => ({
                        ...prev,
                        [sessionId]: undefined
                    }));
                    if (currentStatus === 'APPROVED') {
                        setAttendanceCounts(prev => ({
                            ...prev,
                            [sessionId]: Math.max(0, (prev[sessionId] || 0) - 1)
                        }));
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Response error:', errorText);
                    alert('Greška pri odustajanju od sesije: ' + response.status);
                }
            } catch (error) {
                console.error('Error leaving session:', error);
                alert('Greška pri komunikaciji sa serverom: ' + error.message);
            }
        };
        leaveAsync();
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

            const response = await fetch(`${backendBase}/api/sessions`, {
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

    function openGoogleMaps(pointA, pointB) {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pointA)}&destination=${encodeURIComponent(pointB)}&travelmode=walking`;
        window.open(url, '_blank');
    }

    return (
        <>
            <Navbar />
            <div className="obrub">
                <div className="razdvojnik2">
                    <div className="naslov">
                        <h1>🔔 OBAVIJESTI 🔔</h1>

                    </div>
                    <div className="obavijesti">
                        {notifications.length === 0 ? (
                            <p className='alert'>Trenutno nemate obavijesti</p>
                        ) : (
                            notifications.map((note) => (
                                <div key={note.id} className="obavijest-item">
                                    <h4>{note.title}</h4>
                                    <p>{note.body}</p>
                                </div>
                            ))
                        )}
                    </div>
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
                                        <strong>👥 Prijavljeni:</strong>
                                        <span>{attendanceCounts[ad.id] !== undefined ? `${attendanceCounts[ad.id]} / ${ad.capacity}` : (ad.capacity || 'N/A')}</span>
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
                                    {canJoin && (
                                        attendanceStatuses[ad.id] ? (
                                            <>
                                                <span className='attendance-status'>Status: {attendanceStatuses[ad.id]}</span>
                                                {attendanceStatuses[ad.id] === 'PENDING' && (
                                                    <button disabled={isJoining} onClick={() => leaveGroup(ad.id)}>Napusti grupu</button>
                                                )}
                                            </>
                                        ) : (
                                            <button disabled={isJoining} onClick={() => joinGroup(ad.id)}>Pridruži se</button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {isAdminRole && (
                        <div className="approvals-section">
                            <h2>Prijave polaznika</h2>
                            {allAttendances.filter(att => att.status === 'PENDING' && !att.cancelled).length === 0 ? (
                                <p>Nema prijava</p>
                            ) : (
                                <div className="approvals-grid">
                                    {allAttendances.filter(att => att.status === 'PENDING' && !att.cancelled).map((attendance) => (
                                        <div key={attendance.id} className="approval-card">
                                            <h4>Sesija: {attendance.sessionTitle}</h4>
                                            {userInfoMap[attendance.studentId] && (
                                                <>
                                                    <p><strong>Ime:</strong> {userInfoMap[attendance.studentId].firstName}</p>
                                                    <p><strong>Prezime:</strong> {userInfoMap[attendance.studentId].lastName}</p>
                                                    <p><strong>Email:</strong> {userInfoMap[attendance.studentId].email}</p>
                                                    <p><strong>Bodovi:</strong> {userInfoMap[attendance.studentId].currentPoints}</p>
                                                </>
                                            )}
                                            {attendance.status === 'PENDING' && !attendance.cancelled && (
                                                <div className="approval-buttons">
                                                    <button className="approve-btn" onClick={() => approveAttendance(attendance.id)}>
                                                        Odobri
                                                    </button>
                                                    <button className="cancel-btn" onClick={() => cancelAttendance(attendance.id)}>
                                                        Otkaži
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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