import { useState, useEffect, useCallback } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';

const PaymentList = () => {
    const [activeTab, setActiveTab] = useState('today');
    const [todayData, setTodayData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Detail Modal
    const [detailModal, setDetailModal] = useState(false);
    const [detailTx, setDetailTx] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (fromDate) params.from_date = fromDate;
            if (toDate) params.to_date = toDate;
            const [todayRes, allRes] = await Promise.all([
                api.get('/api/transactions/today'),
                api.get('/api/transactions', { params }),
            ]);
            setTodayData(todayRes.data);
            setAllData(allRes.data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    }, [search, fromDate, toDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openDetail = async (tx) => {
        setDetailLoading(true); setDetailModal(true); setDetailTx(null);
        try {
            const { data } = await api.get(`/api/transactions/${tx.id}`);
            setDetailTx(data);
        } catch { setDetailTx(tx); }
        finally { setDetailLoading(false); }
    };

    const todayTotal = todayData.reduce((s, t) => s + Number(t.amount_paid), 0);
    const todayCount = todayData.length;

    const TransactionRow = ({ t, showDate = false }) => (
        <tr>
            <td><code style={{ color: '#f5a623', fontSize: '0.78rem' }}>{t.stb_number}</code></td>
            <td style={{ fontWeight: 500 }}>{t.customers?.name || '-'}</td>
            <td style={{ color: '#8890a6' }}>{t.customers?.village || '-'}</td>
            <td style={{ color: '#8890a6' }}>{t.customers?.mobile || '-'}</td>
            <td style={{ fontWeight: 700, color: '#28e07e' }}>₹{Number(t.amount_paid).toLocaleString('en-IN')}</td>
            <td><span className="badge-success">{t.months_recharged}m</span></td>
            <td><span className="badge-success">✅ {t.payment_status}</span></td>
            <td style={{ color: '#8890a6', fontSize: '0.78rem' }}>
                {showDate
                    ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                }
            </td>
            <td>
                <button onClick={() => openDetail(t)} className="btn btn-sm" style={{ background: 'rgba(79,172,254,0.15)', color: '#4facfe', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 8, fontSize: '0.78rem' }}>👁 Details</button>
            </td>
        </tr>
    );

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                <div className="page-header">
                    <h2>💳 Payment Records</h2>
                    <p>View all customer payments made through this website.</p>
                </div>

                {/* Tabs */}
                <div className="d-flex gap-2 mb-4">
                    {[
                        { key: 'today', label: `📅 Today's Payments (${todayData.length})` },
                        { key: 'all', label: `📋 All Payments (${allData.length})` },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className="btn"
                            style={{
                                background: activeTab === key ? 'rgba(233,69,96,0.2)' : 'rgba(30,45,80,0.4)',
                                color: activeTab === key ? '#e94560' : '#8890a6',
                                border: `1px solid ${activeTab === key ? 'rgba(233,69,96,0.5)' : 'rgba(30,45,80,0.8)'}`,
                                borderRadius: 10, fontWeight: 600,
                            }}
                        >{label}</button>
                    ))}
                </div>

                {/* ─── TODAY TAB ─────────────────────────────────── */}
                {activeTab === 'today' && (
                    <>
                        {/* Today summary cards */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="stat-card green">
                                    <div style={{ fontSize: 32 }}>💰</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹{todayTotal.toLocaleString('en-IN')}</div>
                                    <div style={{ color: '#8890a6', fontSize: '0.85rem' }}>Today's Total Collection</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="stat-card blue">
                                    <div style={{ fontSize: 32 }}>🧾</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{todayCount}</div>
                                    <div style={{ color: '#8890a6', fontSize: '0.85rem' }}>Transactions Today</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="stat-card yellow">
                                    <div style={{ fontSize: 32 }}>📊</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹{todayCount > 0 ? Math.round(todayTotal / todayCount).toLocaleString('en-IN') : 0}</div>
                                    <div style={{ color: '#8890a6', fontSize: '0.85rem' }}>Average per Transaction</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-0" style={{ overflow: 'hidden' }}>
                            {loading ? <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div> :
                                todayData.length === 0 ? <div className="text-center py-5" style={{ color: '#8890a6' }}>No payments received today.</div> :
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table-dark-custom">
                                            <thead><tr><th>STB #</th><th>Customer</th><th>Village</th><th>Mobile</th><th>Amount</th><th>Plan</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
                                            <tbody>{todayData.map(t => <TransactionRow key={t.id} t={t} />)}</tbody>
                                        </table>
                                    </div>
                            }
                            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(30,45,80,0.5)', color: '#8890a6', fontSize: '0.8rem' }}>
                                {todayData.length} payment(s) | Total: ₹{todayTotal.toLocaleString('en-IN')}
                            </div>
                        </div>
                    </>
                )}

                {/* ─── ALL PAYMENTS TAB ───────────────────────────── */}
                {activeTab === 'all' && (
                    <>
                        {/* Filters */}
                        <div className="glass-card p-3 mb-3">
                            <div className="row g-2 align-items-center">
                                <div className="col-md-4">
                                    <div className="search-box">
                                        <span className="search-icon">🔍</span>
                                        <input className="form-control" placeholder="Search name, STB, mobile, payment ID..." value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} placeholder="From date" />
                                </div>
                                <div className="col-md-3">
                                    <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} placeholder="To date" />
                                </div>
                                <div className="col-md-2">
                                    <button onClick={() => { setSearch(''); setFromDate(''); setToDate(''); }} className="btn w-100" style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 10 }}>🔄 Reset</button>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-0" style={{ overflow: 'hidden' }}>
                            {loading ? <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div> :
                                allData.length === 0 ? <div className="text-center py-5" style={{ color: '#8890a6' }}>No payments found.</div> :
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table-dark-custom">
                                            <thead><tr><th>STB #</th><th>Customer</th><th>Village</th><th>Mobile</th><th>Amount</th><th>Plan</th><th>Status</th><th>Date & Time</th><th>Action</th></tr></thead>
                                            <tbody>{allData.map(t => <TransactionRow key={t.id} t={t} showDate={true} />)}</tbody>
                                        </table>
                                    </div>
                            }
                            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(30,45,80,0.5)', color: '#8890a6', fontSize: '0.8rem' }}>
                                {allData.length} payment(s) | Total: ₹{allData.reduce((s, t) => s + Number(t.amount_paid), 0).toLocaleString('en-IN')}
                            </div>
                        </div>
                    </>
                )}

                {/* ─── Detail Modal ────────────────────────────────── */}
                {detailModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setDetailModal(false)}>
                        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
                            <div className="modal-content modal-dark">
                                <div className="modal-header">
                                    <h5 className="modal-title">👁 Payment Details</h5>
                                    <button className="btn-close" onClick={() => setDetailModal(false)} />
                                </div>
                                <div className="modal-body">
                                    {detailLoading ? (
                                        <div className="text-center py-4"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
                                    ) : detailTx ? (
                                        <div className="row g-3">
                                            {/* Transaction Info */}
                                            <div className="col-12">
                                                <div className="glass-card p-3" style={{ borderRadius: 10 }}>
                                                    <h6 style={{ color: '#f5a623', fontWeight: 700, marginBottom: '0.75rem' }}>💳 Transaction Info</h6>
                                                    <div className="row g-2">
                                                        {[
                                                            ['Payment ID', detailTx.payment_id],
                                                            ['STB Number', detailTx.stb_number],
                                                            ['Amount Paid', `₹${Number(detailTx.amount_paid).toLocaleString('en-IN')}`],
                                                            ['Months Recharged', `${detailTx.months_recharged} month(s)`],
                                                            ['Status', detailTx.payment_status],
                                                            ['Date', new Date(detailTx.date).toLocaleString('en-IN')],
                                                        ].map(([label, value]) => (
                                                            <div className="col-md-6" key={label}>
                                                                <div style={{ color: '#8890a6', fontSize: '0.78rem' }}>{label}</div>
                                                                <div style={{ fontWeight: 500, wordBreak: 'break-all' }}>{value || '-'}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Customer Info */}
                                            {detailTx.customers && (
                                                <div className="col-12">
                                                    <div className="glass-card p-3" style={{ borderRadius: 10 }}>
                                                        <h6 style={{ color: '#4facfe', fontWeight: 700, marginBottom: '0.75rem' }}>👤 Customer Details</h6>
                                                        <div className="row g-2">
                                                            {[
                                                                ['Name', detailTx.customers.name],
                                                                ['Mobile', detailTx.customers.mobile],
                                                                ['Village', detailTx.customers.village],
                                                                ['Street', detailTx.customers.street],
                                                                ['Has Amplifier', detailTx.customers.has_amplifier ? '✅ Yes' : 'No'],
                                                                ['Alternate Mobile', detailTx.customers.alternate_mobile],
                                                                ['Full Address', detailTx.customers.full_address],
                                                                ['Account Status', detailTx.customers.status],
                                                            ].filter(([, v]) => v).map(([label, value]) => (
                                                                <div className="col-md-6" key={label}>
                                                                    <div style={{ color: '#8890a6', fontSize: '0.78rem' }}>{label}</div>
                                                                    <div style={{ fontWeight: 500 }}>{value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="modal-footer">
                                    <button className="btn" onClick={() => setDetailModal(false)} style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 8 }}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentList;
