import { useState } from 'react';
import { getToken } from '../utils/token';
import './SectionCreate.css';
import Navbar from './Navbar';

function SectionCreate() {
    const opcijeTipaSekcije = [
        { label: 'Bike', value: 'BIKE' },
        { label: 'Nogomet', value: 'NOGOMET' },
        { label: 'Rukomet', value: 'RUKOMET' },
        { label: 'Košarka', value: 'KOSARKA' },
        { label: 'Odbojka', value: 'ODBOJKA' },
        { label: 'Atletika', value: 'ATLETIKA' },
        { label: 'Plivanje', value: 'PLIVANJE' },
        { label: 'Tenis', value: 'TENIS' },
        { label: 'Stolni tenis', value: 'STOLNI_TENIS' },
        { label: 'Ostalo', value: 'OSTALO' }
    ];

    const [podaciForme, setPodaciForme] = useState({
        naziv: '',
        tipSekcije: 'BIKE',
        bodoviZaProlaz: 0
    });
    const [ucitavanje, setUcitavanje] = useState(false);
    const [poruka, setPoruka] = useState({ type: '', text: '' });

    const backendBase = import.meta.env.VITE_API_BASE_URL;

    const obradiPromjenuTipa = (e) => {
        const vrijednost = e.target.value;
        setPodaciForme(prev => ({
            ...prev,
            tipSekcije: vrijednost
        }));
    };

    const obradiPromjenuNaziva = (e) => {
        const vrijednost = e.target.value;
        setPodaciForme(prev => ({
            ...prev,
            naziv: vrijednost
        }));
    };

    const obradiPromjenuBodova = (e) => {
        setPodaciForme(prev => ({
            ...prev,
            bodoviZaProlaz: Number(e.target.value) || 0
        }));
    };

    const obradiSlanje = async (e) => {
        e.preventDefault();
        setUcitavanje(true);
        setPoruka({ type: '', text: '' });

        if (!podaciForme.naziv.trim()) {
            setPoruka({ type: 'error', text: 'Molimo unesite naziv sekcije' });
            setUcitavanje(false);
            return;
        }

        try {
            const token = getToken();
            const payload = {
                name: podaciForme.naziv,
                sectionType: podaciForme.tipSekcije,
                passingPoints: podaciForme.bodoviZaProlaz
            };

            const response = await fetch(`${backendBase}/api/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Greška: ${response.status}`);
            }

            setPoruka({ type: 'success', text: 'Sekcija uspješno kreirana!' });

            setPodaciForme({
                naziv: '',
                tipSekcije: 'BIKE',
                bodoviZaProlaz: 0
            });
        } catch (error) {
            setPoruka({ type: 'error', text: `Neuspješno kreiranje sekcije: ${error.message}` });
        } finally {
            setUcitavanje(false);
        }
    };


    return (
        <>
            <Navbar />
            <div className="okvir-sekcije">
                <div className="kartica-sekcije">
                    <h2>Kreiraj Novu Sekciju</h2>

                    {poruka.text && (
                        <div className={`poruka ${poruka.type}`}>
                            {poruka.text}
                        </div>
                    )}

                    <form onSubmit={obradiSlanje} className="forma-sekcije">
                        <div className="grupa-forme">
                            <label htmlFor="sectionType">Tip sekcije</label>
                            <select
                                id="sectionType"
                                value={podaciForme.tipSekcije}
                                onChange={obradiPromjenuTipa}
                                className="odabir-unos"
                            >
                                {opcijeTipaSekcije.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grupa-forme">
                            <label htmlFor="name">Naziv sekcije</label>
                            <input
                                type="text"
                                id="name"
                                value={podaciForme.naziv}
                                onChange={obradiPromjenuNaziva}
                                required
                                placeholder="Unesite naziv sekcije"
                                className="tekst-unos"
                            />
                        </div>

                        <div className="grupa-forme">
                            <label htmlFor="passingPoints">Bodovi za Prolaz</label>
                            <input
                                type="number"
                                id="passingPoints"
                                value={podaciForme.bodoviZaProlaz}
                                onChange={obradiPromjenuBodova}
                                required
                                min="0"
                                placeholder="Unesite broj bodova"
                                className="broj-unos"
                            />
                        </div>

                        <button type="submit" className="gumb-potvrdi" disabled={ucitavanje}>
                            {ucitavanje ? 'Kreiram...' : 'Kreiraj Sekciju'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SectionCreate;
