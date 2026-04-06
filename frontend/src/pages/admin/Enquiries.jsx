import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEnquiries = async () => {
            try {
                const { data } = await api.get('/api/contact/enquiries');
                setEnquiries(data || []);
            } catch (err) {
                console.error('Failed to fetch enquiries:', err);
                setError('Failed to load enquiries. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchEnquiries();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
        try {
            await api.put(`/api/contact/enquiry/${id}`, { status: newStatus });
            setEnquiries(prev => prev.map(enq => 
                enq.id === id ? { ...enq, status: newStatus } : enq
            ));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update enquiry status.');
        }
    };

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content p-4">
                <div className="page-header mb-4">
                    <h2 style={{ 
                        fontWeight: 800, fontSize: '1.5rem', 
                        background: 'linear-gradient(135deg, #4facfe, #00f2fe)', 
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
                    }}>
                        📨 Customer Enquiries
                    </h2>
                    <p style={{ color: '#8890a6', margin: 0 }}>
                        View messages submitted through the public Contact Us form.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{ 
                        background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', 
                        color: '#e94560', borderRadius: 10 
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border" style={{ color: '#4facfe' }} />
                    </div>
                ) : enquiries.length === 0 ? (
                    <div className="glass-card p-5 text-center" style={{ borderRadius: 16 }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                        <h4 style={{ color: '#e8e8f0', fontWeight: 600 }}>No enquiries yet</h4>
                        <p style={{ color: '#8890a6' }}>When customers submit the contact form, their messages will appear here.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {enquiries.map(enq => (
                            <div className="col-12 col-xl-6" key={enq.id}>
                                <div className="glass-card p-4 fade-in-up" style={{ 
                                    borderRadius: 16, 
                                    border: enq.status === 'unread' ? '1px solid rgba(79,172,254,0.4)' : '1px solid rgba(30,45,80,0.6)',
                                    background: enq.status === 'unread' ? 'rgba(79,172,254,0.03)' : 'rgba(15,15,26,0.5)',
                                    height: '100%', display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <h5 style={{ color: '#e8e8f0', fontWeight: 700, margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {enq.name}
                                                {enq.status === 'unread' && (
                                                    <span style={{ 
                                                        background: 'rgba(79,172,254,0.15)', color: '#4facfe', 
                                                        fontSize: '0.65rem', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.05em', textTransform: 'uppercase' 
                                                    }}>New</span>
                                                )}
                                            </h5>
                                            <div style={{ color: '#8890a6', fontSize: '0.85rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span>📞 {enq.phone}</span>
                                                <span style={{ opacity: 0.3 }}>|</span>
                                                <span>🕒 {new Date(enq.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toggleStatus(enq.id, enq.status)}
                                            style={{ 
                                                background: enq.status === 'unread' ? 'transparent' : 'rgba(255,255,255,0.05)', 
                                                border: enq.status === 'unread' ? '1px solid rgba(79,172,254,0.5)' : '1px solid rgba(255,255,255,0.1)', 
                                                color: enq.status === 'unread' ? '#4facfe' : '#8890a6', 
                                                borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                                            }}>
                                            {enq.status === 'unread' ? '✓ Mark as Read' : 'Mark as Unread'}
                                        </button>
                                    </div>
                                    
                                    <div style={{ 
                                        background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 12, 
                                        color: '#d1d1e0', fontSize: '0.9rem', lineHeight: 1.6, flex: 1,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {enq.query}
                                    </div>
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Enquiries;
