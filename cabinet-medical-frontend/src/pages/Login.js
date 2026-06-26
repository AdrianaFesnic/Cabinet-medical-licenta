import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(username, password);
            loginUser(data);
            if (data.role === 'admin') navigate('/admin');
            else if (data.role === 'medic') navigate('/medic');
            else navigate('/pacient');
        } catch (err) {
            setError('Username sau parolă incorectă!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <button onClick={() => navigate('/')} style={styles.backBtn}>
                    ← Înapoi
                </button>
                <h2 style={styles.title}>🏥 Cabinet Medical</h2>
                <h3 style={styles.subtitle}>Autentificare</h3>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            style={styles.input}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Introduceți username"
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Parolă</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduceți parola"
                            required
                        />
                    </div>
                    <button
                        style={loading ? styles.buttonDisabled : styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Se autentifică...' : 'Autentificare'}
                    </button>
                </form>
                <p style={styles.registerText}>
                    Nu ai cont?{' '}
                    <Link to="/register" style={styles.link}>
                        Înregistrează-te
                    </Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    backBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#2c5282',
        cursor: 'pointer',
        fontSize: '14px',
        marginBottom: '16px',
        padding: 0,
        display: 'block',
    },
    title: {
        textAlign: 'center',
        color: '#2c5282',
        marginBottom: '8px',
        fontSize: '24px',
    },
    subtitle: {
        textAlign: 'center',
        color: '#4a5568',
        marginBottom: '24px',
        fontWeight: 'normal',
        fontSize: '18px',
    },
    error: {
        backgroundColor: '#fff5f5',
        color: '#c53030',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        textAlign: 'center',
        border: '1px solid #fc8181',
    },
    inputGroup: { marginBottom: '16px' },
    label: {
        display: 'block',
        marginBottom: '6px',
        color: '#4a5568',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '16px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#2c5282',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '8px',
    },
    buttonDisabled: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#a0aec0',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'not-allowed',
        marginTop: '8px',
    },
    registerText: {
        textAlign: 'center',
        marginTop: '16px',
        color: '#4a5568',
    },
    link: {
        color: '#2c5282',
        textDecoration: 'none',
        fontWeight: '500',
    },
};

export default Login;