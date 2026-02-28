import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';

// ── Reusable small components ─────────────────────────────────────────────────
const SectionCard = ({ icon, title, subtitle, children }) => (
    <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#e94560,#c73652)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
            <div>
                <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>{title}</h5>
                <p style={{ margin: 0, color: '#8890a6', fontSize: '0.82rem' }}>{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
);

const SuccessMsg = ({ msg, onClear }) => msg ? (
    <div className="fade-in-up mb-3 p-2 d-flex align-items-center justify-content-between"
        style={{ background: 'rgba(40,224,126,0.08)', border: '1px solid rgba(40,224,126,0.3)', borderRadius: 10 }}>
        <span style={{ color: '#28e07e', fontSize: '0.85rem' }}>✅ {msg}</span>
        <button onClick={onClear} style={{ background: 'none', border: 'none', color: '#8890a6', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
) : null;

const ErrorMsg = ({ msg, onClear }) => msg ? (
    <div className="fade-in-up mb-3 p-2 d-flex align-items-center justify-content-between"
        style={{ background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 10 }}>
        <span style={{ color: '#e94560', fontSize: '0.85rem' }}>⚠️ {msg}</span>
        <button onClick={onClear} style={{ background: 'none', border: 'none', color: '#8890a6', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
) : null;

const inputStyle = {
    background: 'rgba(15,15,26,0.8)',
    border: '1px solid #1e2d50',
    color: '#e8e8f0',
    borderRadius: 10,
    padding: '0.55rem 0.9rem',
    fontSize: '0.9rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
};

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
    { key: 'villages', icon: '🏘️', label: 'Villages & Prices' },
    { key: 'offers', icon: '🎁', label: 'Subscription Offers' },
    { key: 'formmeta', icon: '🔧', label: 'Form Settings' },
];

// =============================================================================
const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('villages');
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalMsg, setGlobalMsg] = useState('');
    const [globalErr, setGlobalErr] = useState('');

    // ── Village state ────────────────────────────────────────────────────────
    const [vForm, setVForm] = useState({ name: '', price: '' });
    const [vEditing, setVEditing] = useState(null); // { name, price } original
    const [vLoading, setVLoading] = useState(false);
    const [vMsg, setVMsg] = useState(''); const [vErr, setVErr] = useState('');

    // ── Offer state ──────────────────────────────────────────────────────────
    const [oForm, setOForm] = useState({ label: '', months: '', multiplier: '', freeMonths: '' });
    const [oEditing, setOEditing] = useState(null); // index being edited
    const [oLoading, setOLoading] = useState(false);
    const [oMsg, setOMsg] = useState(''); const [oErr, setOErr] = useState('');

    // ── Form Meta state ──────────────────────────────────────────────────────
    const [metaForm, setMetaForm] = useState({
        amplifierDiscount: '',
        businessName: '',
        tagline: '',
        supportPhone: '',
        requireAmplifierAddress: true,
        showStreetField: true,
    });
    const [metaLoading, setMetaLoading] = useState(false);
    const [metaMsg, setMetaMsg] = useState(''); const [metaErr, setMetaErr] = useState('');

    // ── Load settings ────────────────────────────────────────────────────────
    const loadSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/settings');
            setSettings(data);
            setMetaForm({
                amplifierDiscount: data.amplifierDiscount ?? 50,
                businessName: data.formMeta?.businessName ?? '',
                tagline: data.formMeta?.tagline ?? '',
                supportPhone: data.formMeta?.supportPhone ?? '',
                requireAmplifierAddress: data.formMeta?.requireAmplifierAddress ?? true,
                showStreetField: data.formMeta?.showStreetField ?? true,
            });
        } catch (err) {
            setGlobalErr('Failed to load settings. Please refresh.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    // ── VILLAGE CRUD ─────────────────────────────────────────────────────────
    const handleVSubmit = async (e) => {
        e.preventDefault();
        if (!vForm.name.trim() || !vForm.price) { setVErr('Name and price are required.'); return; }
        if (Number(vForm.price) <= 0) { setVErr('Price must be greater than 0.'); return; }
        setVLoading(true); setVErr(''); setVMsg('');
        try {
            const payload = { name: vForm.name.trim(), price: Number(vForm.price) };
            if (vEditing) payload.oldName = vEditing.name;
            const { data } = await api.patch('/api/settings/villages', payload);
            setSettings(s => ({ ...s, villages: data.villages }));
            setVMsg(vEditing ? `"${vForm.name}" updated successfully!` : `"${vForm.name}" added!`);
            setVForm({ name: '', price: '' });
            setVEditing(null);
        } catch (err) {
            setVErr(err.response?.data?.error || 'Failed to save village.');
        } finally { setVLoading(false); }
    };

    const handleVEdit = (v) => {
        setVEditing(v);
        setVForm({ name: v.name, price: v.price });
        setVMsg(''); setVErr('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleVDelete = async (name) => {
        if (!window.confirm(`Delete village "${name}"? Existing customers in this village will not be affected.`)) return;
        setVLoading(true); setVErr(''); setVMsg('');
        try {
            const { data } = await api.delete(`/api/settings/villages/${encodeURIComponent(name)}`);
            setSettings(s => ({ ...s, villages: data.villages }));
            setVMsg(`"${name}" removed.`);
        } catch (err) {
            setVErr(err.response?.data?.error || 'Failed to delete village.');
        } finally { setVLoading(false); }
    };

    // ── OFFER CRUD ───────────────────────────────────────────────────────────
    const handleOSubmit = async (e) => {
        e.preventDefault();
        if (!oForm.label.trim() || !oForm.months || !oForm.multiplier) { setOErr('Label, months, and price multiplier are required.'); return; }
        setOLoading(true); setOErr(''); setOMsg('');
        try {
            const payload = {
                label: oForm.label.trim(),
                months: Number(oForm.months),
                multiplier: Number(oForm.multiplier),
                freeMonths: Number(oForm.freeMonths || 0),
            };
            if (oEditing !== null) payload.index = oEditing;
            const { data } = await api.patch('/api/settings/offers', payload);
            setSettings(s => ({ ...s, offers: data.offers }));
            setOMsg(oEditing !== null ? 'Offer updated!' : 'New offer added!');
            setOForm({ label: '', months: '', multiplier: '', freeMonths: '' });
            setOEditing(null);
        } catch (err) {
            setOErr(err.response?.data?.error || 'Failed to save offer.');
        } finally { setOLoading(false); }
    };

    const handleOEdit = (o, idx) => {
        setOEditing(idx);
        setOForm({ label: o.label, months: o.months, multiplier: o.multiplier, freeMonths: o.freeMonths });
        setOMsg(''); setOErr('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleODelete = async (idx, label) => {
        if (!window.confirm(`Delete offer "${label}"?`)) return;
        setOLoading(true); setOErr(''); setOMsg('');
        try {
            const { data } = await api.delete(`/api/settings/offers/${idx}`);
            setSettings(s => ({ ...s, offers: data.offers }));
            setOMsg(`"${label}" removed.`);
        } catch (err) {
            setOErr(err.response?.data?.error || 'Failed to delete offer.');
        } finally { setOLoading(false); }
    };

    // ── FORM META SAVE ───────────────────────────────────────────────────────
    const handleMetaSave = async (e) => {
        e.preventDefault();
        if (!metaForm.businessName.trim()) { setMetaErr('Business name is required.'); return; }
        setMetaLoading(true); setMetaErr(''); setMetaMsg('');
        try {
            await api.patch('/api/settings/form-meta', {
                amplifierDiscount: Number(metaForm.amplifierDiscount),
                formMeta: {
                    businessName: metaForm.businessName,
                    tagline: metaForm.tagline,
                    supportPhone: metaForm.supportPhone,
                    requireAmplifierAddress: metaForm.requireAmplifierAddress,
                    showStreetField: metaForm.showStreetField,
                },
            });
            setSettings(s => ({
                ...s,
                amplifierDiscount: Number(metaForm.amplifierDiscount),
                formMeta: { businessName: metaForm.businessName, tagline: metaForm.tagline, supportPhone: metaForm.supportPhone, requireAmplifierAddress: metaForm.requireAmplifierAddress, showStreetField: metaForm.showStreetField },
            }));
            setMetaMsg('Form settings saved! The customer payment form will update immediately.');
        } catch (err) {
            setMetaErr(err.response?.data?.error || 'Failed to save settings.');
        } finally { setMetaLoading(false); }
    };

    // ── RENDER ───────────────────────────────────────────────────────────────
    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">

                {/* Page Header */}
                <div className="page-header d-flex align-items-center justify-content-between">
                    <div>
                        <h2>⚙️ Settings</h2>
                        <p>Configure the customer payment form — villages, pricing, offers, and form fields.</p>
                    </div>
                    <button onClick={() => navigate('/admin')} className="btn"
                        style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 10 }}>
                        ← Dashboard
                    </button>
                </div>

                {globalMsg && <SuccessMsg msg={globalMsg} onClear={() => setGlobalMsg('')} />}
                {globalErr && <ErrorMsg msg={globalErr} onClear={() => setGlobalErr('')} />}

                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
                ) : (
                    <>
                        {/* Tab Bar */}
                        <div className="d-flex gap-2 mb-4" style={{ borderBottom: '1px solid #1e2d50', paddingBottom: '0.5rem' }}>
                            {TABS.map(t => (
                                <button key={t.key} onClick={() => setActiveTab(t.key)}
                                    className="btn"
                                    style={{
                                        borderRadius: 10,
                                        padding: '0.5rem 1.2rem',
                                        fontSize: '0.9rem',
                                        fontWeight: activeTab === t.key ? 700 : 500,
                                        background: activeTab === t.key ? 'rgba(233,69,96,0.15)' : 'rgba(30,45,80,0.3)',
                                        color: activeTab === t.key ? '#e94560' : '#8890a6',
                                        border: activeTab === t.key ? '1.5px solid rgba(233,69,96,0.5)' : '1px solid rgba(30,45,80,0.5)',
                                        transition: 'all 0.2s',
                                    }}>
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>

                        {/* ══ TAB: Villages & Prices ══════════════════════════════════════════ */}
                        {activeTab === 'villages' && (
                            <>
                                <SectionCard icon="🏘️" title="Add / Edit Village" subtitle="These appear in the village dropdown on the customer payment form.">
                                    <SuccessMsg msg={vMsg} onClear={() => setVMsg('')} />
                                    <ErrorMsg msg={vErr} onClear={() => setVErr('')} />

                                    {vEditing && (
                                        <div className="mb-3 p-2 d-flex align-items-center gap-2"
                                            style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 10, fontSize: '0.85rem', color: '#f5a623' }}>
                                            ✏️ Editing: <strong>{vEditing.name}</strong>
                                            <button onClick={() => { setVEditing(null); setVForm({ name: '', price: '' }); }}
                                                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#8890a6', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    )}

                                    <form onSubmit={handleVSubmit}>
                                        <div className="row g-3">
                                            <div className="col-md-5">
                                                <label className="form-label">Village / City Name *</label>
                                                <input style={inputStyle} value={vForm.name} onChange={e => setVForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Krishnagiri" />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Monthly Price (₹) *</label>
                                                <input style={inputStyle} type="number" min="1" value={vForm.price} onChange={e => setVForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 250" />
                                            </div>
                                            <div className="col-md-3 d-flex align-items-end gap-2">
                                                <button type="submit" disabled={vLoading} className="btn-primary-custom flex-fill" style={{ padding: '0.58rem 1rem' }}>
                                                    {vLoading ? <span className="spinner-border spinner-border-sm" /> : (vEditing ? '💾 Update' : '➕ Add')}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </SectionCard>

                                <SectionCard icon="📋" title="All Villages" subtitle={`${settings?.villages?.length || 0} villages configured — sorted A-Z`}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table-dark-custom">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Village / City</th>
                                                    <th>Monthly Price</th>
                                                    <th>1-Month Plan</th>
                                                    <th>6-Month Plan</th>
                                                    <th>1-Year Plan</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...(settings?.villages || [])].sort((a, b) => a.name.localeCompare(b.name)).map((v, i) => {
                                                    const offers = settings?.offers || [];
                                                    return (
                                                        <tr key={v.name}>
                                                            <td style={{ color: '#8890a6' }}>{i + 1}</td>
                                                            <td style={{ fontWeight: 600 }}>🏘️ {v.name}</td>
                                                            <td><span style={{ color: '#e94560', fontWeight: 700 }}>₹{v.price}</span><span style={{ color: '#8890a6', fontSize: '0.78rem' }}> /mo</span></td>
                                                            {offers.slice(0, 3).map((o, oi) => (
                                                                <td key={oi} style={{ color: '#28e07e', fontSize: '0.85rem' }}>
                                                                    ₹{v.price * o.multiplier}
                                                                    {o.freeMonths > 0 && <span style={{ color: '#f5a623', fontSize: '0.75rem', marginLeft: 4 }}>+{o.freeMonths}free</span>}
                                                                </td>
                                                            ))}
                                                            {offers.length < 3 && Array(3 - offers.length).fill(0).map((_, i) => <td key={'e' + i}>-</td>)}
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <button onClick={() => handleVEdit(v)}
                                                                        style={{ background: 'rgba(79,172,254,0.15)', color: '#4facfe', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                                        ✏️ Edit
                                                                    </button>
                                                                    <button onClick={() => handleVDelete(v.name)}
                                                                        style={{ background: 'rgba(233,69,96,0.15)', color: '#e94560', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                                        🗑 Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {(!settings?.villages?.length) && (
                                                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#8890a6', padding: '2rem' }}>No villages configured.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </SectionCard>
                            </>
                        )}

                        {/* ══ TAB: Subscription Offers ════════════════════════════════════════ */}
                        {activeTab === 'offers' && (
                            <>
                                <SectionCard icon="🎁" title="Add / Edit Subscription Offer" subtitle="Offers shown as plan cards on the customer payment form.">
                                    <SuccessMsg msg={oMsg} onClear={() => setOMsg('')} />
                                    <ErrorMsg msg={oErr} onClear={() => setOErr('')} />

                                    {oEditing !== null && (
                                        <div className="mb-3 p-2 d-flex align-items-center gap-2"
                                            style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 10, fontSize: '0.85rem', color: '#f5a623' }}>
                                            ✏️ Editing offer #{oEditing + 1}: <strong>{settings?.offers[oEditing]?.label}</strong>
                                            <button onClick={() => { setOEditing(null); setOForm({ label: '', months: '', multiplier: '', freeMonths: '' }); }}
                                                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#8890a6', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    )}

                                    <form onSubmit={handleOSubmit}>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label">Plan Label *</label>
                                                <input style={inputStyle} value={oForm.label} onChange={e => setOForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. 6 Months" />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Total Months *</label>
                                                <input style={inputStyle} type="number" min="1" value={oForm.months} onChange={e => setOForm(f => ({ ...f, months: e.target.value }))} placeholder="6" />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Pay Months *</label>
                                                <input style={inputStyle} type="number" min="1" value={oForm.multiplier} onChange={e => setOForm(f => ({ ...f, multiplier: e.target.value }))} placeholder="5" />
                                                <div style={{ color: '#8890a6', fontSize: '0.72rem', marginTop: 3 }}>Price = village price × this</div>
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Free Months</label>
                                                <input style={inputStyle} type="number" min="0" value={oForm.freeMonths} onChange={e => setOForm(f => ({ ...f, freeMonths: e.target.value }))} placeholder="1" />
                                            </div>
                                            <div className="col-md-2 d-flex align-items-end">
                                                <button type="submit" disabled={oLoading} className="btn-primary-custom w-100" style={{ padding: '0.58rem 1rem' }}>
                                                    {oLoading ? <span className="spinner-border spinner-border-sm" /> : (oEditing !== null ? '💾 Save' : '➕ Add')}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </SectionCard>

                                <SectionCard icon="📋" title={`All Offers (${settings?.offers?.length || 0})`} subtitle="Drag-and-drop coming soon. Add offers using the form above.">
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table-dark-custom">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Plan Label</th>
                                                    <th>Total Months</th>
                                                    <th>Pay Months (multiplier)</th>
                                                    <th>Free Months</th>
                                                    <th>Example (₹250 village)</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(settings?.offers || []).map((o, i) => (
                                                    <tr key={i}>
                                                        <td style={{ color: '#8890a6' }}>{i + 1}</td>
                                                        <td style={{ fontWeight: 600 }}>🎁 {o.label}</td>
                                                        <td><span className="badge-success">{o.months} months</span></td>
                                                        <td style={{ color: '#4facfe' }}>× {o.multiplier}</td>
                                                        <td>{o.freeMonths > 0 ? <span style={{ color: '#f5a623' }}>+{o.freeMonths} free</span> : <span style={{ color: '#8890a6' }}>—</span>}</td>
                                                        <td style={{ color: '#e94560', fontWeight: 700 }}>₹{250 * o.multiplier}</td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <button onClick={() => handleOEdit(o, i)}
                                                                    style={{ background: 'rgba(79,172,254,0.15)', color: '#4facfe', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                                    ✏️ Edit
                                                                </button>
                                                                <button onClick={() => handleODelete(i, o.label)}
                                                                    disabled={(settings?.offers?.length || 0) <= 1}
                                                                    style={{ background: 'rgba(233,69,96,0.15)', color: '#e94560', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', opacity: (settings?.offers?.length || 0) <= 1 ? 0.4 : 1 }}>
                                                                    🗑 Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!settings?.offers?.length) && (
                                                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#8890a6', padding: '2rem' }}>No offers configured.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </SectionCard>

                                {/* Live preview */}
                                {settings?.offers?.length > 0 && settings?.villages?.length > 0 && (
                                    <SectionCard icon="👁" title="Live Preview" subtitle="How offer cards look to the customer (using first village price)">
                                        <div className="d-flex gap-3 flex-wrap">
                                            {settings.offers.map((o, i) => {
                                                const basePrice = settings.villages[0]?.price || 250;
                                                const price = basePrice * o.multiplier;
                                                return (
                                                    <div key={i} style={{ background: 'rgba(15,15,26,0.8)', border: i === 0 ? '2px solid #e94560' : '2px solid #1e2d50', borderRadius: 12, padding: '1rem 1.5rem', textAlign: 'center', minWidth: 130 }}>
                                                        <div style={{ fontSize: '0.8rem', color: '#8890a6', marginBottom: 4 }}>{o.label}</div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e94560' }}>₹{price}</div>
                                                        {o.freeMonths > 0 && <div style={{ fontSize: '0.72rem', background: 'rgba(245,166,35,0.2)', color: '#f5a623', borderRadius: 4, padding: '2px 6px', marginTop: 4, display: 'inline-block' }}>🎁 {o.freeMonths} month free</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p style={{ color: '#8890a6', fontSize: '0.78rem', marginTop: 12, marginBottom: 0 }}>
                                            Preview is based on: <strong style={{ color: '#f5a623' }}>{settings.villages[0]?.name}</strong> (₹{settings.villages[0]?.price}/month)
                                        </p>
                                    </SectionCard>
                                )}
                            </>
                        )}

                        {/* ══ TAB: Form Settings ══════════════════════════════════════════════ */}
                        {activeTab === 'formmeta' && (
                            <SectionCard icon="🔧" title="Payment Form Settings" subtitle="Controls the appearance and behaviour of the public customer payment form.">
                                <SuccessMsg msg={metaMsg} onClear={() => setMetaMsg('')} />
                                <ErrorMsg msg={metaErr} onClear={() => setMetaErr('')} />

                                <form onSubmit={handleMetaSave}>
                                    <div className="row g-4">

                                        {/* Business Identity */}
                                        <div className="col-12">
                                            <h6 style={{ color: '#8890a6', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>🏢 Business Identity</h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Business Name *</label>
                                                    <input className="form-control" value={metaForm.businessName} onChange={e => setMetaForm(f => ({ ...f, businessName: e.target.value }))} placeholder="Happy Star Satellite Vision" />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Support Phone</label>
                                                    <input className="form-control" value={metaForm.supportPhone} onChange={e => setMetaForm(f => ({ ...f, supportPhone: e.target.value }))} placeholder="+91 9876543210" />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">Form Tagline</label>
                                                    <input className="form-control" value={metaForm.tagline} onChange={e => setMetaForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Recharge your Cable TV subscription online" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amplifier */}
                                        <div className="col-12">
                                            <h6 style={{ color: '#8890a6', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>📶 Amplifier Settings</h6>
                                            <div className="row g-3 align-items-center">
                                                <div className="col-md-4">
                                                    <label className="form-label">Amplifier Discount (₹)</label>
                                                    <input className="form-control" type="number" min="0" value={metaForm.amplifierDiscount} onChange={e => setMetaForm(f => ({ ...f, amplifierDiscount: e.target.value }))} placeholder="50" />
                                                    <div style={{ color: '#8890a6', fontSize: '0.78rem', marginTop: 4 }}>Applied per subscription when customer has amplifier</div>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Require Address for Amplifier?</label>
                                                    <div className="d-flex gap-3">
                                                        {[true, false].map(v => (
                                                            <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                                                                <input type="radio" checked={metaForm.requireAmplifierAddress === v} onChange={() => setMetaForm(f => ({ ...f, requireAmplifierAddress: v }))} style={{ accentColor: '#e94560' }} />
                                                                {v ? 'Yes (Required)' : 'No (Optional)'}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Fields Toggle */}
                                        <div className="col-12">
                                            <h6 style={{ color: '#8890a6', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>📝 Form Fields</h6>
                                            <div className="d-flex flex-wrap gap-3">
                                                {[
                                                    { key: 'showStreetField', label: '🛣️ Show Street / Area Field' },
                                                ].map(({ key, label }) => (
                                                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'rgba(30,45,80,0.4)', border: '1px solid #1e2d50', borderRadius: 10, padding: '0.6rem 1.2rem' }}>
                                                        <input type="checkbox" checked={metaForm[key]} onChange={e => setMetaForm(f => ({ ...f, [key]: e.target.checked }))} style={{ accentColor: '#e94560', width: 16, height: 16 }} />
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Save button */}
                                        <div className="col-12">
                                            <button type="submit" disabled={metaLoading} className="btn-primary-custom px-5">
                                                {metaLoading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : '💾 Save Form Settings'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </SectionCard>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default Settings;
