import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';
import { VILLAGE_PRICES } from '../../constants/pricing';

// Fallback in case the API is unreachable
const FALLBACK_VILLAGES = Object.keys(VILLAGE_PRICES);

const InsertBox = () => {
    const navigate = useNavigate();
    const [villages, setVillages] = useState(FALLBACK_VILLAGES);
    const [form, setForm] = useState({
        stb_number: '', name: '', mobile: '', village: '', street: '',
        has_amplifier: false, alternate_mobile: '', full_address: '', status: 'active',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Load the live village list from Settings
    useEffect(() => {
        api.get('/api/settings')
            .then(({ data }) => {
                if (data.villages?.length) {
                    setVillages(data.villages.map(v => v.name));
                }
            })
            .catch(() => { /* silently use fallback */ });
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        setLoading(true);
        try {
            const { data } = await api.post('/api/customers', form);
            setSuccess(`✅ Customer "${data.customer.name}" (STB: ${data.customer.stb_number}) added successfully!`);
            setTimeout(() => navigate('/admin/customers'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add customer.');
        } finally { setLoading(false); }
    };

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                <div className="page-header d-flex align-items-center justify-content-between">
                    <div><h2>➕ Insert Box</h2><p>Add a new cable TV customer / STB.</p></div>
                    <div className="d-flex gap-2">
                        <button onClick={() => navigate('/admin/customers/bulk')} className="btn" style={{ color: '#f5a623', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 10, fontSize: '0.85rem' }}>
                            📦 Bulk Import (Excel/CSV)
                        </button>
                        <button onClick={() => navigate('/admin/customers')} className="btn" style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 10 }}>← Back to List</button>
                    </div>
                </div>

                <div className="glass-card p-4 fade-in-up" style={{ maxWidth: 700 }}>
                    {error && <div className="alert mb-3 p-2" style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', color: '#e94560', borderRadius: 10 }}>⚠️ {error}</div>}
                    {success && <div className="alert mb-3 p-2" style={{ background: 'rgba(40,224,126,0.1)', border: '1px solid rgba(40,224,126,0.3)', color: '#28e07e', borderRadius: 10 }}>{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">STB / Box Number *</label>
                                <input className="form-control" name="stb_number" value={form.stb_number} onChange={handleChange} placeholder="e.g. STB001234" required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Full Name *</label>
                                <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Customer full name" required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Mobile Number *</label>
                                <input className="form-control" name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Village / City *</label>
                                <select className="form-select" name="village" value={form.village} onChange={handleChange} required>
                                    <option value="">Select village...</option>
                                    {villages.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Street / Area</label>
                                <input className="form-control" name="street" value={form.street} onChange={handleChange} placeholder="Street or area name" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Status</label>
                                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Amplifier */}
                            <div className="col-12">
                                <div className="glass-card p-3" style={{ borderRadius: 10 }}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="insert_amp" name="has_amplifier" checked={form.has_amplifier} onChange={handleChange} />
                                        <label className="form-check-label" htmlFor="insert_amp" style={{ color: '#e8e8f0', fontWeight: 500 }}>📶 Has Amplifier</label>
                                    </div>
                                    {form.has_amplifier && (
                                        <div className="row g-3 mt-1 fade-in-up">
                                            <div className="col-md-6">
                                                <label className="form-label">Alternate Mobile *</label>
                                                <input className="form-control" name="alternate_mobile" value={form.alternate_mobile} onChange={handleChange} placeholder="Alternate contact" maxLength={10} required={form.has_amplifier} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Full Address *</label>
                                                <textarea className="form-control" name="full_address" value={form.full_address} onChange={handleChange} rows={2} placeholder="Full address for amplifier installation..." required={form.has_amplifier} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-12 d-flex gap-3 mt-2">
                                <button type="submit" className="btn-primary-custom flex-fill" disabled={loading}>
                                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Adding...</> : '➕ Add Customer'}
                                </button>
                                <button type="button" onClick={() => navigate('/admin/customers')} className="btn flex-fill" style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 10 }}>Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InsertBox;
