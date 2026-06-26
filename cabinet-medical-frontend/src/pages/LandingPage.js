import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [medici, setMedici] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/public/medici')
            .then(res => res.json())
            .then(data => setMedici(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={styles.logo}>🏥</span>
                    <span style={styles.logoText}>Cabinet Medical</span>
                </div>
                <div style={styles.headerRight}>
                    <button onClick={() => navigate('/login')} style={styles.loginBtn}>
                        Autentificare
                    </button>
                    <button onClick={() => navigate('/register')} style={styles.registerBtn}>
                        Înregistrare
                    </button>
                </div>
            </div>

            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>Sănătatea ta, prioritatea noastră</h1>
                <p style={styles.heroSubtitle}>
                    Cabinet de medicină de familie modern, cu medici specializați și programări online rapide.
                </p>
                <div style={styles.heroButtons}>
                    <button onClick={() => navigate('/register')} style={styles.heroBtnPrimary}>
                        Fă-ți cont acum
                    </button>
                    <button
                        onClick={() => document.getElementById('medici').scrollIntoView({ behavior: 'smooth' })}
                        style={styles.heroBtnSecondary}
                    >
                        Vezi medicii noștri
                    </button>
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>De ce să alegi cabinetul nostru?</h2>
                <div style={styles.featuresGrid}>
                    {[
                        { icon: '📅', title: 'Programări Online', desc: 'Programează-te rapid și ușor direct din aplicație, oricând.' },
                        { icon: '👨‍⚕️', title: 'Medici Specializați', desc: 'Echipa noastră de medici cu experiență în medicina de familie.' },
                        { icon: '💊', title: 'Rețete Digitale', desc: 'Acces rapid la rețetele tale direct din contul personal.' },
                        { icon: '🔬', title: 'Analize și Consultații', desc: 'Urmărește rezultatele analizelor și istoricul consultațiilor.' },
                    ].map((f, i) => (
                        <div key={i} style={styles.featureCard}>
                            <div style={styles.featureIcon}>{f.icon}</div>
                            <h3 style={styles.featureTitle}>{f.title}</h3>
                            <p style={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ ...styles.section, backgroundColor: '#f7fafc' }}>
                <h2 style={styles.sectionTitle}>Cum funcționează?</h2>
                <div style={styles.stepsGrid}>
                    {[
                        { step: '1', title: 'Creează cont', desc: 'Înregistrează-te rapid cu datele tale personale.' },
                        { step: '2', title: 'Alege medicul', desc: 'Selectează medicul dorit din lista noastră.' },
                        { step: '3', title: 'Fă programarea', desc: 'Alege data și ora convenabilă pentru tine.' },
                        { step: '4', title: 'Vino la consultație', desc: 'Prezintă-te la cabinet la ora programată.' },
                    ].map((s, i) => (
                        <div key={i} style={styles.stepCard}>
                            <div style={styles.stepNumber}>{s.step}</div>
                            <h3 style={styles.stepTitle}>{s.title}</h3>
                            <p style={styles.stepDesc}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div id="medici" style={styles.section}>
                <h2 style={styles.sectionTitle}>Medicii noștri</h2>
                <div style={styles.mediciGrid}>
                    {medici.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#718096' }}>Se încarcă...</p>
                    ) : (
                        medici.map(m => (
                            <div key={m.id} style={styles.medicCard}>
                                <div style={styles.medicAvatar}>👨‍⚕️</div>
                                <h3 style={styles.medicName}>Dr. {m.firstName} {m.lastName}</h3>
                                <p style={styles.medicSpec}>{m.specialization || 'Medicină de familie'}</p>
                                <button
                                    onClick={() => navigate('/register')}
                                    style={styles.programeazaBtn}
                                >
                                    Programează-te
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{ ...styles.section, backgroundColor: '#2c5282', color: 'white' }}>
                <h2 style={{ ...styles.sectionTitle, color: 'white' }}>Contact</h2>
                <div style={styles.contactGrid}>
                    {[
                        { icon: '📍', label: 'Adresă', value: 'Str. Sănătății nr. 1, București' },
                        { icon: '📞', label: 'Telefon', value: '0721 234 567' },
                        { icon: '🕐', label: 'Program', value: 'Luni - Duminică: 08:00 - 16:00' },
                    ].map((c, i) => (
                        <div key={i} style={styles.contactItem}>
                            <div style={styles.contactIcon}>{c.icon}</div>
                            <div>
                                <h4 style={styles.contactLabel}>{c.label}</h4>
                                <p style={styles.contactValue}>{c.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.footer}>
                <p>© 2026 Cabinet Medical. Toate drepturile rezervate.</p>
            </div>
        </div>
    );
};

const styles = {
    container: { fontFamily: '"Segoe UI", sans-serif', color: '#2d3748' },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 48px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    logo: { fontSize: '28px' },
    logoText: { fontSize: '20px', fontWeight: '700', color: '#2c5282' },
    headerRight: { display: 'flex', gap: '12px' },
    loginBtn: {
        padding: '8px 20px',
        border: '2px solid #2c5282',
        borderRadius: '8px',
        backgroundColor: 'white',
        color: '#2c5282',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
    registerBtn: {
        padding: '8px 20px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#2c5282',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
    hero: {
        background: 'linear-gradient(135deg, #2c5282 0%, #276749 100%)',
        color: 'white',
        padding: '100px 48px',
        textAlign: 'center',
    },
    heroTitle: {
        fontSize: '48px',
        fontWeight: '800',
        margin: '0 0 20px 0',
    },
    heroSubtitle: {
        fontSize: '20px',
        opacity: 0.9,
        maxWidth: '600px',
        margin: '0 auto 40px',
    },
    heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center' },
    heroBtnPrimary: {
        padding: '14px 32px',
        backgroundColor: 'white',
        color: '#2c5282',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    heroBtnSecondary: {
        padding: '14px 32px',
        backgroundColor: 'transparent',
        color: 'white',
        border: '2px solid white',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    section: {
        padding: '80px 48px',
        backgroundColor: 'white',
    },
    sectionTitle: {
        textAlign: 'center',
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '48px',
        color: '#2d3748',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    featureCard: {
        textAlign: 'center',
        padding: '32px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    featureIcon: { fontSize: '48px', marginBottom: '16px' },
    featureTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#2d3748' },
    featureDesc: { fontSize: '14px', color: '#718096', lineHeight: '1.6' },
    stepsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    stepCard: { textAlign: 'center', padding: '24px' },
    stepNumber: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#2c5282',
        color: 'white',
        fontSize: '24px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
    },
    stepTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#2d3748' },
    stepDesc: { fontSize: '14px', color: '#718096', lineHeight: '1.6' },
    mediciGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        maxWidth: '900px',
        margin: '0 auto',
    },
    medicCard: {
        textAlign: 'center',
        padding: '32px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    medicAvatar: { fontSize: '64px', marginBottom: '16px' },
    medicName: { fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#2d3748' },
    medicSpec: { fontSize: '14px', color: '#276749', fontWeight: '600', marginBottom: '20px' },
    programeazaBtn: {
        padding: '10px 24px',
        backgroundColor: '#2c5282',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        width: '100%',
    },
    contactGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        maxWidth: '900px',
        margin: '0 auto',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
    },
    contactIcon: { fontSize: '32px' },
    contactLabel: { fontSize: '14px', opacity: 0.8, margin: '0 0 4px', fontWeight: '600' },
    contactValue: { fontSize: '16px', margin: 0 },
    footer: {
        backgroundColor: '#1a202c',
        color: '#a0aec0',
        textAlign: 'center',
        padding: '24px',
        fontSize: '14px',
    },
};

export default LandingPage;