import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.code}>404</div>
                <div style={styles.icon}>🏥</div>
                <h1 style={styles.title}>Pagina nu a fost găsită</h1>
                <p style={styles.subtitle}>
                    Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.
                </p>
                <div style={styles.buttons}>
                    <button onClick={() => navigate('/')} style={styles.homeBtn}>
                        🏠 Pagina principală
                    </button>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>
                        ← Înapoi
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f0f4f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '480px',
        width: '100%',
    },
    code: {
        fontSize: '96px',
        fontWeight: '800',
        color: '#e2e8f0',
        lineHeight: 1,
        marginBottom: '8px',
    },
    icon: {
        fontSize: '64px',
        marginBottom: '16px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#2d3748',
        margin: '0 0 12px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#718096',
        margin: '0 0 32px',
        lineHeight: '1.6',
    },
    buttons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
    },
    homeBtn: {
        backgroundColor: '#2c5282',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
    backBtn: {
        backgroundColor: 'white',
        color: '#2c5282',
        border: '2px solid #2c5282',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
};

export default NotFound;