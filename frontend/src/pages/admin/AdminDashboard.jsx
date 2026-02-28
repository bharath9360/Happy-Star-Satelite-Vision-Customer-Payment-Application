import { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, sub, color }) => (
    <div className={`stat-card ${color}`}>
        <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ fontSize: 32 }}>{icon}</span>
            <div className="text-end">
                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
                <div style={{ color: '#8890a6', fontSize: '0.78rem' }}>{sub}</div>
            </div>
        </div>
        <div style={{ color: '#8890a6', fontSize: '0.85rem', fontWeight: 500 }}>{label}</div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, todayRes] = await Promise.all([
                    api.get('/api/transactions/stats'),
                    api.get('/api/transactions/today'),
                ]);
                setStats(statsRes.data);
                setRecentPayments(todayRes.data.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                {/* Page Header */}
                <div className="page-header d-flex align-items-center justify-content-between">
                    <div>
                        <h2>📊 Dashboard</h2>
                        <p>Welcome back, Admin! Here's what's happening today.</p>
                    </div>
                    <div style={{ color: '#8890a6', fontSize: '0.85rem' }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="row g-3 mb-4">
                            <div className="col-6 col-md-3">
                                <StatCard icon="👥" label="Total Customers" value={stats?.totalCustomers || 0} sub="registered STBs" color="blue" />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="💰" label="Total Collected" value={fmt(stats?.totalAmount)} sub="all time" color="green" />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="📅" label="This Month" value={fmt(stats?.thisMonthAmount)} sub="current month" color="yellow" />
                            </div>
                            <div className="col-6 col-md-3">
                                <StatCard icon="🧾" label="Total Transactions" value={stats?.totalTransactions || 0} sub="payments" color="red" />
                            </div>
                        </div>

                        {/* Subscription Breakdown */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="glass-card p-4 h-100">
                                    <h6 style={{ color: '#8890a6', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em' }}>Subscription Breakdown</h6>
                                    {[
                                        { label: '1 Month Plans', key: 'oneMonth', color: '#4facfe' },
                                        { label: '6 Month Plans', key: 'sixMonth', color: '#f5a623' },
                                        { label: '1 Year Plans', key: 'oneYear', color: '#28e07e' },
                                    ].map(({ label, key, color }) => {
                                        const count = stats?.subscriptionBreakdown?.[key] || 0;
                                        const total = stats?.totalTransactions || 1;
                                        const pct = Math.round((count / total) * 100);
                                        return (
                                            <div key={key} className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span style={{ fontSize: '0.85rem' }}>{label}</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{count} <span style={{ color: '#8890a6' }}>({pct}%)</span></span>
                                                </div>
                                                <div style={{ background: 'rgba(30,45,80,0.5)', borderRadius: 10, height: 8 }}>
                                                    <div style={{ width: `${pct}%`, background: color, borderRadius: 10, height: 8, transition: 'width 0.5s' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="glass-card p-4 h-100">
                                    <h6 style={{ color: '#8890a6', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em' }}>Quick Actions</h6>
                                    <div className="d-flex flex-column gap-2">
                                        {[
                                            { to: '/admin/customers/new', icon: '➕', label: 'Insert New Box (Customer)', color: '#e94560' },
                                            { to: '/admin/customers/bulk', icon: '📦', label: 'Bulk Import (Excel/CSV)', color: '#f5a623' },
                                            { to: '/admin/payments', icon: '💳', label: 'View Payment History', color: '#28e07e' },
                                            { to: '/admin/stats', icon: '📈', label: 'Detailed Statistics', color: '#4facfe' },
                                            { to: '/admin/settings', icon: '⚙️', label: 'Settings & Form Configuration', color: '#a78bfa' },
                                        ].map(({ to, icon, label, color }) => (
                                            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                                                <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(15,15,26,0.5)', border: '1px solid rgba(30,45,80,0.5)', transition: 'all 0.2s', cursor: 'pointer' }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = color}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(30,45,80,0.5)'}
                                                >
                                                    <span style={{ fontSize: 20 }}>{icon}</span>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Today's Recent Payments */}
                        <div className="glass-card p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h6 style={{ color: '#8890a6', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em', margin: 0 }}>Today's Recent Payments</h6>
                                <Link to="/admin/payments" style={{ color: '#e94560', fontSize: '0.8rem', textDecoration: 'none' }}>View All →</Link>
                            </div>
                            {recentPayments.length === 0 ? (
                                <p style={{ color: '#8890a6', textAlign: 'center', padding: '2rem 0', margin: 0 }}>No payments today.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table-dark-custom" style={{ width: '100%' }}>
                                        <thead><tr>
                                            <th>STB #</th><th>Customer</th><th>Village</th><th>Amount</th><th>Months</th><th>Time</th>
                                        </tr></thead>
                                        <tbody>
                                            {recentPayments.map(t => (
                                                <tr key={t.id}>
                                                    <td><code style={{ color: '#f5a623', fontSize: '0.8rem' }}>{t.stb_number}</code></td>
                                                    <td>{t.customers?.name || '-'}</td>
                                                    <td>{t.customers?.village || '-'}</td>
                                                    <td style={{ fontWeight: 600, color: '#28e07e' }}>₹{t.amount_paid}</td>
                                                    <td><span className="badge-success">{t.months_recharged}m</span></td>
                                                    <td style={{ color: '#8890a6', fontSize: '0.8rem' }}>{new Date(t.date).toLocaleTimeString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
