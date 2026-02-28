import { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';

const PaymentStats = () => {
    const [stats, setStats] = useState(null);
    const [allTx, setAllTx] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/api/transactions/stats'),
            api.get('/api/transactions'),
        ]).then(([statsRes, txRes]) => {
            setStats(statsRes.data);
            setAllTx(txRes.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    // Monthly breakdown from all transactions
    const monthlyData = (() => {
        const map = {};
        allTx.forEach(t => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            map[key] = (map[key] || 0) + Number(t.amount_paid);
        });
        return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    })();

    const maxMonthly = Math.max(...monthlyData.map(([, v]) => v), 1);

    // Village-wise paid customers
    const villageData = (() => {
        const map = {};
        allTx.forEach(t => {
            const v = t.customers?.village || 'Unknown';
            map[v] = (map[v] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
    })();

    const maxVillage = Math.max(...villageData.map(([, v]) => v), 1);

    const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                <div className="page-header">
                    <h2>📈 Payment Statistics</h2>
                    <p>Detailed breakdown of all payment activity.</p>
                </div>

                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
                ) : (
                    <>
                        {/* Top stat cards */}
                        <div className="row g-3 mb-4">
                            {[
                                { icon: '👤', label: 'Unique Paying Customers', value: stats?.uniquePayingCustomers || 0, color: 'blue', sub: 'paid via website' },
                                { icon: '💰', label: 'All-Time Collection', value: fmt(stats?.totalAmount), color: 'green', sub: 'total amount' },
                                { icon: '📅', label: 'This Month Collection', value: fmt(stats?.thisMonthAmount), color: 'yellow', sub: 'current month' },
                                { icon: '🧾', label: 'Total Transactions', value: stats?.totalTransactions || 0, color: 'red', sub: 'successful payments' },
                            ].map(({ icon, label, value, color, sub }) => (
                                <div className="col-6 col-md-3" key={label}>
                                    <div className={`stat-card ${color}`}>
                                        <div style={{ fontSize: 28 }}>{icon}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
                                        <div style={{ color: '#8890a6', fontSize: '0.78rem', marginTop: 4 }}>{sub}</div>
                                        <div style={{ color: '#8890a6', fontSize: '0.82rem', fontWeight: 500, marginTop: 6 }}>{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="row g-4 mb-4">
                            {/* Monthly Collection Chart */}
                            <div className="col-md-7">
                                <div className="glass-card p-4 h-100">
                                    <h6 style={{ color: '#8890a6', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Monthly Collection (Last 6 Months)</h6>
                                    {monthlyData.length === 0 ? (
                                        <div className="text-center py-4" style={{ color: '#8890a6' }}>No data available.</div>
                                    ) : (
                                        <div className="d-flex align-items-end gap-3" style={{ height: 180 }}>
                                            {monthlyData.map(([month, amount]) => {
                                                const pct = (amount / maxMonthly) * 100;
                                                const [year, m] = month.split('-');
                                                const label = new Date(year, m - 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
                                                return (
                                                    <div key={month} className="d-flex flex-column align-items-center flex-fill gap-1">
                                                        <div style={{ fontSize: '0.7rem', color: '#8890a6', fontWeight: 600 }}>₹{Math.round(amount / 1000)}k</div>
                                                        <div style={{ width: '100%', maxWidth: 50, background: 'linear-gradient(to top, #e94560, #f5a623)', borderRadius: '6px 6px 0 0', height: `${pct}%`, minHeight: 4, transition: 'height 0.5s', position: 'relative' }} title={`₹${amount.toLocaleString('en-IN')}`} />
                                                        <div style={{ fontSize: '0.72rem', color: '#8890a6' }}>{label}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subscription Breakdown */}
                            <div className="col-md-5">
                                <div className="glass-card p-4 h-100">
                                    <h6 style={{ color: '#8890a6', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Subscription Plans</h6>
                                    {[
                                        { label: '1 Month', key: 'oneMonth', color: '#4facfe', icon: '📅' },
                                        { label: '6 Months', key: 'sixMonth', color: '#f5a623', icon: '📆' },
                                        { label: '1 Year', key: 'oneYear', color: '#28e07e', icon: '🗓️' },
                                    ].map(({ label, key, color, icon }) => {
                                        const count = stats?.subscriptionBreakdown?.[key] || 0;
                                        const total = stats?.totalTransactions || 1;
                                        const pct = Math.round((count / total) * 100);
                                        return (
                                            <div key={key} className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span style={{ fontSize: '0.88rem' }}>{icon} {label}</span>
                                                    <span style={{ fontWeight: 700, color }}>{count} <span style={{ color: '#8890a6', fontSize: '0.78rem' }}>({pct}%)</span></span>
                                                </div>
                                                <div style={{ background: 'rgba(30,45,80,0.5)', borderRadius: 10, height: 10 }}>
                                                    <div style={{ width: `${pct}%`, background: color, borderRadius: 10, height: 10, transition: 'width 0.5s' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Village-wise payments */}
                        <div className="glass-card p-4">
                            <h6 style={{ color: '#8890a6', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Village-wise Payment Count</h6>
                            {villageData.length === 0 ? (
                                <div className="text-center py-3" style={{ color: '#8890a6' }}>No data available.</div>
                            ) : (
                                <div className="row g-3">
                                    {villageData.map(([village, count]) => {
                                        const pct = Math.round((count / maxVillage) * 100);
                                        return (
                                            <div className="col-md-6" key={village}>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span style={{ fontSize: '0.88rem' }}>📍 {village}</span>
                                                    <span style={{ fontWeight: 700, color: '#4facfe', fontSize: '0.88rem' }}>{count} payments</span>
                                                </div>
                                                <div style={{ background: 'rgba(30,45,80,0.5)', borderRadius: 10, height: 8 }}>
                                                    <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #4facfe, #00f2fe)', borderRadius: 10, height: 8, transition: 'width 0.5s' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentStats;
