import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/login', form);
            localStorage.setItem('adminToken', data.token);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-page">
            <div style={{ width: '100%', maxWidth: 420 }} className="fade-in-up">
                <div className="text-center mb-4">
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.5rem', background: 'linear-gradient(135deg, #e94560, #f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Login
                    </h1>
                    <p style={{ color: '#8890a6', fontSize: '0.85rem' }}>Happy Star Satellite Vision</p>
                </div>

                <div className="glass-card p-4">
                    {error && (
                        <div className="alert mb-3 p-2 text-center fade-in-up" style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', color: '#e94560', borderRadius: 10, fontSize: '0.9rem' }}>
                            ⚠️ {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input className="form-control" name="username" value={form.username} onChange={handleChange} placeholder="admin" required autoComplete="username" />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required autoComplete="current-password" />
                        </div>
                        <button type="submit" className="btn-primary-custom w-100" disabled={loading}>
                            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : '🔓 Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-3" style={{ color: '#8890a6', fontSize: '0.75rem' }}>
                    <a href="/" style={{ color: '#f5a623', textDecoration: 'none' }}>← Back to Payment Page</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
