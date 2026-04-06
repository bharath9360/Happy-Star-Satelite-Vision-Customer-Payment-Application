import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';

/**
 * PrivateRoute — verifies the JWT against the server on every mount.
 *
 * States:
 *  - "checking" → show spinner (token exists but not yet validated)
 *  - "valid"    → render protected children
 *  - "invalid"  → redirect to /login
 */
const PrivateRoute = ({ children }) => {
    const [status, setStatus] = useState('checking'); // 'checking' | 'valid' | 'invalid'

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setStatus('invalid');
            return;
        }

        // Ping the server to confirm the token hasn't expired
        api.get('/api/auth/me')
            .then(() => setStatus('valid'))
            .catch(() => {
                localStorage.removeItem('adminToken');
                setStatus('invalid');
            });
    }, []);

    if (status === 'checking') {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0f0f1a',
            }}>
                <div style={{ textAlign: 'center', color: '#8890a6' }}>
                    <div className="spinner-border text-warning mb-3" role="status" />
                    <div style={{ fontSize: '0.85rem' }}>Verifying session…</div>
                </div>
            </div>
        );
    }

    return status === 'valid' ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
