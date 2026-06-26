import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Mesaje from './Mesaje';

const MedicDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pacienti');
    const [pacienti, setPacienti] = useState([]);
    const [programari, setProgramari] = useState([]);
    const [consultatii, setConsultatii] = useState([]);
    const [analize, setAnalize] = useState([]);
    const [retete, setRetete] = useState([]);
    const [vaccinari, setVaccinari] = useState([]);
    const [profil, setProfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showConsultatieForm, setShowConsultatieForm] = useState(false);
    const [showAnalizaForm, setShowAnalizaForm] = useState(false);
    const [showRetetaForm, setShowRetetaForm] = useState(false);
    const [showVaccinareForm, setShowVaccinareForm] = useState(false);
    const [editProfil, setEditProfil] = useState(false);
    const [necitite, setNecitite] = useState(0);
    const [editConsultatie, setEditConsultatie] = useState(null);
    const [editConsultatieData, setEditConsultatieData] = useState({
        symptoms: '', diagnosis: '', treatment: '', notes: '',
    });
    const [profilForm, setProfilForm] = useState({
        firstName: '', lastName: '', specialization: '', phone: '', stamp: '',
    });
    const [consultatieData, setConsultatieData] = useState({
        pacientId: '', programareId: '', symptoms: '',
        diagnosis: '', treatment: '', notes: '',
    });
    const [analizaData, setAnalizaData] = useState({
        pacientId: '', analysisType: '', laboratory: '', collectionDate: '',
    });
    const [retetaData, setRetetaData] = useState({
        pacientId: '', consultatieId: '', type: 'simpla',
        series: '', number: '', issueDate: '', expiryDate: '', notes: '',
    });
    const [vaccinareData, setVaccinareData] = useState({
        pacientId: '', vaccine: '', administrationDate: '', lot: '', nextBooster: '',
    });

    useEffect(() => {
        fetchData();
        fetchNecitite();
        const interval = setInterval(fetchNecitite, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNecitite = async () => {
        try {
            const response = await api.get('/mesaje/necitite');
            setNecitite(response.data.count);
        } catch (err) {
            console.error('Eroare necitite');
        }
    };

    const fetchData = async () => {
        try {
            const [p, pr, c, prof, a, r, v] = await Promise.allSettled([
                api.get('/medic/pacienti'),
                api.get('/medic/programari'),
                api.get('/medic/consultatii'),
                api.get('/medic/profil'),
                api.get('/medic/analize'),
                api.get('/medic/retete'),
                api.get('/medic/vaccinari'),
            ]);
            if (p.status === 'fulfilled') setPacienti(p.value.data);
            if (pr.status === 'fulfilled') setProgramari(pr.value.data);
            if (c.status === 'fulfilled') setConsultatii(c.value.data);
            if (prof.status === 'fulfilled') {
                setProfil(prof.value.data);
                setProfilForm({
                    firstName: prof.value.data.firstName || '',
                    lastName: prof.value.data.lastName || '',
                    specialization: prof.value.data.specialization || '',
                    phone: prof.value.data.phone || '',
                    stamp: prof.value.data.stamp || '',
                });
            }
            if (a.status === 'fulfilled') setAnalize(a.value.data);
            if (r.status === 'fulfilled') setRetete(r.value.data);
            if (v.status === 'fulfilled') setVaccinari(v.value.data);
        } catch (err) {
            console.error('Eroare la încărcarea datelor');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.put(`/medic/programari/${id}/status?status=${status}`);
            setMessage(`Programare ${status === 'confirmata' ? 'confirmată' : 'anulată'} cu succes!`);
            const pr = await api.get('/medic/programari');
            setProgramari(pr.data);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la actualizarea statusului!');
        }
    };

    const handleAddConsultatie = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medic/consultatii', {
                pacientId: parseInt(consultatieData.pacientId),
                programareId: consultatieData.programareId ? parseInt(consultatieData.programareId) : null,
                symptoms: consultatieData.symptoms,
                diagnosis: consultatieData.diagnosis,
                treatment: consultatieData.treatment,
                notes: consultatieData.notes,
            });
            setMessage('Consultație adăugată cu succes!');
            setShowConsultatieForm(false);
            setConsultatieData({ pacientId: '', programareId: '', symptoms: '', diagnosis: '', treatment: '', notes: '' });
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la adăugarea consultației!');
        }
    };

    const handleEditConsultatie = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/medic/consultatii/${editConsultatie}`, editConsultatieData);
            setMessage('Consultație actualizată cu succes!');
            setEditConsultatie(null);
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la actualizarea consultației!');
        }
    };

    const handleAddAnaliza = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medic/analize', {
                pacientId: parseInt(analizaData.pacientId),
                analysisType: analizaData.analysisType,
                laboratory: analizaData.laboratory,
                collectionDate: analizaData.collectionDate || null,
            });
            setMessage('Analiză programată cu succes!');
            setShowAnalizaForm(false);
            setAnalizaData({ pacientId: '', analysisType: '', laboratory: '', collectionDate: '' });
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la programarea analizei!');
        }
    };

    const handleAddReteta = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medic/retete', {
                pacientId: parseInt(retetaData.pacientId),
                consultatieId: retetaData.consultatieId ? parseInt(retetaData.consultatieId) : null,
                type: retetaData.type,
                series: retetaData.series || null,
                number: retetaData.number || null,
                issueDate: retetaData.issueDate || null,
                expiryDate: retetaData.expiryDate || null,
                notes: retetaData.notes || null,
            });
            setMessage('Rețetă adăugată cu succes!');
            setShowRetetaForm(false);
            setRetetaData({ pacientId: '', consultatieId: '', type: 'simpla', series: '', number: '', issueDate: '', expiryDate: '', notes: '' });
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la adăugarea rețetei!');
        }
    };

    const handleAddVaccinare = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medic/vaccinari', {
                pacientId: parseInt(vaccinareData.pacientId),
                vaccine: vaccinareData.vaccine,
                administrationDate: vaccinareData.administrationDate || null,
                lot: vaccinareData.lot || null,
                nextBooster: vaccinareData.nextBooster || null,
            });
            setMessage('Vaccinare înregistrată cu succes!');
            setShowVaccinareForm(false);
            setVaccinareData({ pacientId: '', vaccine: '', administrationDate: '', lot: '', nextBooster: '' });
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la înregistrarea vaccinării!');
        }
    };

    const handleUpdateProfil = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/medic/profil', profilForm);
            setProfil(response.data);
            setEditProfil(false);
            setMessage('Profil actualizat cu succes!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la actualizarea profilului!');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('ro-RO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatDateSimple = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('ro-RO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            asteptare: { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
            confirmata: { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
            finalizata: { bg: '#f0fff4', color: '#276749', border: '#9ae6b4' },
            anulata: { bg: '#fff5f5', color: '#c53030', border: '#fc8181' },
            in_desfasurare: { bg: '#f5f3ff', color: '#5b21b6', border: '#c4b5fd' },
            in_asteptare: { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
            finalizat: { bg: '#f0fff4', color: '#276749', border: '#9ae6b4' },
        };
        return colors[status] || colors.asteptare;
    };

    const programariConfirmate = programari.filter(p => p.status === 'confirmata');

    const analizeTipuri = [
        'Hemogramă completă', 'Glicemie', 'Profil lipidic', 'Sumar urină',
        'Creatinină', 'Uree', 'Transaminaze (TGO, TGP)', 'TSH (Tiroidă)',
        'Calciu seric', 'Fier seric', 'Vitamina D', 'VSH',
        'Proteina C reactivă', 'Grup sanguin și Rh',
    ];

    const vaccinuriTipuri = [
        'Vaccin antigripal (gripă)',
        'Vaccin anti-COVID-19',
        'Vaccin DTP (Diftero-Tetano-Pertussis)',
        'Vaccin dT (Diftero-Tetanic adult)',
        'Vaccin antitetanic',
        'Vaccin ROR (Rujeolă-Oreion-Rubeolă)',
        'Vaccin hepatitic B',
        'Vaccin hepatitic A',
        'Vaccin HPV (Papilomavirus uman)',
        'Vaccin antipneumococic',
        'Vaccin antimeningococic',
        'Vaccin BCG (antituberculos)',
        'Vaccin antirabic',
        'Vaccin antivariolic (varicelă)',
        'Vaccin Hib (Haemophilus influenzae tip b)',
        'Vaccin antipolio (VPI)',
        'Vaccin antirotaviral',
        'Vaccin Herpes Zoster (zona zoster)',
        'Vaccin antiamaril (febră galbenă)',
        'Vaccin antitifoidic',
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🏥 Cabinet Medical</h1>
                <div style={styles.userInfo}>
                    <span style={styles.welcomeText}>👨‍⚕️ Dr. {user?.username}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Deconectare</button>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.statsRow}>
                    <div style={{ ...styles.statCard, borderTop: '4px solid #2c5282' }}>
                        <div style={styles.statNumber}>{pacienti.length}</div>
                        <div style={styles.statLabel}>👥 Pacienți</div>
                    </div>
                    <div style={{ ...styles.statCard, borderTop: '4px solid #276749' }}>
                        <div style={styles.statNumber}>{programari.length}</div>
                        <div style={styles.statLabel}>📅 Programări</div>
                    </div>
                    <div style={{ ...styles.statCard, borderTop: '4px solid #744210' }}>
                        <div style={styles.statNumber}>{consultatii.length}</div>
                        <div style={styles.statLabel}>🩺 Consultații</div>
                    </div>
                    <div style={{ ...styles.statCard, borderTop: '4px solid #6b21a8' }}>
                        <div style={styles.statNumber}>
                            {programari.filter(p => p.status === 'asteptare').length}
                        </div>
                        <div style={styles.statLabel}>⏳ În așteptare</div>
                    </div>
                </div>

                {message && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        textAlign: 'center',
                        backgroundColor: message.includes('succes') ? '#f0fff4' : '#fff5f5',
                        color: message.includes('succes') ? '#276749' : '#c53030',
                        border: `1px solid ${message.includes('succes') ? '#9ae6b4' : '#fc8181'}`,
                    }}>
                        {message}
                    </div>
                )}

                <div style={styles.tabs}>
                    {['pacienti', 'programari', 'consultatii', 'retete', 'analize', 'vaccinari', 'mesaje', 'profil'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                if (tab === 'mesaje') fetchNecitite();
                            }}
                            style={{
                                ...styles.tab,
                                backgroundColor: activeTab === tab ? '#276749' : 'white',
                                color: activeTab === tab ? 'white' : '#4a5568',
                            }}
                        >
                            {tab === 'pacienti' ? '👥 Pacienți' :
                             tab === 'programari' ? '📅 Programări' :
                             tab === 'consultatii' ? '🩺 Consultații' :
                             tab === 'retete' ? '💊 Rețete' :
                             tab === 'analize' ? '🔬 Analize' :
                             tab === 'vaccinari' ? '💉 Vaccinări' :
                             tab === 'mesaje' ? (necitite > 0 ? '💬 Mesaje 🔴' : '💬 Mesaje') :
                             '👤 Profil'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={styles.loading}>Se încarcă...</div>
                ) : (
                    <div style={styles.card}>

                        {activeTab === 'pacienti' && (
                            <>
                                <h3 style={styles.cardTitle}>Listă Pacienți ({pacienti.length})</h3>
                                {pacienti.length === 0 ? (
                                    <p style={styles.empty}>Nu ai pacienți înregistrați.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Nume</th>
                                                <th style={styles.th}>CNP</th>
                                                <th style={styles.th}>Telefon</th>
                                                <th style={styles.th}>Email</th>
                                                <th style={styles.th}>Grup sanguin</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pacienti.map(p => (
                                                <tr key={p.id} style={styles.tableRow}>
                                                    <td style={styles.td}><strong>{p.firstName} {p.lastName}</strong></td>
                                                    <td style={styles.td}>{p.cnp}</td>
                                                    <td style={styles.td}>{p.phone || '-'}</td>
                                                    <td style={styles.td}>{p.email || '-'}</td>
                                                    <td style={styles.td}>{p.bloodType || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === 'programari' && (
                            <>
                                <h3 style={styles.cardTitle}>Programări ({programari.length})</h3>
                                {programari.length === 0 ? (
                                    <p style={styles.empty}>Nu ai programări.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Pacient</th>
                                                <th style={styles.th}>Data</th>
                                                <th style={styles.th}>Motiv</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Acțiuni</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {programari.map(p => {
                                                const sc = getStatusColor(p.status);
                                                return (
                                                    <tr key={p.id} style={styles.tableRow}>
                                                        <td style={styles.td}><strong>{p.patient?.firstName} {p.patient?.lastName}</strong></td>
                                                        <td style={styles.td}>{formatDate(p.appointmentDate)}</td>
                                                        <td style={styles.td}>{p.reason || '-'}</td>
                                                        <td style={styles.td}>
                                                            <span style={{
                                                                backgroundColor: sc.bg,
                                                                color: sc.color,
                                                                border: `1px solid ${sc.border}`,
                                                                padding: '3px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                            }}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            {p.status === 'asteptare' && (
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button onClick={() => handleStatusChange(p.id, 'confirmata')} style={styles.confirmBtn}>✓ Confirmă</button>
                                                                    <button onClick={() => handleStatusChange(p.id, 'anulata')} style={styles.cancelBtn}>✕ Anulează</button>
                                                                </div>
                                                            )}
                                                            {p.status === 'confirmata' && (
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            setConsultatieData({ ...consultatieData, pacientId: p.patient?.id, programareId: p.id });
                                                                            setShowConsultatieForm(true);
                                                                            setActiveTab('consultatii');
                                                                        }}
                                                                        style={styles.consultatieBtn}
                                                                    >
                                                                        🩺 Consultație
                                                                    </button>
                                                                    <button onClick={() => handleStatusChange(p.id, 'anulata')} style={styles.cancelBtn}>✕ Anulează</button>
                                                                </div>
                                                            )}
                                                            {(p.status === 'anulata' || p.status === 'finalizata') && (
                                                                <span style={{ color: '#a0aec0', fontSize: '13px' }}>—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === 'consultatii' && (
                            <>
                                <div style={styles.topBar}>
                                    <h3 style={styles.cardTitle}>Consultații ({consultatii.length})</h3>
                                    <button onClick={() => { setShowConsultatieForm(!showConsultatieForm); setEditConsultatie(null); }} style={styles.addBtn}>
                                        {showConsultatieForm ? '✕ Anulează' : '+ Adaugă Consultație'}
                                    </button>
                                </div>

                                {showConsultatieForm && (
                                    <div style={styles.formCard}>
                                        <h4 style={{ margin: '0 0 16px', color: '#2d3748' }}>🩺 Consultație nouă</h4>
                                        <form onSubmit={handleAddConsultatie}>
                                            <div style={styles.formGrid}>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Pacient</label>
                                                    <select style={styles.input} value={consultatieData.pacientId} onChange={(e) => setConsultatieData({ ...consultatieData, pacientId: e.target.value })} required>
                                                        <option value="">-- Selectează pacientul --</option>
                                                        {pacienti.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                                                    </select>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Programare (opțional)</label>
                                                    <select style={styles.input} value={consultatieData.programareId} onChange={(e) => setConsultatieData({ ...consultatieData, programareId: e.target.value })}>
                                                        <option value="">-- Fără programare --</option>
                                                        {programariConfirmate.map(p => <option key={p.id} value={p.id}>{p.patient?.firstName} {p.patient?.lastName} - {formatDate(p.appointmentDate)}</option>)}
                                                    </select>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Simptome</label>
                                                    <input style={styles.input} type="text" value={consultatieData.symptoms} onChange={(e) => setConsultatieData({ ...consultatieData, symptoms: e.target.value })} placeholder="Ex: durere cap, febră..." />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Diagnostic *</label>
                                                    <input style={styles.input} type="text" value={consultatieData.diagnosis} onChange={(e) => setConsultatieData({ ...consultatieData, diagnosis: e.target.value })} placeholder="Ex: Gripă, Răceală..." required />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Tratament</label>
                                                    <input style={styles.input} type="text" value={consultatieData.treatment} onChange={(e) => setConsultatieData({ ...consultatieData, treatment: e.target.value })} placeholder="Ex: Paracetamol 500mg..." />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Observații</label>
                                                    <input style={styles.input} type="text" value={consultatieData.notes} onChange={(e) => setConsultatieData({ ...consultatieData, notes: e.target.value })} placeholder="Observații suplimentare..." />
                                                </div>
                                            </div>
                                            <button type="submit" style={styles.submitBtn}>Salvează consultația</button>
                                        </form>
                                    </div>
                                )}

                                {editConsultatie && (
                                    <div style={styles.formCard}>
                                        <h4 style={{ margin: '0 0 16px', color: '#2d3748' }}>✏️ Editează consultația</h4>
                                        <form onSubmit={handleEditConsultatie}>
                                            <div style={styles.formGrid}>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Simptome</label>
                                                    <input style={styles.input} type="text" value={editConsultatieData.symptoms} onChange={(e) => setEditConsultatieData({ ...editConsultatieData, symptoms: e.target.value })} placeholder="Ex: durere cap, febră..." />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Diagnostic *</label>
                                                    <input style={styles.input} type="text" value={editConsultatieData.diagnosis} onChange={(e) => setEditConsultatieData({ ...editConsultatieData, diagnosis: e.target.value })} placeholder="Ex: Gripă, Răceală..." required />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Tratament</label>
                                                    <input style={styles.input} type="text" value={editConsultatieData.treatment} onChange={(e) => setEditConsultatieData({ ...editConsultatieData, treatment: e.target.value })} placeholder="Ex: Paracetamol 500mg..." />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Observații</label>
                                                    <input style={styles.input} type="text" value={editConsultatieData.notes} onChange={(e) => setEditConsultatieData({ ...editConsultatieData, notes: e.target.value })} placeholder="Observații suplimentare..." />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                <button type="submit" style={styles.submitBtn}>Salvează modificările</button>
                                                <button type="button" onClick={() => setEditConsultatie(null)} style={{ ...styles.submitBtn, backgroundColor: '#718096' }}>Anulează</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {consultatii.length === 0 ? (
                                    <p style={styles.empty}>Nu ai consultații înregistrate.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Pacient</th>
                                                <th style={styles.th}>Data</th>
                                                <th style={styles.th}>Diagnostic</th>
                                                <th style={styles.th}>Tratament</th>
                                                <th style={styles.th}>Observații</th>
                                                <th style={styles.th}>Acțiuni</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consultatii.map(c => (
                                                <tr key={c.id} style={styles.tableRow}>
                                                    <td style={styles.td}><strong>{c.patient?.firstName} {c.patient?.lastName}</strong></td>
                                                    <td style={styles.td}>{formatDate(c.consultationDate)}</td>
                                                    <td style={styles.td}>{c.diagnosis || '-'}</td>
                                                    <td style={styles.td}>{c.treatment || '-'}</td>
                                                    <td style={styles.td}>{c.notes || '-'}</td>
                                                    <td style={styles.td}>
                                                        <button
                                                            onClick={() => {
                                                                setEditConsultatie(c.id);
                                                                setEditConsultatieData({
                                                                    symptoms: c.symptoms || '',
                                                                    diagnosis: c.diagnosis || '',
                                                                    treatment: c.treatment || '',
                                                                    notes: c.notes || '',
                                                                });
                                                                setShowConsultatieForm(false);
                                                            }}
                                                            style={styles.consultatieBtn}
                                                        >
                                                            ✏️ Editează
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === 'retete' && (
                            <>
                                <div style={styles.topBar}>
                                    <h3 style={styles.cardTitle}>Rețete ({retete.length})</h3>
                                    <button onClick={() => setShowRetetaForm(!showRetetaForm)} style={styles.addBtn}>
                                        {showRetetaForm ? '✕ Anulează' : '+ Adaugă Rețetă'}
                                    </button>
                                </div>

                                {showRetetaForm && (
                                    <div style={styles.formCard}>
                                        <h4 style={{ margin: '0 0 16px', color: '#2d3748' }}>💊 Rețetă nouă</h4>
                                        <form onSubmit={handleAddReteta}>
                                            <div style={styles.formGrid}>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Pacient *</label>
                                                    <select style={styles.input} value={retetaData.pacientId} onChange={(e) => setRetetaData({ ...retetaData, pacientId: e.target.value })} required>
                                                        <option value="">-- Selectează pacientul --</option>
                                                        {pacienti.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                                                    </select>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Tip rețetă</label>
                                                    <select style={styles.input} value={retetaData.type} onChange={(e) => setRetetaData({ ...retetaData, type: e.target.value })}>
                                                        <option value="simpla">Simplă</option>
                                                        <option value="compensata">Compensată</option>
                                                        <option value="gratuita">Gratuită</option>
                                                    </select>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Serie</label>
                                                    <input style={styles.input} type="text" value={retetaData.series} onChange={(e) => setRetetaData({ ...retetaData, series: e.target.value })} placeholder="Ex: A" />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Număr</label>
                                                    <input style={styles.input} type="text" value={retetaData.number} onChange={(e) => setRetetaData({ ...retetaData, number: e.target.value })} placeholder="Ex: 123456" />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Data emiterii</label>
                                                    <input style={styles.input} type="date" value={retetaData.issueDate} onChange={(e) => setRetetaData({ ...retetaData, issueDate: e.target.value })} />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Data expirării</label>
                                                    <input style={styles.input} type="date" value={retetaData.expiryDate} onChange={(e) => setRetetaData({ ...retetaData, expiryDate: e.target.value })} />
                                                </div>
                                                <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                                                    <label style={styles.label}>Observații / Medicamente</label>
                                                    <input style={styles.input} type="text" value={retetaData.notes} onChange={(e) => setRetetaData({ ...retetaData, notes: e.target.value })} placeholder="Ex: Paracetamol 500mg 3x/zi, Ibuprofen 400mg..." />
                                                </div>
                                            </div>
                                            <button type="submit" style={styles.submitBtn}>Salvează rețeta</button>
                                        </form>
                                    </div>
                                )}

                                {retete.length === 0 ? (
                                    <p style={styles.empty}>Nu există rețete emise.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Pacient</th>
                                                <th style={styles.th}>Tip</th>
                                                <th style={styles.th}>Serie/Nr</th>
                                                <th style={styles.th}>Data emiterii</th>
                                                <th style={styles.th}>Valabilă până</th>
                                                <th style={styles.th}>Observații</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {retete.map(r => (
                                                <tr key={r.id} style={styles.tableRow}>
                                                    <td style={styles.td}><strong>{r.patient?.firstName} {r.patient?.lastName}</strong></td>
                                                    <td style={styles.td}>{r.type || '-'}</td>
                                                    <td style={styles.td}>{r.series && r.number ? `${r.series}/${r.number}` : '-'}</td>
                                                    <td style={styles.td}>{formatDateSimple(r.issueDate)}</td>
                                                    <td style={styles.td}>{formatDateSimple(r.expiryDate)}</td>
                                                    <td style={styles.td}>{r.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === 'analize' && (
                            <>
                                <div style={styles.topBar}>
                                    <h3 style={styles.cardTitle}>Analize ({analize.length})</h3>
                                    <button onClick={() => setShowAnalizaForm(!showAnalizaForm)} style={styles.addBtn}>
                                        {showAnalizaForm ? '✕ Anulează' : '+ Programează Analiză'}
                                    </button>
                                </div>

                                {showAnalizaForm && (
                                    <div style={styles.formCard}>
                                        <h4 style={{ margin: '0 0 16px', color: '#2d3748' }}>🔬 Analiză nouă</h4>
                                        <form onSubmit={handleAddAnaliza}>
                                            <div style={styles.formGrid}>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Pacient *</label>
                                                    <select style={styles.input} value={analizaData.pacientId} onChange={(e) => setAnalizaData({ ...analizaData, pacientId: e.target.value })} required>
                                                        <option value="">-- Selectează pacientul --</option>
                                                        {pacienti.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                                                    </select>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Tip analiză *</label>
                                                    <select style={styles.input} value={analizaData.analysisType} onChange={(e) => setAnalizaData({ ...analizaData, analysisType: e.target.value })} required>
                                                        <option value="">-- Selectează tipul --</option>
                                                        {analizeTipuri.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Laborator</label>
                                                    <input style={styles.input} type="text" value={analizaData.laboratory} onChange={(e) => setAnalizaData({ ...analizaData, laboratory: e.target.value })} placeholder="Ex: Synevo, MedLife..." />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Data recoltare</label>
                                                    <input style={styles.input} type="date" value={analizaData.collectionDate} onChange={(e) => setAnalizaData({ ...analizaData, collectionDate: e.target.value })} />
                                                </div>
                                            </div>
                                            <button type="submit" style={styles.submitBtn}>Programează analiza</button>
                                        </form>
                                    </div>
                                )}

                                {analize.length === 0 ? (
                                    <p style={styles.empty}>Nu există analize programate.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Pacient</th>
                                                <th style={styles.th}>Tip analiză</th>
                                                <th style={styles.th}>Laborator</th>
                                                <th style={styles.th}>Data recoltare</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Acțiuni</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analize.map(a => {
                                                const sc = getStatusColor(a.status);
                                                return (
                                                    <tr key={a.id} style={styles.tableRow}>
                                                        <td style={styles.td}><strong>{a.patient?.firstName} {a.patient?.lastName}</strong></td>
                                                        <td style={styles.td}>{a.analysisType || '-'}</td>
                                                        <td style={styles.td}>{a.laboratory || '-'}</td>
                                                        <td style={styles.td}>{formatDateSimple(a.collectionDate)}</td>
                                                        <td style={styles.td}>
                                                            <span style={{
                                                                backgroundColor: sc.bg,
                                                                color: sc.color,
                                                                border: `1px solid ${sc.border}`,
                                                                padding: '3px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                            }}>
                                                                {a.status}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            {a.status === 'in_asteptare' && (
                                                                <button
                                                                    onClick={() => {
                                                                        const rezultat = window.prompt('Introduceți rezultatul analizei:');
                                                                        if (rezultat) {
                                                                            api.put(`/medic/analize/${a.id}/rezultat?rezultat=${encodeURIComponent(rezultat)}`)
                                                                                .then(() => {
                                                                                    setMessage('Rezultat salvat cu succes!');
                                                                                    fetchData();
                                                                                    setTimeout(() => setMessage(''), 3000);
                                                                                })
                                                                                .catch(() => setMessage('Eroare la salvarea rezultatului!'));
                                                                        }
                                                                    }}
                                                                    style={styles.consultatieBtn}
                                                                >
                                                                    ✍️ Adaugă rezultat
                                                                </button>
                                                            )}
                                                            {a.status === 'finalizat' && (
                                                                <span style={{ color: '#276749', fontSize: '13px' }}>
                                                                    ✓ {a.result}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === 'vaccinari' && (
                            <>
                                <div style={styles.topBar}>
                                    <h3 style={styles.cardTitle}>Vaccinări ({vaccinari.length})</h3>
                                    <button onClick={() => setShowVaccinareForm(!showVaccinareForm)} style={styles.addBtn}>
                                        {showVaccinareForm ? '✕ Anulează' : '+ Adaugă Vaccinare'}
                                    </button>
                                </div>

                                {showVaccinareForm && (
                                    <div style={styles.formCard}>
                                        <h4 style={{ margin: '0 0 16px', color: '#2d3748' }}>💉 Vaccinare nouă</h4>
                                        <form onSubmit={handleAddVaccinare}>
                                            <div style={styles.formGrid}>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Pacient *</label>
                                                    <select style={styles.input} value={vaccinareData.pacientId} onChange={(e) => setVaccinareData({ ...vaccinareData, pacientId: e.target.value })} required>
                                                        <option value="">-- Selectează pacientul --</option>
                                                        {pacienti.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                                                    </select>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Vaccin *</label>
                                                    <select style={styles.input} value={vaccinareData.vaccine} onChange={(e) => setVaccinareData({ ...vaccinareData, vaccine: e.target.value })} required>
                                                        <option value="">-- Selectează vaccinul --</option>
                                                        {vaccinuriTipuri.map(v => <option key={v} value={v}>{v}</option>)}
                                                    </select>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Data administrării</label>
                                                    <input style={styles.input} type="date" value={vaccinareData.administrationDate} onChange={(e) => setVaccinareData({ ...vaccinareData, administrationDate: e.target.value })} />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>Lot</label>
                                                    <input style={styles.input} type="text" value={vaccinareData.lot} onChange={(e) => setVaccinareData({ ...vaccinareData, lot: e.target.value })} placeholder="Ex: AB12345" />
                                                </div>
                                                <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                                                    <label style={styles.label}>Următoarea vaccinare (opțional)</label>
                                                    <input style={styles.input} type="date" value={vaccinareData.nextBooster} onChange={(e) => setVaccinareData({ ...vaccinareData, nextBooster: e.target.value })} />
                                                </div>
                                            </div>
                                            <button type="submit" style={styles.submitBtn}>Salvează vaccinarea</button>
                                        </form>
                                    </div>
                                )}

                                {vaccinari.length === 0 ? (
                                    <p style={styles.empty}>Nu există vaccinări înregistrate.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Pacient</th>
                                                <th style={styles.th}>Vaccin</th>
                                                <th style={styles.th}>Data administrării</th>
                                                <th style={styles.th}>Lot</th>
                                                <th style={styles.th}>Administrat de</th>
                                                <th style={styles.th}>Următoarea vaccinare </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vaccinari.map(v => (
                                                <tr key={v.id} style={styles.tableRow}>
                                                    <td style={styles.td}><strong>{v.patient?.firstName} {v.patient?.lastName}</strong></td>
                                                    <td style={styles.td}>{v.vaccine || '-'}</td>
                                                    <td style={styles.td}>{formatDateSimple(v.administrationDate)}</td>
                                                    <td style={styles.td}>{v.lot || '-'}</td>
                                                    <td style={styles.td}>{v.administeredBy || '-'}</td>
                                                    <td style={styles.td}>{formatDateSimple(v.nextBooster)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === 'mesaje' && profil && (
                            <Mesaje currentUserId={profil.user?.id} />
                        )}

                        {activeTab === 'profil' && profil && (
                            <>
                                <div style={styles.topBar}>
                                    <h3 style={styles.cardTitle}>Profilul meu</h3>
                                    <button onClick={() => setEditProfil(!editProfil)} style={styles.addBtn}>
                                        {editProfil ? '✕ Anulează' : '✏️ Editează profil'}
                                    </button>
                                </div>

                                {editProfil ? (
                                    <form onSubmit={handleUpdateProfil}>
                                        <div style={styles.profilGrid}>
                                            {[
                                                { label: 'Prenume', field: 'firstName' },
                                                { label: 'Nume', field: 'lastName' },
                                                { label: 'Specializare', field: 'specialization' },
                                                { label: 'Telefon', field: 'phone' },
                                                { label: 'Cod medic', field: 'stamp' },
                                            ].map(item => (
                                                <div key={item.field} style={styles.profilItem}>
                                                    <div style={styles.profilLabel}>{item.label}</div>
                                                    <input style={styles.input} value={profilForm[item.field] || ''} onChange={(e) => setProfilForm({ ...profilForm, [item.field]: e.target.value })} placeholder={item.label} />
                                                </div>
                                            ))}
                                        </div>
                                        <button type="submit" style={{ ...styles.submitBtn, marginTop: '16px' }}>Salvează modificările</button>
                                    </form>
                                ) : (
                                    <div style={styles.profilGrid}>
                                        {[
                                            { label: 'Prenume', value: profil.firstName },
                                            { label: 'Nume', value: profil.lastName },
                                            { label: 'CNP', value: profil.cnp },
                                            { label: 'Specializare', value: profil.specialization },
                                            { label: 'Telefon', value: profil.phone },
                                            { label: 'Cod medic', value: profil.stamp },
                                        ].map(item => (
                                            <div key={item.label} style={styles.profilItem}>
                                                <div style={styles.profilLabel}>{item.label}</div>
                                                <div style={styles.profilValue}>{item.value || '-'}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: {
        backgroundColor: '#276749',
        color: 'white',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { margin: 0, fontSize: '20px' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
    welcomeText: { fontSize: '14px' },
    logoutBtn: {
        backgroundColor: 'white',
        color: '#276749',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    content: { padding: '32px' },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    statNumber: { fontSize: '36px', fontWeight: '700', color: '#2d3748' },
    statLabel: { fontSize: '14px', color: '#718096', marginTop: '4px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
    tab: {
        padding: '10px 20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
    },
    loading: { textAlign: 'center', padding: '40px', color: '#718096' },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    cardTitle: { margin: 0, color: '#2d3748' },
    addBtn: {
        backgroundColor: '#276749',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
    },
    formCard: {
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
    },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: {
        marginBottom: '6px',
        color: '#4a5568',
        fontWeight: '500',
        fontSize: '14px',
    },
    input: {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    submitBtn: {
        backgroundColor: '#276749',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    empty: { color: '#718096', textAlign: 'center', padding: '40px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f7fafc' },
    th: {
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '13px',
        color: '#4a5568',
        fontWeight: '600',
        borderBottom: '1px solid #e2e8f0',
    },
    tableRow: { borderBottom: '1px solid #f0f4f8' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#2d3748' },
    confirmBtn: {
        backgroundColor: '#f0fff4',
        color: '#276749',
        border: '1px solid #9ae6b4',
        padding: '4px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
    },
    cancelBtn: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        border: '1px solid #fc8181',
        padding: '4px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
    },
    consultatieBtn: {
        backgroundColor: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #93c5fd',
        padding: '4px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
    },
    profilGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
    },
    profilItem: {
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        padding: '16px',
    },
    profilLabel: {
        fontSize: '12px',
        color: '#718096',
        fontWeight: '600',
        marginBottom: '4px',
        textTransform: 'uppercase',
    },
    profilValue: {
        fontSize: '16px',
        color: '#2d3748',
        fontWeight: '500',
    },
};

export default MedicDashboard;