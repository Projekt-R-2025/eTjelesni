import React, { useState, useEffect } from 'react';
import './Treninzi.css';
import { getToken } from '../utils/token.js';
import Navbar from './Navbar';

const backendBase = import.meta.env.VITE_API_BASE_URL;

function Treninzi() {
    const [idSekcije, setIdSekcije] = useState(null);
    const [leadingSectionIds, setLeadingSectionIds] = useState([]);
    const [ucitavanje, setUcitavanje] = useState(true);
    const [sesije, setSesije] = useState([]);
    const [ucitavanjeSesija, setUcitavanjeSesija] = useState(false);
    const [ulogaKorisnika, setUlogaKorisnika] = useState(null);
    const [idStudenta, setIdStudenta] = useState(null);
    const [odabraniId, setOdabraniId] = useState(null);
    const [statusiPrijave, setStatusiPrijave] = useState({});
    const [idjeviPrijava, setIdjeviPrijava] = useState({});
    const [prikaziFormu, setPrikaziFormu] = useState(false);
    const [pridruzivanjeUTijeku, setPridruzivanjeUTijeku] = useState(false);
    const [noviNaslov, setNoviNaslov] = useState('');
    const [noviOpis, setNoviOpis] = useState('');
    const [noviKapacitet, setNoviKapacitet] = useState('');
    const [noviBodovi, setNoviBodovi] = useState('');
    const [novoVrijemePocetka, setNovoVrijemePocetka] = useState('');
    const [novoVrijemeZavrsetka, setNovoVrijemeZavrsetka] = useState('');
    const [svePrijave, setSvePrijave] = useState([]);
    const [mapaKorisnika, setMapaKorisnika] = useState({});
    const [brojPrijava, setBrojPrijava] = useState({});
    const [dostupneSekcije, setDostupneSekcije] = useState([]);
    const [odabranaSekcija, setOdabranaSekcija] = useState('');
    const jeAdminUloga = ulogaKorisnika && ['LEADER', 'PROFESSOR', 'ADMIN'].includes(ulogaKorisnika);

    const statusPrijevodi = {
        PENDING: 'Na čekanju',
        APPROVED: 'Odobreno',
        REJECTED: 'Odbijeno'
    };

    useEffect(() => {
        const dohvatiKorisnikaISekciju = async () => {
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
                    const korisnik = await response.json();
                    console.log('Cijeli user objekt:', korisnik);
                    setIdSekcije(korisnik.sectionId);
                    setLeadingSectionIds(korisnik.leadingSectionIds || []);
                    setUlogaKorisnika(korisnik.role);
                    setIdStudenta(korisnik.id || korisnik.studentId);
                    console.log('Dohvaćen korisnik:', korisnik);
                    console.log('Uloga korisnika:', korisnik.role);
                    console.log('ID studenta:', korisnik.id || korisnik.studentId);
                } else {
                    console.error('Neuspješno dohvaćanje korisnika:', response.status);
                }
            } catch (error) {
                console.error('Greška pri dohvaćanju korisnika:', error);
            } finally {
                setUcitavanje(false);
            }
        };

        dohvatiKorisnikaISekciju();
    }, []);

    useEffect(() => {
        if (ulogaKorisnika) {
            const dohvatiSesije = async () => {
                setUcitavanjeSesija(true);
                try {
                    const token = getToken();
                    let podaciSesija = [];

                    if (ulogaKorisnika === 'STUDENT' && idSekcije) {
                        // STUDENT dohvaća sesije samo za svoju sekciju
                        const response = await fetch(`${backendBase}/api/sessions/section/${idSekcije}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            podaciSesija = await response.json();
                        } else {
                            console.error('Neuspješno dohvaćanje sesija:', response.status);
                        }
                    } else if (ulogaKorisnika === 'LEADER' && leadingSectionIds.length > 0) {
                        // LEADER dohvaća sesije za sve sekcije koje vodi
                        const sveSekcijeSesije = await Promise.all(
                            leadingSectionIds.map(async (sectionId) => {
                                const response = await fetch(`${backendBase}/api/sessions/section/${sectionId}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                if (response.ok) {
                                    return await response.json();
                                }
                                return [];
                            })
                        );
                        podaciSesija = sveSekcijeSesije.flat();
                    } else if (ulogaKorisnika === 'PROFESSOR' || ulogaKorisnika === 'ADMIN') {
                        // PROFESSOR i ADMIN dohvaćaju sve sesije
                        const response = await fetch(`${backendBase}/api/sessions`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            podaciSesija = await response.json();
                        } else {
                            console.error('Neuspješno dohvaćanje sesija:', response.status);
                        }
                    }

                    // Filtriraj sesije da ne prikazuje one koje pripadaju BIKE sekcijama
                    const filtriraneSesije = podaciSesija.filter(sesija => sesija.sectionType !== 'BIKE');
                    const sortiraneSesije = filtriraneSesije.sort((a, b) => a.id - b.id);
                    setSesije(sortiraneSesije);
                    console.log('Dohvaćene sesije:', sortiraneSesije);
                    dohvatiBrojPrijava(filtriraneSesije);
                } catch (error) {
                    console.error('Greška pri dohvaćanju sesija:', error);
                } finally {
                    setUcitavanjeSesija(false);
                }
            };

            dohvatiSesije();
        }
    }, [ulogaKorisnika, idSekcije, leadingSectionIds]);

    useEffect(() => {
        if (jeAdminUloga && sesije.length > 0) {
            const dohvatiSvePrijave = async () => {
                try {
                    const token = getToken();
                    const svePrijaveTemp = [];
                    const skupIdjevaStudenata = new Set();

                    for (const sesija of sesije) {
                        const response = await fetch(`${backendBase}/api/sessions/${sesija.id}/attendances`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            const prijave = await response.json();
                            prijave.forEach(prijava => skupIdjevaStudenata.add(prijava.studentId));
                            svePrijaveTemp.push(...prijave.map(prijava => ({ ...prijava, sessionTitle: sesija.title })));
                        }
                    }

                    setSvePrijave(svePrijaveTemp);
                    console.log('Sve prijave:', svePrijaveTemp);

                    const idjeviStudenata = Array.from(skupIdjevaStudenata).filter(id => mapaKorisnika[id] === undefined);
                    if (idjeviStudenata.length > 0) {
                        const odgovoriKorisnika = await Promise.all(idjeviStudenata.map(async (id) => {
                            try {
                                const resp = await fetch(`${backendBase}/api/users/${id}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                if (resp.ok) {
                                    const korisnik = await resp.json();
                                    return { id, user: korisnik };
                                }
                            } catch (err) {
                                console.error(`Greška pri dohvaćanju korisnika ${id}:`, err);
                            }
                            return null;
                        }));

                        const azuriranjaMape = {};
                        odgovoriKorisnika.forEach(unos => {
                            if (unos && unos.user) {
                                azuriranjaMape[unos.id] = unos.user;
                            }
                        });
                        if (Object.keys(azuriranjaMape).length > 0) {
                            setMapaKorisnika(prev => ({ ...prev, ...azuriranjaMape }));
                        }
                    }
                } catch (error) {
                    console.error('Greška pri dohvaćanju prijava:', error);
                }
            };

            dohvatiSvePrijave();
        }
    }, [jeAdminUloga, sesije]);

    useEffect(() => {
        if (!idStudenta || sesije.length === 0) {
            return;
        }

        const dohvatiMojePrijave = async () => {
            try {
                const token = getToken();
                const mapaStatusa = {};
                const mapaIdjeva = {};

                for (const sesija of sesije) {
                    const response = await fetch(`${backendBase}/api/sessions/${sesija.id}/attendances`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const prijave = await response.json();
                        const mojaPrijava = prijave.find(prijava => prijava.studentId === idStudenta);
                        if (mojaPrijava) {
                            mapaStatusa[sesija.id] = mojaPrijava.status;
                            mapaIdjeva[sesija.id] = mojaPrijava.id;
                        }
                    }
                }

                if (Object.keys(mapaStatusa).length > 0) {
                    setStatusiPrijave(prev => ({ ...prev, ...mapaStatusa }));
                }
                if (Object.keys(mapaIdjeva).length > 0) {
                    setIdjeviPrijava(prev => ({ ...prev, ...mapaIdjeva }));
                }
            } catch (error) {
                console.error('Greška pri dohvaćanju mojih prijava:', error);
            }
        };

        dohvatiMojePrijave();
    }, [idStudenta, sesije]);

    useEffect(() => {
        if (jeAdminUloga) {
            const dohvatiDostupneSekcije = async () => {
                try {
                    const token = getToken();

                    if (ulogaKorisnika === 'LEADER' && leadingSectionIds.length > 0) {
                        // LEADER dohvaća detalje sekcija koje vodi
                        const sekcije = await Promise.all(
                            leadingSectionIds.map(async (sectionId) => {
                                const response = await fetch(`${backendBase}/api/sections/${sectionId}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                if (response.ok) {
                                    return await response.json();
                                }
                                return null;
                            })
                        );
                        setDostupneSekcije(sekcije.filter(s => s !== null && s.sectionType !== 'BIKE'));
                    } else if (ulogaKorisnika === 'PROFESSOR' || ulogaKorisnika === 'ADMIN') {
                        // PROFESSOR i ADMIN dohvaćaju sve sekcije
                        const response = await fetch(`${backendBase}/api/sections`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            const sekcije = await response.json();
                            setDostupneSekcije(sekcije.filter(s => s.sectionType !== 'BIKE'));
                        }
                    }
                } catch (error) {
                    console.error('Greška pri dohvaćanju sekcija:', error);
                }
            };

            dohvatiDostupneSekcije();
        }
    }, [jeAdminUloga, ulogaKorisnika, leadingSectionIds]);

    const dohvatiBrojPrijava = async (sesijeZaBrojanje) => {
        const token = getToken();
        const brojevi = {};
        for (const sesija of sesijeZaBrojanje) {
            try {
                const response = await fetch(`${backendBase}/api/sessions/${sesija.id}/attendances`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const prijave = await response.json();
                    brojevi[sesija.id] = prijave.filter(prijava => prijava.status === 'APPROVED' && !prijava.cancelled).length;
                } else {
                    brojevi[sesija.id] = 0;
                }
            } catch (error) {
                console.error(`Greška pri dohvaćanju prijava za sesiju ${sesija.id}:`, error);
                brojevi[sesija.id] = 0;
            }
        }
        setBrojPrijava(brojevi);
    };

    const mozeKreiratiSesiju = jeAdminUloga;
    const mozeSePridruziti = !jeAdminUloga;

    async function odobriPrijavu(id_prijave) {
        const prijava = svePrijave.find(att => att.id === id_prijave);
        try {
            const token = getToken();
            const response = await fetch(`${backendBase}/api/attendances/${id_prijave}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setSvePrijave(prev => prev.filter(att => att.id !== id_prijave));
                if (prijava) {
                    const idSesije = prijava.sessionId;
                    setBrojPrijava(prev => ({
                        ...prev,
                        [idSesije]: (prev[idSesije] || 0) + 1
                    }));
                }
                console.log('Prijava odobrena');
            } else {
                alert('Greška pri odobravanju prijave');
            }
        } catch (error) {
            console.error('Greška pri odobravanju prijave:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    }

    async function otkaziPrijavu(id_prijave) {
        try {
            const token = getToken();
            const response = await fetch(`${backendBase}/api/attendances/${id_prijave}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setSvePrijave(prev => prev.filter(att => att.id !== attendanceId));
                console.log('Prijava otkazana');
            } else {
                alert('Greška pri otkazivanju prijave');
            }
        } catch (error) {
            console.error('Greška pri otkazivanju prijave:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    }

    function pridruziSeGrupi(idSesije) {
        if (!idStudenta) {
            alert('Greška: Student ID nije pronađen');
            return;
        }

        if (pridruzivanjeUTijeku) {
            return;
        }

        const pridruziAsinkrono = async () => {
            setPridruzivanjeUTijeku(true);
            try {
                const token = getToken();
                const podaciPrijave = {
                    cancelled: false,
                    status: 'PENDING',
                    sessionId: idSesije,
                    studentId: idStudenta
                };

                const response = await fetch(`${backendBase}/api/sessions/${idSesije}/attendances`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(podaciPrijave)
                });

                if (response.ok) {
                    const prijava = await response.json();
                    setOdabraniId(idSesije);
                    setStatusiPrijave(prev => ({
                        ...prev,
                        [idSesije]: prijava.status
                    }));
                    setIdjeviPrijava(prev => ({
                        ...prev,
                        [idSesije]: prijava.id
                    }));
                    console.log('Prijava kreirana:', prijava);
                } else {
                    alert('Greška pri pridruživanju sesiji');
                }
            } catch (error) {
                console.error('Greška pri pridruživanju sesiji:', error);
                alert('Greška pri komunikaciji sa serverom');
            } finally {
                setPridruzivanjeUTijeku(false);
            }
        };

        pridruziAsinkrono();
    }

    function napustiGrupu(idSesije) {
        const id_prijave = idjeviPrijava[idSesije];

        console.log('Pokušaj napuštanja - sessionId:', idSesije);
        console.log('Stanje attendanceIds:', idjeviPrijava);
        console.log('AttendanceId za ovu sesiju:', id_prijave);

        if (!id_prijave) {
            alert('Greška: Prijava nije pronađena');
            console.log('Nije pronađen attendanceId za sessionId:', idSesije);
            return;
        }

        const napustiAsinkrono = async () => {
            try {
                const token = getToken();
                const url = `${backendBase}/api/attendances/${id_prijave}/cancel`;
                console.log('Slanje zahtjeva na:', url);

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Status odgovora:', response.status);
                console.log('Odgovor ok:', response.ok);

                if (response.ok) {
                    setOdabraniId(null);
                    setStatusiPrijave(prev => ({
                        ...prev,
                        [idSesije]: undefined
                    }));
                    setIdjeviPrijava(prev => ({
                        ...prev,
                        [idSesije]: undefined
                    }));
                    console.log('Prijava uspješno otkazana');
                } else {
                    const tekstGreske = await response.text();
                    console.error('Greška u odgovoru:', tekstGreske);
                    alert('Greška pri odustajanju od sesije: ' + response.status);
                }
            } catch (error) {
                console.error('Greška pri napuštanju sesije:', error);
                alert('Greška pri komunikaciji sa serverom: ' + error.message);
            }
        };

        napustiAsinkrono();
    }

    const obradiKreiranjeSesije = async () => {
        if (!odabranaSekcija) {
            alert('Greška: Molimo odaberite sekciju');
            return;
        }

        try {
            const token = getToken();
            const podaciSesije = {
                title: noviNaslov,
                description: noviOpis,
                capacity: parseInt(noviKapacitet) || 10,
                points: parseInt(noviBodovi) || 0,
                startTime: novoVrijemePocetka ? new Date(novoVrijemePocetka).toISOString() : null,
                endTime: novoVrijemeZavrsetka ? new Date(novoVrijemeZavrsetka).toISOString() : null,
                sectionId: parseInt(odabranaSekcija)
            };

            const response = await fetch(`${backendBase}/api/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(podaciSesije)
            });

            if (response.ok) {
                const novaSesija = await response.json();
                const azuriraneSesije = [...sesije, novaSesija].sort((a, b) => a.id - b.id);
                setSesije(azuriraneSesije);
                zatvoriFormu();
            } else {
                alert('Greška pri kreiranju sesije');
            }
        } catch (error) {
            console.error('Greška pri kreiranju sesije:', error);
            alert('Greška pri komunikaciji sa serverom');
        }
    };

    const zatvoriFormu = () => {
        setPrikaziFormu(false);
        setNoviNaslov('');
        setNoviOpis('');
        setNoviKapacitet('');
        setNoviBodovi('');
        setNovoVrijemePocetka('');
        setNovoVrijemeZavrsetka('');
        setOdabranaSekcija('');
    };

    if (ucitavanje) {
        return <p>Učitavanje...</p>;
    }


    return (
        <>
            <Navbar />
            <div className="pozadina">
                <h1>Treninzi</h1>
                <div className="kontejnerTreninzi">
                    <div className="trenutniTreninzi">
                        {ucitavanjeSesija ? (
                            <p>Učitavanje treninga...</p>
                        ) : sesije.length === 0 ? (
                            <p>Nema dostupnih treninga</p>
                        ) : (
                            <div className="sesije-mreza">
                                {sesije.map((sesija) => (
                                    <div key={sesija.id} className="sesija-kartica">
                                        <h3>{sesija.title}</h3>
                                        <div className="detalji-sesije">
                                            <p><strong>Sekcija:</strong> {sesija.sectionName}</p>
                                            <p><strong>📋 Opis:</strong> {sesija.description}</p>
                                            <p><strong>Prijavljeni:</strong> {brojPrijava[sesija.id] !== undefined ? `${brojPrijava[sesija.id]} / ${sesija.capacity}` : sesija.capacity}</p>
                                            <p><strong>⭐ Bodovi:</strong> {sesija.points}</p>
                                            {sesija.startTime && (
                                                <p><strong>🕐 Početak:</strong> {new Date(sesija.startTime).toLocaleString('hr-HR')}</p>
                                            )}
                                            {sesija.endTime && (
                                                <p><strong>🏁 Završetak:</strong> {new Date(sesija.endTime).toLocaleString('hr-HR')}</p>
                                            )}
                                        </div>
                                        <div className='pridruzi-se'>
                                            {mozeSePridruziti && (
                                                statusiPrijave[sesija.id] ? (
                                                    <>
                                                        <span className='status-prisustva'>Status: {statusPrijevodi[statusiPrijave[sesija.id]] || statusiPrijave[sesija.id]}</span>
                                                        {statusiPrijave[sesija.id] === 'PENDING' && (
                                                            <button onClick={() => napustiGrupu(sesija.id)}>Napusti grupu</button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button disabled={pridruzivanjeUTijeku} onClick={() => pridruziSeGrupi(sesija.id)}>Pridruži se</button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {mozeKreiratiSesiju && (
                    <div className="odobravanja-sekcija">
                        <h2>Prijave polaznika</h2>
                        {svePrijave.filter(prijava => prijava.status === 'PENDING' && !prijava.cancelled).length === 0 ? (
                            <div>Nema prijava</div>
                        ) : (
                            <div className="odobravanja-mreza">
                                {svePrijave.filter(prijava => prijava.status === 'PENDING' && !prijava.cancelled).map((prijava) => (
                                    <div key={prijava.id} className="odobravanje-kartica">
                                        <h4>{prijava.sessionTitle}</h4>
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
                {mozeKreiratiSesiju && (
                    <div className="kontejner-gumb-nova-sesija">
                        <button className="gumb-nova-sesija" onClick={() => setPrikaziFormu(true)}>
                            +
                        </button>
                    </div>
                )}

                {prikaziFormu && (
                    <div className="prekrivac-forme">
                        <div className="modal-forme">
                            <h2>Kreiraj novi trening</h2>
                            <select
                                className="odabir-sekcije"
                                value={odabranaSekcija}
                                onChange={(e) => setOdabranaSekcija(e.target.value)}
                                required
                            >
                                <option value="">-- Odaberite sekciju --</option>
                                {dostupneSekcije.map((sekcija) => (
                                    <option key={sekcija.id} value={sekcija.id}>
                                        {sekcija.name}
                                    </option>
                                ))}
                            </select>
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
                            <div className="gumbi-forme">
                                <button className="spremi-gumb" onClick={obradiKreiranjeSesije}>Spremi</button>
                                <button className="odustani-gumb" onClick={zatvoriFormu}>Odustani</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

} export default Treninzi;