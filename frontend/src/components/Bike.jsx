import React, { useState, useEffect } from 'react';

import './Bike.css';
import Navbar from './Navbar';
import { getToken } from '../utils/token.js';

const backendBase = import.meta.env.VITE_API_BASE_URL;

function Bike() {
    const [podaci, setPodaci] = useState([]);
    const [obavijesti, setObavijesti] = useState([]);
    const [odabraniId, setOdabraniId] = useState(null);
    const [prikaziFormu, setPrikaziFormu] = useState(false);
    const [noviNaslov, setNoviNaslov] = useState('');
    const [noviOpis, setNoviOpis] = useState('');
    const [novoPolaziste, setNovoPolaziste] = useState('');
    const [novaDestinacija, setNovaDestinacija] = useState('');
    const [noviKapacitet, setNoviKapacitet] = useState('');
    const [noviBodovi, setNoviBodovi] = useState('');
    const [novoVrijemePocetka, setNovoVrijemePocetka] = useState('');
    const [novoVrijemeZavrsetka, setNovoVrijemeZavrsetka] = useState('');
    const [bikeSectionId, setBikeSectionId] = useState(null);
    const [brojPrijavljenih, setBrojPrijavljenih] = useState({});
    const [ulogaKorisnika, setUlogaKorisnika] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [pridruzivanje, setPridruzivanje] = useState(false);
    const [statusiPrisustva, setStatusiPrisustva] = useState({});
    const [prijavaId, setPrijavaId] = useState({});
    const [svePrijave, setSvePrijave] = useState([]);
    const [mapaKorisnika, setMapaKorisnika] = useState({});

    const jeAdminUloga = ulogaKorisnika && ['LEADER', 'PROFESSOR', 'ADMIN'].includes(ulogaKorisnika);
    const mozeSePridruziti = !jeAdminUloga;

    const statusPrijevodi = {
        PENDING: 'Na čekanju',
        APPROVED: 'Odobreno',
        REJECTED: 'Odbijeno'
    };

    useEffect(() => {
        const dohvatiBikeSekcijuISesije = async () => {
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
                        console.log('ID Bike sekcije:', bikeSection.id);

                        const obavijestiResponse = await fetch(`${backendBase}/api/notifications/section/${bikeSection.id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (obavijestiResponse.ok) {
                            const obavijestiData = await obavijestiResponse.json();
                            setObavijesti(obavijestiData);
                            console.log('Učitane obavijesti:', obavijestiData);
                        }

                        const sesijeResponse = await fetch(`${backendBase}/api/sessions/section/${bikeSection.id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (sesijeResponse.ok) {
                            const sesije = await sesijeResponse.json();
                            const formatiraniPodaci = sesije.map(session => ({
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
                            setPodaci(formatiraniPodaci);
                            console.log('Učitane sesije:', formatiraniPodaci);

                            dohvatiBrojPrijavljenih(sesije);
                        }
                    } else {
                        console.log('Nema BIKE sekcije');
                    }
                } else {
                    console.error('Neuspješno dohvaćanje sekcija:', response.status);
                }
            } catch (error) {
                console.error('Greška kod dohvaćanja bike sekcije:', error);
            }
        };

        dohvatiBikeSekcijuISesije();
    }, []);

    useEffect(() => {
        const dohvatiKorisnika = async () => {
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
                    setUlogaKorisnika(user.role);
                    setStudentId(user.id || user.studentId);
                } else {
                    console.error('Neuspješno dohvaćanje korisnika:', response.status);
                }
            } catch (error) {
                console.error('Greška kod dohvaćanja korisnika:', error);
            }
        };
        dohvatiKorisnika();
    }, []);

    const dohvatiBrojPrijavljenih = async (sesije) => {
        const token = getToken();
        const brojevi = {};

        for (const session of sesije) {
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
                    brojevi[session.id] = attendances.filter(att => att.status === 'APPROVED' && !att.cancelled).length;
                } else {
                    brojevi[session.id] = 0;
                }
            } catch (error) {
                console.error(`Greška kod dohvaćanja prijava za sesiju ${session.id}:`, error);
                brojevi[session.id] = 0;
            }
        }

        setBrojPrijavljenih(brojevi);
    };

    useEffect(() => {
        if (!studentId || podaci.length === 0) return;
        const dohvatiMojePrijave = async () => {
            try {
                const token = getToken();
                const statusMapa = {};
                const idMapa = {};
                for (const oglas of podaci) {
                    const response = await fetch(`${backendBase}/api/sessions/${oglas.id}/attendances`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const attendances = await response.json();
                        const moja = attendances.find(att => att.studentId === studentId);
                        if (moja) {
                            statusMapa[oglas.id] = moja.status;
                            idMapa[oglas.id] = moja.id;
                        }
                    }
                }
                if (Object.keys(statusMapa).length > 0) {
                    setStatusiPrisustva(prev => ({ ...prev, ...statusMapa }));
                }
                if (Object.keys(idMapa).length > 0) {
                    setPrijavaId(prev => ({ ...prev, ...idMapa }));
                }
            } catch (error) {
                console.error('Greška kod dohvaćanja mojih prijava:', error);
            }
        };
        dohvatiMojePrijave();
    }, [studentId, podaci]);

    useEffect(() => {
        if (!jeAdminUloga || podaci.length === 0) return;
        const dohvatiSvePrijave = async () => {
            try {
                const token = getToken();
                const sve = [];
                const setIdStudenata = new Set();
                for (const oglas of podaci) {
                    const response = await fetch(`${backendBase}/api/sessions/${oglas.id}/attendances`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) {
                        const attendances = await response.json();
                        attendances.forEach(att => setIdStudenata.add(att.studentId));
                        sve.push(...attendances.map(att => ({ ...att, sessionTitle: oglas.title })));
                    }
                }
                setSvePrijave(sve);
                const studentIds = Array.from(setIdStudenata).filter(id => mapaKorisnika[id] === undefined);
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
                            console.error(`Greška kod dohvaćanja korisnika ${id}:`, err);
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
                        setMapaKorisnika(prev => ({ ...prev, ...mapUpdates }));
                    }
                }
            } catch (error) {
                console.error('Greška kod dohvaćanja prijava:', error);
            }
        };
        dohvatiSvePrijave();
    }, [jeAdminUloga, podaci]);

    async function odobriPrijavu(prijavaIdZaOdobriti) {
        const prijava = svePrijave.find(att => att.id === prijavaIdZaOdobriti);
        try {
            const token = getToken();
            const response = await fetch(`${backendBase}/api/attendances/${prijavaIdZaOdobriti}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setSvePrijave(prev => prev.filter(att => att.id !== prijavaIdZaOdobriti));
                if (prijava) {
                    const sessionId = prijava.sessionId;
                    setBrojPrijavljenih(prev => ({
                        ...prev,
                        [sessionId]: (prev[sessionId] || 0) + 1
                    }));
                }
            } else {
                alert('Greška pri odobravanju prijave');
            }
        } catch (error) {
            console.error('Greška kod odobravanja prijave:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    }

    async function otkaziPrijavu(prijavaIdZaOtkazati) {
        try {
            const token = getToken();
            const response = await fetch(`${backendBase}/api/attendances/${prijavaIdZaOtkazati}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setSvePrijave(prev => prev.filter(att => att.id !== prijavaIdZaOtkazati));
            } else {
                alert('Greška pri otkazivanju prijave');
            }
        } catch (error) {
            console.error('Greška kod otkazivanja prijave:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    }

    function pridruziSeGrupi(sessionId) {
        if (!studentId) {
            alert('Greška: Student ID nije pronađen');
            return;
        }
        if (pridruzivanje) return;
        const joinAsync = async () => {
            setPridruzivanje(true);
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
                    setOdabraniId(sessionId);
                    setStatusiPrisustva(prev => ({
                        ...prev,
                        [sessionId]: attendance.status
                    }));
                    setPrijavaId(prev => ({
                        ...prev,
                        [sessionId]: attendance.id
                    }));
                } else {
                    alert('Greška pri pridruživanju sesiji');
                }
            } catch (error) {
                console.error('Greška kod pridruživanja sesiji:', error);
                alert('Greška pri komunikaciji sa serverom');
            } finally {
                setPridruzivanje(false);
            }
        };
        joinAsync();
    }

    function napustiGrupu(sessionId) {
        const idPrijave = prijavaId[sessionId];
        const trenutniStatus = statusiPrisustva[sessionId];
        if (!idPrijave) {
            alert('Greška: Prijava nije pronađena');
            return;
        }
        const leaveAsync = async () => {
            try {
                const token = getToken();
                const url = `${backendBase}/api/attendances/${idPrijave}/cancel`;
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    setOdabraniId(null);
                    setStatusiPrisustva(prev => ({
                        ...prev,
                        [sessionId]: undefined
                    }));
                    setPrijavaId(prev => ({
                        ...prev,
                        [sessionId]: undefined
                    }));
                    if (trenutniStatus === 'APPROVED') {
                        setBrojPrijavljenih(prev => ({
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
                console.error('Greška kod odustajanja od sesije:', error);
                alert('Greška pri komunikaciji sa serverom: ' + error.message);
            }
        };
        leaveAsync();
    }

    function otvoriFormu() {
        setPrikaziFormu(true);
    }

    function zatvoriFormu() {
        setPrikaziFormu(false);
        setNoviNaslov('');
        setNoviOpis('');
        setNovoPolaziste('');
        setNovaDestinacija('');
        setNoviKapacitet('');
        setNoviBodovi('');
        setNovoVrijemePocetka('');
        setNovoVrijemeZavrsetka('');
    }

    async function addAd() {
        if (!bikeSectionId) {
            console.error('Bike sekcija nije pronađena');
            alert('Greška: Bike sekcija nije pronađena');
            return;
        }

        try {
            const token = getToken();
            const sessionData = {
                title: noviNaslov,
                description: noviOpis,
                capacity: parseInt(noviKapacitet) || 10,
                points: parseInt(noviBodovi) || 0,
                startTime: novoVrijemePocetka ? new Date(novoVrijemePocetka).toISOString() : null,
                endTime: novoVrijemeZavrsetka ? new Date(novoVrijemeZavrsetka).toISOString() : null,
                startLocation: novoPolaziste || 'Polazište nije uneseno',
                endLocation: novaDestinacija || 'Odredište nije uneseno',
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
                console.log('Sesija kreirana:', newSession);

                const noviOglas = {
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
                setPodaci([...podaci, noviOglas]);
                zatvoriFormu();
            } else {
                console.error('Neuspješno kreiranje sesije:', response.status);
                alert('Greška pri kreiranju treninga');
            }
        } catch (error) {
            console.error('Greška pri kreiranju sesije:', error);
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
            <div className="okvir">
                <div className="razdjelnik2">
                    <div className="naslovnica">
                        <h1>🔔 OBAVIJESTI 🔔</h1>
                    </div>
                    <div className="obavijesti-lista">
                        {obavijesti.length === 0 ? (
                            <p className='upozorenje'>Trenutno nemate obavijesti</p>
                        ) : (
                            obavijesti.map((note) => (
                                <div key={note.id} className="obavijest-stavka">
                                    <h4>{note.title}</h4>
                                    <p>{note.body}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="razdjelnik">
                    <div className="naslovnica">
                        <h1>🚴🏼 OGLASNA PLOČA 🚴🏼</h1>
                    </div>
                    <div className="oglasna-mreza">
                        {podaci.map((oglas) => (
                            <div
                                key={oglas.id}
                                className="oglas-stavka"
                            >
                                <h3 className='naslov-oglasa'>{oglas.title}</h3>
                                <div className='info-detalji-oglasa'>
                                    <div className='info-redak'>
                                        <strong>📋 Opis:</strong>
                                        <span>{oglas.description}</span>
                                    </div>
                                    <div className='info-redak'>
                                        <strong>📍 Polazište:</strong>
                                        <span>{oglas.A}</span>
                                    </div>
                                    <div className='info-redak'>
                                        <strong>📍 Odredište:</strong>
                                        <span>{oglas.B}</span>
                                    </div>
                                    <div className='info-redak'>
                                        <strong>👥 Prijavljeni:</strong>
                                        <span>{brojPrijavljenih[oglas.id] !== undefined ? `${brojPrijavljenih[oglas.id]} / ${oglas.capacity}` : (oglas.capacity || '-')}</span>
                                    </div>
                                    <div className='info-redak'>
                                        <strong>⭐ Bodovi:</strong>
                                        <span>{oglas.points || 0}</span>
                                    </div>
                                    {oglas.startTime && (
                                        <div className='info-redak'>
                                            <strong>🕐 Početak:</strong>
                                            <span>{new Date(oglas.startTime).toLocaleString('hr-HR')}</span>
                                        </div>
                                    )}
                                    {oglas.endTime && (
                                        <div className='info-redak'>
                                            <strong>🏁 Završetak:</strong>
                                            <span>{new Date(oglas.endTime).toLocaleString('hr-HR')}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    className='prikazi-rutu'
                                    onClick={() => openGoogleMaps(oglas.A, oglas.B)}
                                >
                                    Prikaži rutu
                                </button>
                                <div className='pridruzi-se'>
                                    {mozeSePridruziti && (
                                        statusiPrisustva[oglas.id] ? (
                                            <>
                                                <span className='status-prisustva'>Status: {statusPrijevodi[statusiPrisustva[oglas.id]] || statusiPrisustva[oglas.id]}</span>
                                                {statusiPrisustva[oglas.id] === 'PENDING' && (
                                                    <button disabled={pridruzivanje} onClick={() => napustiGrupu(oglas.id)}>Napusti grupu</button>
                                                )}
                                            </>
                                        ) : (
                                            <button disabled={pridruzivanje} onClick={() => pridruziSeGrupi(oglas.id)}>Pridruži se</button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {jeAdminUloga && (
                        <div className="odobravanja-sekcija">
                            <h2>Prijave polaznika</h2>
                            {svePrijave.filter(att => att.status === 'PENDING' && !att.cancelled).length === 0 ? (
                                <p>Nema prijava</p>
                            ) : (
                                <div className="odobravanja-mreza">
                                    {svePrijave.filter(att => att.status === 'PENDING' && !att.cancelled).map((prijava) => (
                                        <div key={prijava.id} className="odobravanje-kartica">
                                            <h4>Sesija: {prijava.sessionTitle}</h4>
                                            {mapaKorisnika[prijava.studentId] && (
                                                <>
                                                    <p><strong>Ime:</strong> {mapaKorisnika[prijava.studentId].firstName}</p>
                                                    <p><strong>Prezime:</strong> {mapaKorisnika[prijava.studentId].lastName}</p>
                                                    <p><strong>Email:</strong> {mapaKorisnika[prijava.studentId].email}</p>
                                                    <p><strong>Bodovi:</strong> {mapaKorisnika[prijava.studentId].currentPoints}</p>
                                                </>
                                            )}
                                            {prijava.status === 'PENDING' && !prijava.cancelled && (
                                                <div className="odobravanje-gumbi">
                                                    <button className="odobri-gumb" onClick={() => odobriPrijavu(prijava.id)}>
                                                        Odobri
                                                    </button>
                                                    <button className="otkazi-gumb" onClick={() => otkaziPrijavu(prijava.id)}>
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
                <button className="dodaj-gumb" onClick={otvoriFormu}>
                    +
                </button>
            </div>
            {prikaziFormu && (
                <div className="forma-prekrivac">
                    <div className="forma">
                        <h2>Novi oglas</h2>
                        <input
                            type="text"
                            placeholder="Naslov"
                            value={noviNaslov}
                            onChange={(e) => setNoviNaslov(e.target.value)}
                        />
                        <textarea
                            placeholder="Opis"
                            value={noviOpis}
                            onChange={(e) => setNoviOpis(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="📍 Polazište (A)"
                            value={novoPolaziste}
                            onChange={(e) => setNovoPolaziste(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="📍 Destinacija (B)"
                            value={novaDestinacija}
                            onChange={(e) => setNovaDestinacija(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Kapacitet"
                            value={noviKapacitet}
                            onChange={(e) => setNoviKapacitet(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Bodovi"
                            value={noviBodovi}
                            onChange={(e) => setNoviBodovi(e.target.value)}
                        />
                        <input
                            type="datetime-local"
                            placeholder="Vrijeme početka"
                            value={novoVrijemePocetka}
                            onChange={(e) => setNovoVrijemePocetka(e.target.value)}
                        />
                        <input
                            type="datetime-local"
                            placeholder="Vrijeme završetka"
                            value={novoVrijemeZavrsetka}
                            onChange={(e) => setNovoVrijemeZavrsetka(e.target.value)}
                        />
                        <button onClick={addAd}>Spremi</button>
                        <button onClick={zatvoriFormu}>Odustani</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Bike