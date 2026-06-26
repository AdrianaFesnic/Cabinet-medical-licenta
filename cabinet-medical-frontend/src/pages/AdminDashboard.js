import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('utilizatori');
    const [utilizatori, setUtilizatori] = useState([]);
    const [medici, setMedici] = useState([]);
    const [statistici, setStatistici] = useState(null);
    const [showAddDoctor, setShowAddDoctor] = useState(false);
    const [editMedic, setEditMedic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [dataSelectata, setDataSelectata] = useState('');
    const [programariZi, setProgramariZi] = useState(null);
    const [formData, setFormData] = useState({
        username: '', password: '', email: '',
        firstName: '', lastName: '', cnp: '', phone: '',
    });
    const [editForm, setEditForm] = useState({
        firstName: '', lastName: '', specialization: '', phone: '', stamp: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [u, m, s] = await Promise.allSettled([
                api.get('/admin/utilizatori'),
                api.get('/admin/medici'),
                api.get('/admin/statistici'),
            ]);
            if (u.status === 'fulfilled') setUtilizatori(u.value.data);
            if (m.status === 'fulfilled') setMedici(m.value.data);
            if (s.status === 'fulfilled') setStatistici(s.value.data);
        } catch (err) {
            console.error('Eroare la încărcarea datelor');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/register/doctor', formData);
            setMessage('Medic adăugat cu succes!');
            setShowAddDoctor(false);
            setFormData({ username: '', password: '', email: '', firstName: '', lastName: '', cnp: '', phone: '' });
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la adăugarea medicului!');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUser = async (id) => {
        try {
            await api.put(`/admin/utilizatori/${id}/toggle`);
            fetchData();
        } catch (err) {
            console.error('Eroare la modificarea statusului');
        }
    };

    const handleDeleteUser = async (id, username) => {
        if (!window.confirm(`Ești sigur că vrei să ștergi utilizatorul "${username}"?`)) return;
        try {
            await api.delete(`/admin/utilizatori/${id}`);
            setMessage('Utilizator șters cu succes!');
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la ștergerea utilizatorului!');
        }
    };

    const handleEditMedic = (medic) => {
        setEditMedic(medic);
        setEditForm({
            firstName: medic.firstName || '',
            lastName: medic.lastName || '',
            specialization: medic.specialization || '',
            phone: medic.phone || '',
            stamp: medic.stamp || '',
        });
    };

    const handleUpdateMedic = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/medici/${editMedic.id}`, editForm);
            setMessage('Medic actualizat cu succes!');
            setEditMedic(null);
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Eroare la actualizarea medicului!');
        }
    };

    const handleCautaZi = async () => {
        if (!dataSelectata) return;
        try {
            const response = await api.get(`/admin/programari/zi?data=${dataSelectata}`);
            setProgramariZi(response.data);
        } catch (err) {
            console.error('Eroare la căutarea programărilor');
        }
    };

    const getRolColor = (rol) => {
        if (rol === 'admin') return '#2c5282';
        if (rol === 'medic') return '#276749';
        return '#744210';
    };

    const getStatusColor = (status) => {
        const colors = {
            asteptare: { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
            confirmata: { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
            finalizata: { bg: '#f0fff4', color: '#276749', border: '#9ae6b4' },
            anulata: { bg: '#fff5f5', color: '#c53030', border: '#fc8181' },
        };
        return colors[status] || colors.asteptare;
    };

    const LUNI = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const barData = statistici ? [
        { name: 'Pacienți', valoare: statistici.totalPacienti, fill: '#2c5282' },
        { name: 'Medici', valoare: statistici.totalMedici, fill: '#276749' },
        { name: 'Programări', valoare: statistici.totalProgramari, fill: '#744210' },
        { name: 'Consultații', valoare: statistici.totalConsultatii, fill: '#6b21a8' },
    ] : [];

    const pieData = statistici?.programariStatus ? Object.entries(statistici.programariStatus).map(([status, count]) => ({
        name: status,
        value: Number(count),
    })) : [];

    const lunaData = statistici?.programariLuna ? LUNI.map((luna, index) => ({
        luna,
        programari: Number(statistici.programariLuna[String(index + 1)] || 0),
    })) : [];

    const topMediciData = statistici?.topMedici ? statistici.topMedici.map(m => ({
        name: `Dr. ${m.nume}`,
        consultatii: Number(m.total),
    })) : [];

    const PIE_COLORS = ['#fcd34d', '#93c5fd', '#9ae6b4', '#fc8181', '#c4b5fd'];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🏥 Cabinet Medical</h1>
                <div style={styles.userInfo}>
                    <span style={styles.welcomeText}>👋 {user?.username} (Admin)</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Deconectare</button>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.topBar}>
                    <h2 style={styles.pageTitle}>Panou Administrator</h2>
                    <button
                        onClick={() => setShowAddDoctor(!showAddDoctor)}
                        style={styles.addBtn}
                    >
                        {showAddDoctor ? '✕ Anulează' : '+ Adaugă Medic'}
                    </button>
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

                {showAddDoctor && (
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>👨‍⚕️ Adaugă Medic Nou</h3>
                        <form onSubmit={handleAddDoctor}>
                            <div style={styles.formGrid}>
                                {[
                                    { name: 'firstName', label: 'Prenume' },
                                    { name: 'lastName', label: 'Nume' },
                                    { name: 'cnp', label: 'CNP' },
                                    { name: 'phone', label: 'Telefon' },
                                    { name: 'email', label: 'Email', type: 'email' },
                                    { name: 'username', label: 'Username' },
                                    { name: 'password', label: 'Parolă', type: 'password' },
                                ].map((field) => (
                                    <div key={field.name} style={styles.inputGroup}>
                                        <label style={styles.label}>{field.label}</label>
                                        <input
                                            style={styles.input}
                                            type={field.type || 'text'}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                style={loading ? styles.btnDisabled : styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? 'Se adaugă...' : 'Adaugă Medic'}
                            </button>
                        </form>
                    </div>
                )}

                {editMedic && (
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>✏️ Editează Medic — Dr. {editMedic.firstName} {editMedic.lastName}</h3>
                        <form onSubmit={handleUpdateMedic}>
                            <div style={styles.formGrid}>
                                {[
                                    { name: 'firstName', label: 'Prenume' },
                                    { name: 'lastName', label: 'Nume' },
                                    { name: 'specialization', label: 'Specializare' },
                                    { name: 'phone', label: 'Telefon' },
                                    { name: 'stamp', label: 'Cod medic' },
                                ].map((field) => (
                                    <div key={field.name} style={styles.inputGroup}>
                                        <label style={styles.label}>{field.label}</label>
                                        <input
                                            style={styles.input}
                                            type="text"
                                            value={editForm[field.name]}
                                            onChange={(e) => setEditForm({ ...editForm, [field.name]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="submit" style={styles.submitBtn}>
                                    Salvează modificările
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditMedic(null)}
                                    style={styles.cancelBtn}
                                >
                                    Anulează
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={styles.tabs}>
                    {['utilizatori', 'medici', 'statistici'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                ...styles.tab,
                                backgroundColor: activeTab === tab ? '#2c5282' : 'white',
                                color: activeTab === tab ? 'white' : '#4a5568',
                            }}
                        >
                            {tab === 'utilizatori' ? '👥 Utilizatori' :
                             tab === 'medici' ? '👨‍⚕️ Medici' : '📊 Statistici'}
                        </button>
                    ))}
                </div>

                <div style={styles.card}>
                    {activeTab === 'utilizatori' && (
                        <>
                            <h3 style={styles.cardTitle}>👥 Toți Utilizatorii ({utilizatori.length})</h3>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeader}>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Username</th>
                                        <th style={styles.th}>Email</th>
                                        <th style={styles.th}>Rol</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {utilizatori.map((u) => (
                                        <tr key={u.id} style={styles.tableRow}>
                                            <td style={styles.td}>{u.id}</td>
                                            <td style={styles.td}><strong>{u.username}</strong></td>
                                            <td style={styles.td}>{u.email}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.rolBadge,
                                                    backgroundColor: getRolColor(u.role),
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: u.active ? '#f0fff4' : '#fff5f5',
                                                    color: u.active ? '#276749' : '#c53030',
                                                    border: `1px solid ${u.active ? '#9ae6b4' : '#fc8181'}`,
                                                }}>
                                                    {u.active ? '✓ Activ' : '✗ Inactiv'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {u.role !== 'admin' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleToggleUser(u.id)}
                                                                style={{
                                                                    ...styles.toggleBtn,
                                                                    backgroundColor: u.active ? '#fff5f5' : '#f0fff4',
                                                                    color: u.active ? '#c53030' : '#276749',
                                                                    border: `1px solid ${u.active ? '#fc8181' : '#9ae6b4'}`,
                                                                }}
                                                            >
                                                                {u.active ? 'Dezactivează' : 'Activează'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id, u.username)}
                                                                style={styles.deleteBtn}
                                                            >
                                                                🗑️ Șterge
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'medici' && (
                        <>
                            <h3 style={styles.cardTitle}>👨‍⚕️ Medici ({medici.length})</h3>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeader}>
                                        <th style={styles.th}>Nume</th>
                                        <th style={styles.th}>Specializare</th>
                                        <th style={styles.th}>Telefon</th>
                                        <th style={styles.th}>Cod medic</th>
                                        <th style={styles.th}>Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medici.map((m) => (
                                        <tr key={m.id} style={styles.tableRow}>
                                            <td style={styles.td}>
                                                <strong>Dr. {m.firstName} {m.lastName}</strong>
                                            </td>
                                            <td style={styles.td}>{m.specialization || '-'}</td>
                                            <td style={styles.td}>{m.phone || '-'}</td>
                                            <td style={styles.td}>{m.stamp || '-'}</td>
                                            <td style={styles.td}>
                                                <button
                                                    onClick={() => handleEditMedic(m)}
                                                    style={styles.editBtn}
                                                >
                                                    ✏️ Editează
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'statistici' && statistici && (
                        <>
                            <h3 style={styles.cardTitle}>📊 Statistici Cabinet</h3>

                            <div style={styles.statsRow}>
                                {[
                                    { label: '👥 Total Pacienți', value: statistici.totalPacienti, color: '#2c5282' },
                                    { label: '👨‍⚕️ Total Medici', value: statistici.totalMedici, color: '#276749' },
                                    { label: '📅 Total Programări', value: statistici.totalProgramari, color: '#744210' },
                                    { label: '🩺 Total Consultații', value: statistici.totalConsultatii, color: '#6b21a8' },
                                ].map((s, i) => (
                                    <div key={i} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
                                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#2d3748' }}>{s.value}</div>
                                        <div style={{ fontSize: '14px', color: '#718096', marginTop: '4px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.chartsRow}>
                                <div style={styles.chartCard}>
                                    <h4 style={styles.chartTitle}>Totaluri cabinet</h4>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="valoare" radius={[6, 6, 0, 0]}>
                                                {barData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={styles.chartCard}>
                                    <h4 style={styles.chartTitle}>Programări pe status</h4>
                                    {pieData.length === 0 ? (
                                        <p style={styles.empty}>Nu există programări.</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={90}
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name}: ${value}`}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            <div style={{ ...styles.chartsRow }}>
                                <div style={{ ...styles.chartCard, gridColumn: '1 / -1' }}>
                                    <h4 style={styles.chartTitle}>Programări pe lună</h4>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={lunaData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="luna" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="programari"
                                                stroke="#2c5282"
                                                strokeWidth={3}
                                                dot={{ fill: '#2c5282', r: 5 }}
                                                name="Programări"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ ...styles.chartsRow }}>
                                <div style={{ ...styles.chartCard, gridColumn: '1 / -1' }}>
                                    <h4 style={styles.chartTitle}>Top medici după consultații</h4>
                                    {topMediciData.length === 0 ? (
                                        <p style={styles.empty}>Nu există consultații.</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={topMediciData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis type="category" dataKey="name" width={150} />
                                                <Tooltip />
                                                <Bar dataKey="consultatii" fill="#276749" radius={[0, 6, 6, 0]} name="Consultații" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            <div style={styles.chartCard}>
                                <h4 style={styles.chartTitle}>📅 Programări într-o zi</h4>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                    <input
                                        type="date"
                                        style={{ ...styles.input, width: 'auto' }}
                                        value={dataSelectata}
                                        onChange={(e) => setDataSelectata(e.target.value)}
                                    />
                                    <button onClick={handleCautaZi} style={styles.submitBtn}>
                                        🔍 Caută
                                    </button>
                                </div>

                                {programariZi && (
                                    <>
                                        <div style={{
                                            backgroundColor: '#eff6ff',
                                            border: '1px solid #93c5fd',
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            marginBottom: '16px',
                                            color: '#1e40af',
                                            fontWeight: '600',
                                        }}>
                                            📅 {dataSelectata} — Total programări: {programariZi.total}
                                        </div>

                                        {programariZi.total === 0 ? (
                                            <p style={styles.empty}>Nu există programări în această zi.</p>
                                        ) : (
                                            <table style={styles.table}>
                                                <thead>
                                                    <tr style={styles.tableHeader}>
                                                        <th style={styles.th}>Pacient</th>
                                                        <th style={styles.th}>Medic</th>
                                                        <th style={styles.th}>Motiv</th>
                                                        <th style={styles.th}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {programariZi.programari.map((p, i) => {
                                                        const sc = getStatusColor(p.status);
                                                        return (
                                                            <tr key={i} style={styles.tableRow}>
                                                                <td style={styles.td}><strong>{p.pacient}</strong></td>
                                                                <td style={styles.td}>{p.medic}</td>
                                                                <td style={styles.td}>{p.motiv || '-'}</td>
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
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: {
        backgroundColor: '#2c5282',
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
        color: '#2c5282',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    content: { padding: '32px' },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    pageTitle: { margin: 0, color: '#2d3748' },
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
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    formTitle: { margin: '0 0 16px', color: '#2d3748' },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
    },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '6px', color: '#4a5568', fontWeight: '500', fontSize: '14px' },
    input: {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
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
    cancelBtn: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        border: '1px solid #fc8181',
        padding: '10px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    btnDisabled: {
        backgroundColor: '#a0aec0',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '8px',
        cursor: 'not-allowed',
    },
    tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
    tab: {
        padding: '10px 20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    cardTitle: { margin: '0 0 16px', color: '#2d3748' },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
    },
    statCard: {
        backgroundColor: '#f7fafc',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
    },
    chartsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '24px',
    },
    chartCard: {
        backgroundColor: '#f7fafc',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
    },
    chartTitle: {
        margin: '0 0 16px',
        color: '#2d3748',
        fontSize: '16px',
        fontWeight: '600',
    },
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
    rolBadge: {
        color: 'white',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
    },
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
    },
    toggleBtn: {
        padding: '4px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
    },
    editBtn: {
        backgroundColor: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #93c5fd',
        padding: '4px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
    },
    deleteBtn: {
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
};

export default AdminDashboard;