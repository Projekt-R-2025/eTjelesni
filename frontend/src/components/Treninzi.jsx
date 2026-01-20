import React, { useState, useEffect } from 'react';
import './Treninzi.css';
import { getToken } from '../utils/token.js';
import Navbar from './Navbar';

const backendBase = import.meta.env.VITE_API_BASE_URL;

function Treninzi() {
    const [sectionId, setSectionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [attendanceStatuses, setAttendanceStatuses] = useState({});
    const [attendanceIds, setAttendanceIds] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCapacity, setNewCapacity] = useState('');
    const [newPoints, setNewPoints] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');
    const [allAttendances, setAllAttendances] = useState([]);
    const [userInfoMap, setUserInfoMap] = useState({});
    const [attendanceCounts, setAttendanceCounts] = useState({});
    const isAdminRole = userRole && ['LEADER', 'PROFESSOR', 'ADMIN'].includes(userRole);

    useEffect(() => {
        const fetchUserAndSection = async () => {
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
                    console.log('Cijeli user objekt:', user);
                    setSectionId(user.sectionId);
                    setUserRole(user.role);
                    setStudentId(user.id || user.studentId);
                    console.log('Fetched user:', user);
                    console.log('User role:', user.role);
                    console.log('Student ID:', user.id || user.studentId);
                } else {
                    console.error('Failed to fetch user:', response.status);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndSection();
    }, []);

    useEffect(() => {
        if (sectionId) {
            const fetchSessions = async () => {
                setLoadingSessions(true);
                try {
                    const token = getToken();
                    const response = await fetch(`${backendBase}/api/sessions/section/${sectionId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const sessionsData = await response.json();
                        setSessions(sessionsData);
                        console.log('Fetched sessions:', sessionsData);
                        fetchAttendanceCounts(sessionsData);
                    } else {
                        console.error('Failed to fetch sessions:', response.status);
                    }
                } catch (error) {
                    console.error('Error fetching sessions:', error);
                } finally {
                    setLoadingSessions(false);
                }
            };

            fetchSessions();
        }
    }, [sectionId]);

    useEffect(() => {
        if (isAdminRole && sessions.length > 0) {
            const fetchAllAttendances = async () => {
                try {
                    const token = getToken();
                    const allAtts = [];
                    const studentIdsSet = new Set();

                    for (const session of sessions) {
                        const response = await fetch(`${backendBase}/api/sessions/${session.id}/attendances`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            const attendances = await response.json();
                            attendances.forEach(att => studentIdsSet.add(att.studentId));
                            allAtts.push(...attendances.map(att => ({ ...att, sessionTitle: session.title })));
                        }
                    }

                    setAllAttendances(allAtts);
                    console.log('All attendances:', allAtts);

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
        }
    }, [isAdminRole, sessions]);

    useEffect(() => {
        if (!studentId || sessions.length === 0) {
            return;
        }

        const fetchMyAttendances = async () => {
            try {
                const token = getToken();
                const statusMap = {};
                const idMap = {};

                for (const session of sessions) {
                    const response = await fetch(`${backendBase}/api/sessions/${session.id}/attendances`, {
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
                            statusMap[session.id] = mine.status;
                            idMap[session.id] = mine.id;
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
    }, [studentId, sessions]);

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

    const canCreateSession = isAdminRole;
    const canJoin = !isAdminRole;

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
                console.log('Attendance approved');
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
                console.log('Attendance cancelled');
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

        if (isJoining) {
            return;
        }

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
                    console.log('Attendance created:', attendance);
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

        console.log('Attempting to leave - sessionId:', sessionId);
        console.log('AttendanceIds state:', attendanceIds);
        console.log('AttendanceId for this session:', attendanceId);

        if (!attendanceId) {
            alert('Greška: Aplikacija nije pronađena');
            console.log('No attendanceId found for sessionId:', sessionId);
            return;
        }

        const leaveAsync = async () => {
            try {
                const token = getToken();
                const url = `${backendBase}/api/attendances/${attendanceId}/cancel`;
                console.log('Sending request to:', url);

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);

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
                    console.log('Attendance cancelled successfully');
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

    const handleCreateSession = async () => {
        if (!sectionId) {
            alert('Greška: Sekcija nije pronađena');
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
                sectionId: sectionId
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
                setSessions([...sessions, newSession]);
                closeForm();
            } else {
                alert('Greška pri kreiranju sesije');
            }
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setNewTitle('');
        setNewDescription('');
        setNewCapacity('');
        setNewPoints('');
        setNewStartTime('');
        setNewEndTime('');
    };

    if (loading) {
        return <p>Učitavanje...</p>;
    }


    return (
        <>

            <Navbar />
            <div className="pozadina">
                <h1>Treninzi</h1>
                <div className="containerTreninzi">
                    <div className="trenutniTreninzi">
                        {loadingSessions ? (
                            <p>Učitavanje sesija...</p>
                        ) : sessions.length === 0 ? (
                            <p>Nema dostupnih sesija</p>
                        ) : (
                            <div className="sessions-grid">
                                {sessions.map((session) => (
                                    <div key={session.id} className="session-card">
                                        <h3>{session.title}</h3>
                                        <div className="session-details">
                                            <p><strong>📋 Opis:</strong> {session.description}</p>
                                            <p><strong>Prijavljeni:</strong> {attendanceCounts[session.id] !== undefined ? `${attendanceCounts[session.id]} / ${session.capacity}` : session.capacity}</p>
                                            <p><strong>⭐ Bodovi:</strong> {session.points}</p>
                                            {session.startTime && (
                                                <p><strong>🕐 Početak:</strong> {new Date(session.startTime).toLocaleString('hr-HR')}</p>
                                            )}
                                            {session.endTime && (
                                                <p><strong>🏁 Završetak:</strong> {new Date(session.endTime).toLocaleString('hr-HR')}</p>
                                            )}
                                        </div>
                                        <div className='pridruziSe'>
                                            {canJoin && (
                                                attendanceStatuses[session.id] ? (
                                                    <>
                                                        <span className='attendance-status'>Status: {attendanceStatuses[session.id]}</span>
                                                        {attendanceStatuses[session.id] === 'PENDING' && (
                                                            <button onClick={() => leaveGroup(session.id)}>Napusti grupu</button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button disabled={isJoining} onClick={() => joinGroup(session.id)}>Pridruži se</button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {canCreateSession && (
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
                {canCreateSession && (
                    <div className="create-session-button-container">
                        <button className="create-session-btn" onClick={() => setShowForm(true)}>
                            +
                        </button>
                    </div>
                )}

                {showForm && (
                    <div className="form-overlay">
                        <div className="form-modal">
                            <h2>Kreiraj novu sesiju</h2>
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
                            <div className="form-buttons">
                                <button className="btn-save" onClick={handleCreateSession}>Spremi</button>
                                <button className="btn-cancel" onClick={closeForm}>Odustani</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

} export default Treninzi;