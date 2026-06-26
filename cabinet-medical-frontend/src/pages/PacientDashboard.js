import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Mesaje from './Mesaje';

const PacientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('programari');
    const [profil, setProfil] = useState(null);
    const [programari, setProgramari] = useState([]);
    const [consultatii, setConsultatii] = useState([]);
    const [retete, setRetete] = useState([]);
    const [analize, setAnalize] = useState([]);
    const [vaccinari, setVaccinari] = useState([]);
    const [medici, setMedici] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [editProfil, setEditProfil] = useState(false);
    const [necitite, setNecitite] = useState(0);
    const [oreDisponibile, setOreDisponibile] = useState([]);
    const [loadingOre, setLoadingOre] = useState(false);
    const [profilForm, setProfilForm] = useState({
        phone: '', email: '', address: '', bloodType: '', rh: '', allergies: '',
    });
    const [formData, setFormData] = useState({
        medicId: '', appointmentDateOnly: '', appointmentTime: '', reason: '',
    });

    useEffect(() => {
        fetchData();
        fetchNecitite();
        const interval = setInterval(fetchNecitite, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (formData.medicId && formData.appointmentDateOnly) {
            fetchOreDisponibile();
        } else {
            setOreDisponibile([]);
        }
    }, [formData.medicId, formData.appointmentDateOnly]);

    const fetchOreDisponibile = async () => {
        setLoadingOre(true);
        try {
            const response = await api.get('/pacient/ore-disponibile', {
                params: { medicId: formData.medicId, data: formData.appointmentDateOnly }
            });
            setOreDisponibile(response.data);
            setFormData(prev => ({ ...prev, appointmentTime: '' }));
        } catch (err) {
            setOreDisponibile([]);
        } finally {
            setLoadingOre(false);
        }
    };

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
            const [pr, c, r, a, p, m, v] = await Promise.allSettled([
                api.get('/pacient/programari'),
                api.get('/pacient/consultatii'),
                api.get('/pacient/retete'),
                api.get('/pacient/analize'),
                api.get('/pacient/profil'),
                api.get('/pacient/medici'),
                api.get('/pacient/vaccinari'),
            ]);
            if (pr.status === 'fulfilled') setProgramari(pr.value.data);
            if (c.status === 'fulfilled') setConsultatii(c.value.data);
            if (r.status === 'fulfilled') setRetete(r.value.data);
            if (a.status === 'fulfilled') setAnalize(a.value.data);
            if (p.status === 'fulfilled') {
                setProfil(p.value.data);
                setProfilForm({
                    phone: p.value.data.phone || '',
                    email: p.value.data.email || '',
                    address: p.value.data.address || '',
                    bloodType: p.value.data.bloodType || '',
                    rh: p.value.data.rh || '',
                    allergies: p.value.data.allergies || '',
                });
            }
            if (m.status === 'fulfilled') setMedici(m.value.data);
            if (v.status === 'fulfilled') setVaccinari(v.value.data);
        } catch (err) {
            console.error('Eroare la încărcarea datelor', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleProgramare = async (e) => {
        e.preventDefault();
        if (!formData.appointmentTime) {
            setMessage('Eroare: selectați o oră disponibilă!');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        try {
            const appointmentDate = `${formData.appointmentDateOnly}T${formData.appointmentTime}:00`;
            await api.post('/pacient/programari', {
                medicId: parseInt(formData.medicId),
                appointmentDate: appointmentDate,
                reason: formData.reason,
            });
            setMessage('Programare adăugată cu succes!');
            setShowForm(false);
            setFormData({ medicId: '', appointmentDateOnly: '', appointmentTime: '', reason: '' });
            setOreDisponibile([]);
            const pr = await api.get('/pacient/programari');
            setProgramari(pr.data);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errMsg = err.response?.data || 'Eroare la adăugarea programării!';
            setMessage(typeof errMsg === 'string' ? errMsg : 'Eroare la adăugarea programării!');
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const handleAnuleaza = async (id) => {
        if (!window.confirm('Ești sigur că vrei să anulezi această programare?')) return;
        try {
            await api.put(`/pacient/programari/${id}/anuleaza`);
            setMessage('Programare anulată cu succes!');
            const pr = await api.get('/pacient/programari');
            setProgramari(pr.data);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la anularea programării!');
        }
    };

    const handleUpdateProfil = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/pacient/profil', profilForm);
            setProfil(response.data);
            setEditProfil(false);
            setMessage('Profil actualizat cu succes!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la actualizarea profilului!');
        }
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('consultatii-pdf');
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.setFontSize(16);
        pdf.text('Istoricul Consultatiilor', 14, 15);
        pdf.setFontSize(11);
        pdf.text(`Pacient: ${profil?.firstName} ${profil?.lastName}`, 14, 25);
        pdf.text(`Data: ${new Date().toLocaleDateString('ro-RO')}`, 14, 32);
        pdf.addImage(imgData, 'PNG', 0, 40, pdfWidth, pdfHeight);
        pdf.save(`consultatii_${profil?.lastName}_${profil?.firstName}.pdf`);
    };

    const removeDiacritics = (str) => {
        if (!str) return '';
        return str
            .replace(/ă/g, 'a').replace(/Ă/g, 'A')
            .replace(/â/g, 'a').replace(/Â/g, 'A')
            .replace(/î/g, 'i').replace(/Î/g, 'I')
            .replace(/ș/g, 's').replace(/Ș/g, 'S')
            .replace(/ş/g, 's').replace(/Ş/g, 'S')
            .replace(/ț/g, 't').replace(/Ț/g, 'T')
            .replace(/ţ/g, 't').replace(/Ţ/g, 'T');
    };

    const handleExportRetetaPDF = (reteta) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageW = pdf.internal.pageSize.getWidth();

        pdf.setFillColor(39, 103, 73);
        pdf.rect(0, 0, pageW, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CABINET MEDICAL', pageW / 2, 13, { align: 'center' });
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Reteta Medicala', pageW / 2, 22, { align: 'center' });

        pdf.setTextColor(39, 103, 73);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RETETA', pageW / 2, 45, { align: 'center' });

        pdf.setDrawColor(39, 103, 73);
        pdf.setLineWidth(0.5);
        pdf.line(14, 50, pageW - 14, 50);

        pdf.setTextColor(45, 55, 72);
        pdf.setFontSize(11);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Date medic:', 14, 62);
        pdf.setFont('helvetica', 'normal');
        pdf.text(removeDiacritics(`Dr. ${reteta.doctor?.firstName || ''} ${reteta.doctor?.lastName || ''}`), 14, 70);
        if (reteta.doctor?.specialization) {
            pdf.text(removeDiacritics(`Specializare: ${reteta.doctor.specialization}`), 14, 77);
        }

        pdf.setFont('helvetica', 'bold');
        pdf.text('Date pacient:', 14, 92);
        pdf.setFont('helvetica', 'normal');
        pdf.text(removeDiacritics(`${profil?.firstName || ''} ${profil?.lastName || ''}`), 14, 100);
        if (profil?.cnp) pdf.text(`CNP: ${profil.cnp}`, 14, 107);
        if (profil?.address) pdf.text(removeDiacritics(`Adresa: ${profil.address}`), 14, 114);

        pdf.line(14, 122, pageW - 14, 122);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Detalii reteta:', 14, 132);
        pdf.setFont('helvetica', 'normal');

        let y = 140;
        if (reteta.type) { pdf.text(removeDiacritics(`Tip: ${reteta.type}`), 14, y); y += 8; }
        if (reteta.series && reteta.number) { pdf.text(`Serie/Numar: ${reteta.series}/${reteta.number}`, 14, y); y += 8; }
        if (reteta.issueDate) { pdf.text(`Data emiterii: ${reteta.issueDate}`, 14, y); y += 8; }
        if (reteta.expiryDate) { pdf.text(`Valabila pana la: ${reteta.expiryDate}`, 14, y); y += 8; }

        if (reteta.notes) {
            y += 4;
            pdf.line(14, y, pageW - 14, y);
            y += 10;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Medicamente / Observatii:', 14, y);
            y += 8;
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(removeDiacritics(reteta.notes), pageW - 28);
            pdf.text(lines, 14, y);
        }

        pdf.setFillColor(39, 103, 73);
        pdf.rect(0, 280, pageW, 17, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generat la data: ${new Date().toLocaleDateString('ro-RO')}`, pageW / 2, 290, { align: 'center' });

        pdf.save(`reteta_${profil?.lastName || 'pacient'}_${reteta.issueDate || 'data'}.pdf`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('ro-RO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            asteptare: { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
            confirmata: { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
            finalizata: { bg: '#f0fff4', color: '#276749', border: '#9ae6b4' },
            anulata: { bg: '#fff5f5', color: '#c53030', border: '#fc8181' },
            in_desfasurare: { bg: '#f5f3ff', color: '#5b21b6', border: '#c4b5fd' },
        };
        return colors[status] || colors.asteptare;
    };

    const tabs = [
        { id: 'programari', label: '📅 Programări' },
        { id: 'medici', label: '👨‍⚕️ Medici' },
        { id: 'consultatii', label: '🩺 Consultații' },
        { id: 'retete', label: '💊 Rețete' },
        { id: 'analize', label: '🔬 Analize' },
        { id: 'vaccinari', label: '💉 Vaccinări' },
        { id: 'mesaje', label: necitite > 0 ? `💬 Mesaje 🔴` : '💬 Mesaje' },
        { id: 'profil', label: '👤 Profil' },
    ];

    const minDate = new Date().toISOString().split('T')[0];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🏥 Cabinet Medical</h1>
                <div style={styles.userInfo}>
                    <span style={styles.welcomeText}>👤 {user?.username}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Deconectare</button>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.statsRow}>
                    {[
                        { num: programari.length, label: '📅 Programări', color: '#2c5282' },
                        { num: consultatii.length, label: '🩺 Consultații', color: '#276749' },
                        { num: retete.length, label: '💊 Rețete', color: '#744210' },
                        { num: analize.length, label: '🔬 Analize', color: '#6b21a8' },
                    ].map((s, i) => (
                        <div key={i} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
                            <div style={styles.statNumber}>{s.num}</div>
                            <div style={styles.statLabel}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div style={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'mesaje') fetchNecitite();
                            }}
                            style={{
                                ...styles.tab,
                                backgroundColor: activeTab === tab.id ? '#744210' : 'white',
                                color: activeTab === tab.id ? 'white' : '#4a5568',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
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

                {loading ? (
                    <div style={styles.loading}>Se încarcă...</div>
                ) : (
                    <div style={styles.card}>
                        {activeTab === 'programari' && (
                            <>
                                <div style={styles.topBar}>
                                    <h3 style={styles.cardTitle}>Programările mele ({programari.length})</h3>
                                    <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
                                        {showForm ? '✕ Anulează' : '+ Programare nouă'}
                                    </button>
                                </div>

                                {showForm && (
                                    <div style={styles.formCard}>
                                        <h4 style={{ margin: '0 0 16px', color: '#2d3748' }}>📅 Programare nouă</h4>
                                        <form onSubmit={handleProgramare}>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Alege medicul</label>
                                                <select style={styles.input} value={formData.medicId} onChange={(e) => setFormData({ ...formData, medicId: e.target.value, appointmentTime: '' })} required>
                                                    <option value="">-- Selectează medicul --</option>
                                                    {medici.map(m => (
                                                        <option key={m.id} value={m.id}>Dr. {m.firstName} {m.lastName} - {m.specialization}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Data</label>
                                                <input
                                                    style={styles.input}
                                                    type="date"
                                                    min={minDate}
                                                    value={formData.appointmentDateOnly}
                                                    onChange={(e) => setFormData({ ...formData, appointmentDateOnly: e.target.value, appointmentTime: '' })}
                                                    required
                                                />
                                            </div>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Ora disponibilă (8:00 - 16:00)</label>
                                                <select
                                                    style={styles.input}
                                                    value={formData.appointmentTime}
                                                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                                                    required
                                                    disabled={!formData.medicId || !formData.appointmentDateOnly || loadingOre}
                                                >
                                                    <option value="">
                                                        {!formData.medicId || !formData.appointmentDateOnly
                                                            ? '-- Selectează mai întâi medicul și data --'
                                                            : loadingOre
                                                                ? 'Se încarcă orele...'
                                                                : oreDisponibile.length === 0
                                                                    ? 'Nu mai sunt ore disponibile în această zi'
                                                                    : '-- Selectează ora --'}
                                                    </option>
                                                    {oreDisponibile.map(ora => (
                                                        <option key={ora} value={ora}>{ora}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Motiv consultație</label>
                                                <input style={styles.input} type="text" placeholder="Ex: Control periodic, durere..." value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required />
                                            </div>
                                            <button type="submit" style={styles.submitBtn}>Confirmă programarea</button>
                                        </form>
                                    </div>
                                )}

                                {programari.length === 0 ? (
                                    <p style={styles.empty}>Nu ai programări. Apasă "+ Programare nouă"!</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Data</th>
                                                <th style={styles.th}>Medic</th>
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
                                                        <td style={styles.td}>{formatDate(p.appointmentDate)}</td>
                                                        <td style={styles.td}>Dr. {p.doctor?.firstName} {p.doctor?.lastName}</td>
                                                        <td style={styles.td}>{p.reason || '-'}</td>
                                                        <td style={styles.td}>
                                                            <span style={{ backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            {(p.status === 'asteptare' || p.status === 'confirmata') && (
                                                                <button onClick={() => handleAnuleaza(p.id)} style={styles.cancelBtn}>✕ Anulează</button>
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

                        {activeTab === 'medici' && (
                            <>
                                <h3 style={styles.cardTitle}>Medicii disponibili ({medici.length})</h3>
                                <div style={styles.mediciGrid}>
                                    {medici.map(m => (
                                        <div key={m.id} style={styles.medicCard}>
                                            <div style={styles.medicIcon}>👨‍⚕️</div>
                                            <div style={styles.medicName}>Dr. {m.firstName} {m.lastName}</div>
                                            <div style={styles.medicSpec}>{m.specialization}</div>
                                            <div style={styles.medicInfo}>📞 {m.phone || '-'}</div>
                                            <button onClick={() => { setFormData({ ...formData, medicId: m.id }); setActiveTab('programari'); setShowForm(true); }} style={styles.programeazaBtn}>
                                                Programează-te
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'consultatii' && (
                            <>
                                <div style={styles.topBar}>
                                    <h3 style={styles.cardTitle}>Consultațiile mele ({consultatii.length})</h3>
                                    {consultatii.length > 0 && (
                                        <button onClick={handleExportPDF} style={styles.exportBtn}>📄 Export PDF</button>
                                    )}
                                </div>
                                <div id="consultatii-pdf">
                                    {consultatii.length === 0 ? (
                                        <p style={styles.empty}>Nu ai consultații.</p>
                                    ) : (
                                        <table style={styles.table}>
                                            <thead>
                                                <tr style={styles.tableHeader}>
                                                    <th style={styles.th}>Data</th>
                                                    <th style={styles.th}>Medic</th>
                                                    <th style={styles.th}>Diagnostic</th>
                                                    <th style={styles.th}>Tratament</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {consultatii.map(c => (
                                                    <tr key={c.id} style={styles.tableRow}>
                                                        <td style={styles.td}>{formatDate(c.consultationDate)}</td>
                                                        <td style={styles.td}>Dr. {c.doctor?.firstName} {c.doctor?.lastName}</td>
                                                        <td style={styles.td}>{c.diagnosis || '-'}</td>
                                                        <td style={styles.td}>{c.treatment || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'retete' && (
                            <>
                                <h3 style={styles.cardTitle}>Rețetele mele ({retete.length})</h3>
                                {retete.length === 0 ? (
                                    <p style={styles.empty}>Nu ai rețete.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Data emiterii</th>
                                                <th style={styles.th}>Medic</th>
                                                <th style={styles.th}>Tip</th>
                                                <th style={styles.th}>Valabilă până la</th>
                                                <th style={styles.th}>Observații</th>
                                                <th style={styles.th}>Acțiuni</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {retete.map(r => (
                                                <tr key={r.id} style={styles.tableRow}>
                                                    <td style={styles.td}>{r.issueDate || '-'}</td>
                                                    <td style={styles.td}>Dr. {r.doctor?.firstName} {r.doctor?.lastName}</td>
                                                    <td style={styles.td}>{r.type || '-'}</td>
                                                    <td style={styles.td}>{r.expiryDate || '-'}</td>
                                                    <td style={styles.td}>{r.notes || '-'}</td>
                                                    <td style={styles.td}>
                                                        <button onClick={() => handleExportRetetaPDF(r)} style={styles.exportBtn}>
                                                            📄 PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === 'analize' && (
                            <>
                                <h3 style={styles.cardTitle}>Analizele mele ({analize.length})</h3>
                                {analize.length === 0 ? (
                                    <p style={styles.empty}>Nu ai analize.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
                                                <th style={styles.th}>Tip analiză</th>
                                                <th style={styles.th}>Laborator</th>
                                                <th style={styles.th}>Data recoltare</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Rezultat</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analize.map(a => (
                                                <tr key={a.id} style={styles.tableRow}>
                                                    <td style={styles.td}>{a.analysisType || '-'}</td>
                                                    <td style={styles.td}>{a.laboratory || '-'}</td>
                                                    <td style={styles.td}>{a.collectionDate || '-'}</td>
                                                    <td style={styles.td}>
                                                        <span style={{
                                                            backgroundColor: a.status === 'finalizat' ? '#f0fff4' : '#fffbeb',
                                                            color: a.status === 'finalizat' ? '#276749' : '#92400e',
                                                            border: `1px solid ${a.status === 'finalizat' ? '#9ae6b4' : '#fcd34d'}`,
                                                            padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
                                                        }}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>{a.result || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}

                        {activeTab === 'vaccinari' && (
                            <>
                                <h3 style={styles.cardTitle}>Vaccinările mele ({vaccinari.length})</h3>
                                {vaccinari.length === 0 ? (
                                    <p style={styles.empty}>Nu ai vaccinări înregistrate.</p>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.tableHeader}>
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
                                                    <td style={styles.td}>{v.vaccine || '-'}</td>
                                                    <td style={styles.td}>{v.administrationDate || '-'}</td>
                                                    <td style={styles.td}>{v.lot || '-'}</td>
                                                    <td style={styles.td}>{v.administeredBy || '-'}</td>
                                                    <td style={styles.td}>{v.nextBooster || '-'}</td>
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
                                                { label: 'Telefon', field: 'phone' },
                                                { label: 'Email', field: 'email' },
                                                { label: 'Adresă', field: 'address' },
                                                { label: 'Alergii', field: 'allergies' },
                                            ].map(item => (
                                                <div key={item.field} style={styles.profilItem}>
                                                    <div style={styles.profilLabel}>{item.label}</div>
                                                    <input style={styles.input} value={profilForm[item.field] || ''} onChange={(e) => setProfilForm({ ...profilForm, [item.field]: e.target.value })} placeholder={item.label} />
                                                </div>
                                            ))}
                                            <div style={styles.profilItem}>
                                                <div style={styles.profilLabel}>Grup sanguin</div>
                                                <select style={styles.input} value={profilForm.bloodType || ''} onChange={(e) => setProfilForm({ ...profilForm, bloodType: e.target.value })}>
                                                    <option value="">-- Selectează --</option>
                                                    {['A', 'B', 'AB', 'O'].map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.profilItem}>
                                                <div style={styles.profilLabel}>RH</div>
                                                <select style={styles.input} value={profilForm.rh || ''} onChange={(e) => setProfilForm({ ...profilForm, rh: e.target.value })}>
                                                    <option value="">-- Selectează --</option>
                                                    <option value="+">RH+</option>
                                                    <option value="-">RH-</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button type="submit" style={{ ...styles.submitBtn, marginTop: '16px' }}>Salvează modificările</button>
                                    </form>
                                ) : (
                                    <div style={styles.profilGrid}>
                                        {[
                                            { label: 'Prenume', value: profil.firstName },
                                            { label: 'Nume', value: profil.lastName },
                                            { label: 'CNP', value: profil.cnp },
                                            { label: 'Telefon', value: profil.phone },
                                            { label: 'Email', value: profil.email },
                                            { label: 'Adresă', value: profil.address },
                                            { label: 'Grup sanguin', value: profil.bloodType },
                                            { label: 'RH', value: profil.rh ? `RH${profil.rh}` : '-' },
                                            { label: 'Alergii', value: profil.allergies },
                                            { label: 'Medic de familie', value: profil.doctor ? `Dr. ${profil.doctor.firstName} ${profil.doctor.lastName}` : '-' },
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
        backgroundColor: '#744210',
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
        color: '#744210',
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
        backgroundColor: '#744210',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
    },
    exportBtn: {
        backgroundColor: '#2c5282',
        color: 'white',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '13px',
    },
    formCard: {
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
    },
    inputGroup: { marginBottom: '12px' },
    label: {
        display: 'block',
        marginBottom: '6px',
        color: '#4a5568',
        fontWeight: '500',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    submitBtn: {
        backgroundColor: '#744210',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        marginTop: '8px',
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
    mediciGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
    },
    medicCard: {
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
    },
    medicIcon: { fontSize: '48px', marginBottom: '8px' },
    medicName: { fontWeight: '600', color: '#2d3748', fontSize: '16px', marginBottom: '4px' },
    medicSpec: { color: '#276749', fontSize: '14px', marginBottom: '8px' },
    medicInfo: { color: '#718096', fontSize: '13px', marginBottom: '16px' },
    programeazaBtn: {
        backgroundColor: '#744210',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
        width: '100%',
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

export default PacientDashboard;