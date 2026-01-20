import { useState } from 'react';
import { getToken } from '../utils/token';
import './SectionCreate.css';
import Navbar from './Navbar';

function SectionCreate() {
    const sectionTypeOptions = [
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

    const [formData, setFormData] = useState({
        name: '',
        sectionType: 'BIKE',
        passingPoints: 0
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const backendBase = import.meta.env.VITE_API_BASE_URL;

    const handleTypeChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            sectionType: value
        }));
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            name: val
        }));
    };

    const handlePassingPointsChange = (e) => {
        setFormData(prev => ({
            ...prev,
            passingPoints: Number(e.target.value) || 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'Please enter a section name' });
            setLoading(false);
            return;
        }

        try {
            const token = getToken();
            const payload = {
                name: formData.name,
                sectionType: formData.sectionType,
                passingPoints: formData.passingPoints
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
                throw new Error(`Error: ${response.status}`);
            }

            setMessage({ type: 'success', text: 'Section created successfully!' });

            // Reset form
            setFormData({
                name: '',
                sectionType: 'BIKE',
                passingPoints: 0
            });
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to create section: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    // UI

    return (
        <>
            <Navbar />
            <div className="section-create-container">
                <div className="section-create-card">
                    <h2>Kreiraj Novu Sekciju</h2>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="section-form">
                        <div className="form-group">
                            <label htmlFor="sectionType">Tip sekcije</label>
                            <select
                                id="sectionType"
                                value={formData.sectionType}
                                onChange={handleTypeChange}
                                className="select-input"
                            >
                                {sectionTypeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Naziv sekcije</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                                placeholder="Unesite naziv sekcije"
                                className="text-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="passingPoints">Bodovi za Prolaz</label>
                            <input
                                type="number"
                                id="passingPoints"
                                value={formData.passingPoints}
                                onChange={handlePassingPointsChange}
                                required
                                min="0"
                                placeholder="Unesite broj bodova"
                                className="number-input"
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Kreiram...' : 'Kreiraj Sekciju'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SectionCreate;
