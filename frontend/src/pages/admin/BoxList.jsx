import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';
import { VILLAGE_PRICES } from '../../constants/pricing';

const FALLBACK_VILLAGES = Object.keys(VILLAGE_PRICES);
const defaultForm = { stb_number: '', name: '', mobile: '', village: '', street: '', has_amplifier: false, alternate_mobile: '', full_address: '', status: 'active' };

const BoxList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [villages, setVillages] = useState(FALLBACK_VILLAGES);
    const [search, setSearch] = useState('');
    const [villageFilter, setVillageFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Edit Modal
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState(defaultForm);
    const [editId, setEditId] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    // Delete Modal
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (villageFilter) params.village = villageFilter;
            if (statusFilter) params.status = statusFilter;
            const { data } = await api.get('/api/customers', { params });
            setCustomers(data);
        } catch (err) {
            showToast('Failed to load customers.', 'error');
        } finally { setLoading(false); }
    }, [search, villageFilter, statusFilter]);

    // Load live villages from Settings
    useEffect(() => {
        api.get('/api/settings')
            .then(({ data }) => { if (data.villages?.length) setVillages(data.villages.map(v => v.name)); })
            .catch(() => { });
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    // ── Edit ──────────────────────────────────────────────────
    const openEdit = (c) => { setEditId(c.id); setEditForm({ ...c }); setEditModal(true); };
    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const submitEdit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await api.put(`/api/customers/${editId}`, editForm);
            showToast('Customer updated successfully!');
            setEditModal(false);
            fetchCustomers();
        } catch (err) {
            showToast(err.response?.data?.error || 'Update failed.', 'error');
        } finally { setEditLoading(false); }
    };

    // ── Delete ────────────────────────────────────────────────
    const openDelete = (c) => { setDeleteTarget(c); setDeleteModal(true); };
    const confirmDelete = async () => {
        try {
            await api.delete(`/api/customers/${deleteTarget.id}`);
            showToast('Customer deleted.');
            setDeleteModal(false);
            setDeleteTarget(null);
            fetchCustomers();
        } catch (err) {
            showToast('Delete failed.', 'error');
        }
    };

    // ── Status Toggle ─────────────────────────────────────────
    const toggleStatus = async (c) => {
        const newStatus = c.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/api/customers/${c.id}/status`, { status: newStatus });
            showToast(`Status set to ${newStatus}.`);
            fetchCustomers();
        } catch { showToast('Status update failed.', 'error'); }
    };

    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">

                {/* Toast */}
                {toast && (
                    <div className="fade-in-up" style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, background: toast.type === 'error' ? 'rgba(233,69,96,0.9)' : 'rgba(40,224,126,0.9)', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
                    </div>
                )}

                <div className="page-header d-flex align-items-center justify-content-between">
                    <div><h2>📦 Box List</h2><p>Manage all registered cable TV customers.</p></div>
                    <Link to="/admin/customers/new" className="btn-primary-custom" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>➕ Insert Box</Link>
                </div>

                {/* Filters */}
                <div className="glass-card p-3 mb-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input className="form-control" placeholder="Search by name, STB, mobile..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={villageFilter} onChange={e => setVillageFilter(e.target.value)}>
                                <option value="">All Villages</option>
                                {villages.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button className="btn w-100" onClick={fetchCustomers} style={{ background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', color: '#e8e8f0', borderRadius: 10 }}>🔄 Refresh</button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card p-0" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
                        ) : customers.length === 0 ? (
                            <div className="text-center py-5" style={{ color: '#8890a6' }}>No customers found.</div>
                        ) : (
                            <table className="table-dark-custom">
                                <thead><tr>
                                    <th>#</th><th>STB Number</th><th>Name</th><th>Mobile</th><th>Village</th><th>Street</th><th>Amplifier</th><th>Status</th><th>Actions</th>
                                </tr></thead>
                                <tbody>
                                    {customers.map((c, i) => (
                                        <tr key={c.id}>
                                            <td style={{ color: '#8890a6' }}>{i + 1}</td>
                                            <td><code style={{ color: '#f5a623', fontSize: '0.8rem' }}>{c.stb_number}</code></td>
                                            <td style={{ fontWeight: 500 }}>{c.name}</td>
                                            <td>{c.mobile}</td>
                                            <td>{c.village}</td>
                                            <td style={{ color: '#8890a6' }}>{c.street || '-'}</td>
                                            <td>{c.has_amplifier ? <span style={{ color: '#28e07e' }}>✅ Yes</span> : <span style={{ color: '#8890a6' }}>No</span>}</td>
                                            <td>
                                                <button onClick={() => toggleStatus(c)} className={c.status === 'active' ? 'badge-active' : 'badge-inactive'} style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: '0.3em 0.7em', borderRadius: 20 }}>
                                                    {c.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button onClick={() => openEdit(c)} className="btn btn-sm" style={{ background: 'rgba(79,172,254,0.15)', color: '#4facfe', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 8, fontSize: '0.8rem' }}>✏️ Edit</button>
                                                    <button onClick={() => openDelete(c)} className="btn btn-sm" style={{ background: 'rgba(233,69,96,0.15)', color: '#e94560', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 8, fontSize: '0.8rem' }}>🗑️ Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(30,45,80,0.5)', color: '#8890a6', fontSize: '0.8rem' }}>
                        Total: {customers.length} customer(s)
                    </div>
                </div>

                {/* ─── Edit Modal ─────────────────────────────────── */}
                {editModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setEditModal(false)}>
                        <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
                            <div className="modal-content modal-dark">
                                <div className="modal-header">
                                    <h5 className="modal-title">✏️ Edit Customer</h5>
                                    <button className="btn-close" onClick={() => setEditModal(false)} />
                                </div>
                                <form onSubmit={submitEdit}>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">STB Number *</label>
                                                <input className="form-control" name="stb_number" value={editForm.stb_number} onChange={handleEditChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Full Name *</label>
                                                <input className="form-control" name="name" value={editForm.name} onChange={handleEditChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Mobile *</label>
                                                <input className="form-control" name="mobile" value={editForm.mobile} onChange={handleEditChange} required maxLength={10} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Village *</label>
                                                <select className="form-select" name="village" value={editForm.village} onChange={handleEditChange} required>
                                                    <option value="">Select...</option>
                                                    {villages.map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Street</label>
                                                <input className="form-control" name="street" value={editForm.street || ''} onChange={handleEditChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Status</label>
                                                <select className="form-select" name="status" value={editForm.status} onChange={handleEditChange}>
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="edit_amp" name="has_amplifier" checked={editForm.has_amplifier} onChange={handleEditChange} />
                                                    <label className="form-check-label" htmlFor="edit_amp" style={{ color: '#e8e8f0' }}>Has Amplifier</label>
                                                </div>
                                            </div>
                                            {editForm.has_amplifier && <>
                                                <div className="col-md-6">
                                                    <label className="form-label">Alternate Mobile</label>
                                                    <input className="form-control" name="alternate_mobile" value={editForm.alternate_mobile || ''} onChange={handleEditChange} maxLength={10} />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">Full Address</label>
                                                    <textarea className="form-control" name="full_address" value={editForm.full_address || ''} onChange={handleEditChange} rows={2} />
                                                </div>
                                            </>}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn" onClick={() => setEditModal(false)} style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 8 }}>Cancel</button>
                                        <button type="submit" className="btn-primary-custom" disabled={editLoading}>
                                            {editLoading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : '💾 Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Delete Confirm Modal ──────────────────────── */}
                {deleteModal && deleteTarget && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setDeleteModal(false)}>
                        <div className="modal-dialog" onClick={e => e.stopPropagation()}>
                            <div className="modal-content modal-dark">
                                <div className="modal-header">
                                    <h5 className="modal-title" style={{ color: '#e94560' }}>🗑️ Delete Customer</h5>
                                    <button className="btn-close" onClick={() => setDeleteModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong> (STB: <code style={{ color: '#f5a623' }}>{deleteTarget.stb_number}</code>)?</p>
                                    <p style={{ color: '#e94560', fontSize: '0.85rem' }}>⚠️ This action cannot be undone.</p>
                                </div>
                                <div className="modal-footer">
                                    <button onClick={() => setDeleteModal(false)} className="btn" style={{ color: '#8890a6', background: 'rgba(30,45,80,0.5)', border: '1px solid rgba(30,45,80,0.8)', borderRadius: 8 }}>Cancel</button>
                                    <button onClick={confirmDelete} className="btn" style={{ background: 'rgba(233,69,96,0.2)', color: '#e94560', border: '1px solid rgba(233,69,96,0.4)', borderRadius: 8, fontWeight: 600 }}>🗑️ Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoxList;
