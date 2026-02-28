import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';
import { VILLAGE_PRICES } from '../../constants/pricing';

const FALLBACK_VILLAGES = Object.keys(VILLAGE_PRICES);

const EditBox = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [villages, setVillages] = useState(FALLBACK_VILLAGES);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load live villages from Settings
        api.get('/api/settings')
            .then(({ data }) => { if (data.villages?.length) setVillages(data.villages.map(v => v.name)); })
            .catch(() => { }); // silently fallback

        // Load customer data
        api.get(`/api/customers/${id}`)
            .then(({ data }) => setForm(data))
            .catch(() => setError('Customer not found.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(null); setSaving(true);
        try {
            await api.put(`/api/customers/${id}`, form);
            navigate('/admin/customers');
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed.');
        } finally { setSaving(false); }
    };

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                <div className="page-header d-flex align-items-center justify-content-between">
                    <div><h2>✏️ Edit Customer</h2><p>Update customer information.</p></div>
                    <button onClick={() => navigate('/admin/customers')} className="btn" style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 10 }}>← Back</button>
                </div>

                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
                ) : error ? (
                    <div className="glass-card p-4" style={{ border: '1px solid rgba(233,69,96,0.3)', color: '#e94560' }}>⚠️ {error}</div>
                ) : (
                    <div className="glass-card p-4 fade-in-up" style={{ maxWidth: 700 }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">STB / Box Number *</label>
                                    <input className="form-control" name="stb_number" value={form.stb_number} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Full Name *</label>
                                    <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Mobile *</label>
                                    <input className="form-control" name="mobile" value={form.mobile} onChange={handleChange} required maxLength={10} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Village *</label>
                                    <select className="form-select" name="village" value={form.village} onChange={handleChange} required>
                                        <option value="">Select...</option>
                                        {villages.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Street</label>
                                    <input className="form-control" name="street" value={form.street || ''} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <div className="glass-card p-3" style={{ borderRadius: 10 }}>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="edit_amp" name="has_amplifier" checked={form.has_amplifier} onChange={handleChange} />
                                            <label className="form-check-label" htmlFor="edit_amp" style={{ color: '#e8e8f0', fontWeight: 500 }}>📶 Has Amplifier</label>
                                        </div>
                                        {form.has_amplifier && (
                                            <div className="row g-3 mt-1 fade-in-up">
                                                <div className="col-md-6">
                                                    <label className="form-label">Alternate Mobile</label>
                                                    <input className="form-control" name="alternate_mobile" value={form.alternate_mobile || ''} onChange={handleChange} maxLength={10} />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">Full Address</label>
                                                    <textarea className="form-control" name="full_address" value={form.full_address || ''} onChange={handleChange} rows={2} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {error && <div className="col-12"><div style={{ color: '#e94560', fontSize: '0.9rem' }}>⚠️ {error}</div></div>}
                                <div className="col-12 d-flex gap-3 mt-2">
                                    <button type="submit" className="btn-primary-custom flex-fill" disabled={saving}>
                                        {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : '💾 Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => navigate('/admin/customers')} className="btn flex-fill" style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 10 }}>Cancel</button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditBox;
