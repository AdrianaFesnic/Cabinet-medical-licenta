import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerPatient } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        cnp: '',
        phone: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const validators = {
        cnp: (value) => {
            if (!/^\d{13}$/.test(value)) {
                return 'CNP-ul trebuie să aibă exact 13 cifre';
            }
            return '';
        },
        phone: (value) => {
            if (!/^(07\d{8}|\+407\d{8})$/.test(value)) {
                return 'Telefon invalid (ex: 0721234567 sau +40721234567)';
            }
            return '';
        },
        email: (value) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Adresă de email invalidă';
            }
            return '';
        },
        username: (value) => {
            if (value.trim().length < 3) {
                return 'Username-ul trebuie să aibă minim 3 caractere';
            }
            return '';
        },
        password: (value) => {
            if (value.length < 6) {
                return 'Parola trebuie să aibă minim 6 caractere';
            }
            return '';
        },
        firstName: (value) => {
            if (value.trim().length < 2) {
                return 'Prenumele trebuie să aibă minim 2 caractere';
            }
            return '';
        },
        lastName: (value) => {
            if (value.trim().length < 2) {
                return 'Numele trebuie să aibă minim 2 caractere';
            }
            return '';
        },
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (validators[name]) {
            const errorMsg = validators[name](value);
            setFieldErrors({ ...fieldErrors, [name]: errorMsg });
        }
    };

    const validateAll = () => {
        const newErrors = {};
        Object.keys(validators).forEach((field) => {
            const errorMsg = validators[field](formData[field]);
            if (errorMsg) newErrors[field] = errorMsg;
        });
        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateAll()) {
            setError('Verificați câmpurile marcate cu eroare!');
            return;
        }

        setLoading(true);
        try {
            const data = await registerPatient(formData);
            loginUser(data);
            navigate('/pacient');
        } catch (err) {
            setError('Eroare la înregistrare. Verificați datele!');
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
                <h3 style={styles.subtitle}>Înregistrare Pacient 👤</h3>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    {[
                        { name: 'firstName', label: 'Prenume', type: 'text' },
                        { name: 'lastName', label: 'Nume', type: 'text' },
                        { name: 'cnp', label: 'CNP', type: 'text', maxLength: 13 },
                        { name: 'phone', label: 'Telefon', type: 'text' },
                        { name: 'email', label: 'Email', type: 'email' },
                        { name: 'username', label: 'Username', type: 'text' },
                        { name: 'password', label: 'Parolă', type: 'password' },
                    ].map((field) => (
                        <div key={field.name} style={styles.inputGroup}>
                            <label style={styles.label}>{field.label}</label>
                            <input
                                style={{
                                    ...styles.input,
                                    borderColor: fieldErrors[field.name] ? '#fc8181' : '#e2e8f0',
                                }}
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={`Introduceți ${field.label.toLowerCase()}`}
                                maxLength={field.maxLength}
                                required
                            />
                            {fieldErrors[field.name] && (
                                <span style={styles.fieldError}>{fieldErrors[field.name]}</span>
                            )}
                        </div>
                    ))}
                    <button
                        style={loading ? styles.buttonDisabled : styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Se înregistrează...' : 'Înregistrare'}
                    </button>
                </form>
                <p style={styles.registerText}>
                    Ai deja cont?{' '}
                    <Link to="/login" style={styles.link}>
                        Autentifică-te
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
    fieldError: {
        display: 'block',
        color: '#c53030',
        fontSize: '12px',
        marginTop: '4px',
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

export default Register;