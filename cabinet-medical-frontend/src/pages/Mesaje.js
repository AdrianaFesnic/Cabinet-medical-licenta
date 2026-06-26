import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Mesaje = ({ currentUserId }) => {
    const [conversatii, setConversatii] = useState([]);
    const [conversatieActiva, setConversatieActiva] = useState(null);
    const [mesaje, setMesaje] = useState([]);
    const [mesajNou, setMesajNou] = useState('');
    const [necitite, setNecitite] = useState(0);
    const [showMesajNou, setShowMesajNou] = useState(false);
    const [utilizatori, setUtilizatori] = useState([]);

    useEffect(() => {
        fetchInbox();
        fetchNecitite();
        fetchUtilizatori();
    }, []);

    const fetchInbox = async () => {
        try {
            const response = await api.get('/mesaje/inbox');
            const msgs = response.data;
            const usersMap = {};
            msgs.forEach(m => {
                const other = m.expeditor.id === currentUserId ? m.destinatar : m.expeditor;
                if (!usersMap[other.id]) {
                    usersMap[other.id] = { user: other, ultimulMesaj: m };
                }
            });
            setConversatii(Object.values(usersMap));
        } catch (err) {
            console.error('Eroare la încărcarea inbox-ului');
        }
    };

    const fetchNecitite = async () => {
        try {
            const response = await api.get('/mesaje/necitite');
            setNecitite(response.data.count);
        } catch (err) {
            console.error('Eroare la necitite');
        }
    };

    const fetchUtilizatori = async () => {
        try {
            const response = await api.get('/mesaje/utilizatori');
            setUtilizatori(response.data);
        } catch (err) {
            console.error('Eroare la utilizatori');
        }
    };

    const fetchConversatie = async (userId) => {
        try {
            const response = await api.get(`/mesaje/conversatie/${userId}`);
            setMesaje(response.data);
            setConversatieActiva(userId);
            setShowMesajNou(false);
            fetchNecitite();
        } catch (err) {
            console.error('Eroare la încărcarea conversației');
        }
    };

    const handleTrimite = async () => {
        if (!mesajNou.trim() || !conversatieActiva) return;
        try {
            await api.post('/mesaje/trimite', {
                destinatarId: conversatieActiva,
                continut: mesajNou,
            });
            setMesajNou('');
            fetchConversatie(conversatieActiva);
            fetchInbox();
        } catch (err) {
            console.error('Eroare la trimiterea mesajului');
        }
    };

    const handleIncepeConversatie = (userId) => {
        setConversatieActiva(userId);
        setShowMesajNou(false);
        fetchConversatie(userId);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('ro-RO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const conversatieUser = conversatii.find(c => c.user.id === conversatieActiva)?.user
        || utilizatori.find(u => u.id === conversatieActiva);

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <span>📬 Mesaje {necitite > 0 && (
                        <span style={styles.badge}>{necitite}</span>
                    )}</span>
                    <button
                        onClick={() => setShowMesajNou(!showMesajNou)}
                        style={styles.newBtn}
                        title="Mesaj nou"
                    >
                        ✏️
                    </button>
                </div>

                {showMesajNou && (
                    <div style={styles.newMesajPanel}>
                        <div style={styles.newMesajTitle}>Alege destinatarul:</div>
                        {utilizatori.length === 0 ? (
                            <p style={styles.empty}>Nu există utilizatori.</p>
                        ) : (
                            utilizatori.map(u => (
                                <div
                                    key={u.id}
                                    onClick={() => handleIncepeConversatie(u.id)}
                                    style={styles.userItem}
                                >
                                    <div style={styles.convAvatar}>
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={styles.convName}>{u.username}</div>
                                        <div style={{ fontSize: '11px', color: '#718096' }}>{u.role}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {conversatii.length === 0 && !showMesajNou ? (
                    <p style={styles.empty}>Nu ai conversații.<br />Apasă ✏️ pentru a iniția una.</p>
                ) : (
                    conversatii.map(conv => (
                        <div
                            key={conv.user.id}
                            onClick={() => fetchConversatie(conv.user.id)}
                            style={{
                                ...styles.convItem,
                                backgroundColor: conversatieActiva === conv.user.id ? '#eff6ff' : 'white',
                                borderLeft: conversatieActiva === conv.user.id ? '3px solid #2c5282' : '3px solid transparent',
                            }}
                        >
                            <div style={styles.convAvatar}>
                                {conv.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div style={styles.convInfo}>
                                <div style={styles.convName}>{conv.user.username}</div>
                                <div style={styles.convPreview}>
                                    {conv.ultimulMesaj.continut.substring(0, 40)}
                                    {conv.ultimulMesaj.continut.length > 40 ? '...' : ''}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* CHAT ZONE */}
            <div style={styles.chatZone}>
                {!conversatieActiva ? (
                    <div style={styles.noConv}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                        <p style={{ color: '#718096' }}>Selectează o conversație sau apasă ✏️ pentru a trimite un mesaj nou.</p>
                    </div>
                ) : (
                    <>
                        <div style={styles.chatHeader}>
                            💬 Conversație cu <strong style={{ marginLeft: '6px' }}>{conversatieUser?.username}</strong>
                        </div>

                        <div style={styles.mesajeList}>
                            {mesaje.length === 0 && (
                                <p style={{ color: '#a0aec0', textAlign: 'center', marginTop: '24px' }}>
                                    Niciun mesaj încă. Fii primul care scrie!
                                </p>
                            )}
                            {mesaje.map(m => {
                                const esteAlMeu = m.expeditor.id === currentUserId;
                                return (
                                    <div
                                        key={m.id}
                                        style={{
                                            ...styles.mesajRow,
                                            justifyContent: esteAlMeu ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <div style={{
                                            ...styles.mesajBubble,
                                            backgroundColor: esteAlMeu ? '#2c5282' : '#f0f4f8',
                                            color: esteAlMeu ? 'white' : '#2d3748',
                                            borderRadius: esteAlMeu ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        }}>
                                            <div style={styles.mesajText}>{m.continut}</div>
                                            <div style={{
                                                ...styles.mesajTime,
                                                color: esteAlMeu ? 'rgba(255,255,255,0.7)' : '#a0aec0',
                                            }}>
                                                {formatDate(m.dataTrimitere)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={styles.inputZone}>
                            <input
                                style={styles.input}
                                type="text"
                                placeholder="Scrie un mesaj..."
                                value={mesajNou}
                                onChange={(e) => setMesajNou(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTrimite()}
                            />
                            <button onClick={handleTrimite} style={styles.sendBtn}>
                                Trimite ➤
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        height: '600px',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    sidebar: {
        width: '260px',
        borderRight: '1px solid #e2e8f0',
        overflowY: 'auto',
        flexShrink: 0,
    },
    sidebarHeader: {
        padding: '16px',
        fontWeight: '700',
        fontSize: '16px',
        color: '#2d3748',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        backgroundColor: '#c53030',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: '700',
        marginLeft: '6px',
    },
    newBtn: {
        backgroundColor: '#eff6ff',
        border: '1px solid #93c5fd',
        borderRadius: '6px',
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    newMesajPanel: {
        backgroundColor: '#f7fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px',
    },
    newMesajTitle: {
        fontSize: '12px',
        color: '#718096',
        fontWeight: '600',
        marginBottom: '8px',
        textTransform: 'uppercase',
    },
    userItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '4px',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
    },
    empty: {
        padding: '16px',
        color: '#718096',
        fontSize: '14px',
        textAlign: 'center',
    },
    convItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f4f8',
    },
    convAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#2c5282',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '16px',
        flexShrink: 0,
    },
    convInfo: { flex: 1, minWidth: 0 },
    convName: { fontWeight: '600', color: '#2d3748', fontSize: '14px' },
    convPreview: {
        color: '#718096',
        fontSize: '12px',
        marginTop: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    chatZone: { flex: 1, display: 'flex', flexDirection: 'column' },
    noConv: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
    },
    chatHeader: {
        padding: '16px',
        borderBottom: '1px solid #e2e8f0',
        fontWeight: '500',
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center',
    },
    mesajeList: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    mesajRow: { display: 'flex' },
    mesajBubble: {
        maxWidth: '70%',
        padding: '10px 14px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    mesajText: { fontSize: '14px', lineHeight: '1.5' },
    mesajTime: { fontSize: '11px', marginTop: '4px', textAlign: 'right' },
    inputZone: {
        padding: '16px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '8px',
    },
    input: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
    },
    sendBtn: {
        backgroundColor: '#2c5282',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
};

export default Mesaje;