import { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import api from '../../api/axios';

/* ── Tiny reusable alert ──────────────────────────────────────────── */
const Alert = ({ msg, type = 'success', onClose }) => {
  if (!msg) return null;
  const styles = {
    success: { bg: 'rgba(40,224,126,0.1)', border: 'rgba(40,224,126,0.3)', color: '#28e07e' },
    error:   { bg: 'rgba(233,69,96,0.1)',  border: 'rgba(233,69,96,0.3)',  color: '#e94560' },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', fontWeight: 600 }}>
      <span>{type === 'success' ? '✅' : '⚠️'} {msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: s.color, cursor: 'pointer', fontSize: 18 }}>×</button>
    </div>
  );
};

/* ── Tab: Page Content Editor ─────────────────────────────────────── */
const PAGES = [
  { key: 'privacy',  label: '🔒 Privacy Policy' },
  { key: 'terms',    label: '📜 Terms & Conditions' },
  { key: 'refund',   label: '💰 Refund Policy' },
  { key: 'about',    label: '📘 About Us' },
  { key: 'security', label: '🔐 Security' },
];

const PageContentTab = () => {
  const [selectedPage, setSelectedPage] = useState('privacy');
  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [alert, setAlert]       = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/page/${selectedPage}`)
      .then(({ data }) => setContent(data?.content || ''))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, [selectedPage]);

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await api.put(`/api/page/${selectedPage}`, { content });
      setAlert({ msg: `"${PAGES.find(p => p.key === selectedPage)?.label}" saved successfully.`, type: 'success' });
    } catch {
      setAlert({ msg: 'Failed to save. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p style={{ color: '#8890a6', fontSize: '0.88rem', marginBottom: 20 }}>
        Edit the content for each public legal page. Use plain text or basic HTML. Leave empty to show the default static content.
        <a href="https://htmlpreview.github.io/" target="_blank" rel="noopener noreferrer" style={{ color: '#4facfe', marginLeft: 6, fontSize: '0.82rem' }}>Preview HTML ↗</a>
      </p>

      {alert && <Alert msg={alert.msg} type={alert.type} onClose={() => setAlert(null)} />}

      {/* Page selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {PAGES.map(({ key, label }) => (
          <button key={key} onClick={() => setSelectedPage(key)} style={{
            padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
            background: selectedPage === key ? 'rgba(233,69,96,0.2)' : 'rgba(30,45,80,0.5)',
            border: `1px solid ${selectedPage === key ? 'rgba(233,69,96,0.45)' : 'rgba(30,45,80,0.8)'}`,
            color: selectedPage === key ? '#e94560' : '#8890a6',
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,15,26,0.6)', borderRadius: 14, zIndex: 2 }}>
            <span className="spinner-border" style={{ color: '#e94560' }} />
          </div>
        )}
        <textarea
          className="form-control"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={18}
          placeholder="Enter page content here (plain text or HTML)..."
          style={{ fontFamily: 'monospace', fontSize: '0.88rem', resize: 'vertical', borderRadius: 14, lineHeight: 1.65 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary-custom d-flex align-items-center gap-2">
          {saving ? <><span className="spinner-border spinner-border-sm" /> Saving...</> : '💾 Save Changes'}
        </button>
        <button onClick={() => setContent('')} style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', color: '#f5a623', borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
          Reset to Static Default
        </button>
        <a href={`/${selectedPage === 'privacy' ? 'privacy-policy' : selectedPage === 'terms' ? 'terms' : selectedPage === 'refund' ? 'refund-policy' : selectedPage}`} target="_blank" rel="noopener noreferrer"
          style={{ color: '#4facfe', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
          🔗 View Live Page ↗
        </a>
      </div>
    </div>
  );
};

/* ── Tab: FAQ Management ──────────────────────────────────────────── */
const FAQTab = () => {
  const [faqs, setFaqs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState({ question: '', answer: '', sort_order: 0 });
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [alert, setAlert]       = useState(null);
  const [showAdd, setShowAdd]   = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/faq')
      .then(({ data }) => setFaqs(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (faq) => {
    setEditId(faq.id);
    setForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order });
    setShowAdd(false);
  };

  const startAdd = () => {
    setShowAdd(true);
    setEditId(null);
    setForm({ question: '', answer: '', sort_order: faqs.length + 1 });
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) return;
    setSaving(true);
    setAlert(null);
    try {
      if (editId) {
        await api.put(`/api/faq/${editId}`, form);
        setAlert({ msg: 'FAQ updated successfully.', type: 'success' });
        setEditId(null);
      } else {
        await api.post('/api/faq', form);
        setAlert({ msg: 'FAQ added successfully.', type: 'success' });
        setShowAdd(false);
      }
      load();
    } catch {
      setAlert({ msg: 'Failed to save FAQ.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/faq/${id}`);
      setAlert({ msg: 'FAQ deleted.', type: 'success' });
      load();
    } catch {
      setAlert({ msg: 'Failed to delete FAQ.', type: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const FormPanel = () => (
    <div className="glass-card p-4 mb-4" style={{ borderRadius: 14, border: '1px solid rgba(233,69,96,0.3)' }}>
      <h4 style={{ fontWeight: 700, color: '#e8e8f0', marginBottom: 16, fontSize: '0.95rem' }}>
        {editId ? '✏️ Edit FAQ' : '➕ Add New FAQ'}
      </h4>
      <div className="mb-3">
        <label className="form-label">Question *</label>
        <input className="form-control" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="Enter the question..." />
      </div>
      <div className="mb-3">
        <label className="form-label">Answer *</label>
        <textarea className="form-control" value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={4} placeholder="Enter the answer..." style={{ resize: 'vertical' }} />
      </div>
      <div className="mb-3" style={{ maxWidth: 140 }}>
        <label className="form-label">Sort Order</label>
        <input className="form-control" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} min={0} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleSave} disabled={saving || !form.question || !form.answer} className="btn-primary-custom d-flex align-items-center gap-2">
          {saving ? <><span className="spinner-border spinner-border-sm" /> Saving...</> : '💾 Save FAQ'}
        </button>
        <button onClick={() => { setEditId(null); setShowAdd(false); }} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#8890a6', borderRadius: 10, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {alert && <Alert msg={alert.msg} type={alert.type} onClose={() => setAlert(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: '#8890a6', fontSize: '0.88rem', margin: 0 }}>Manage the FAQ list shown on the public FAQ page.</p>
        <button onClick={startAdd} className="btn-primary-custom">➕ Add FAQ</button>
      </div>
      {(showAdd || editId) && <FormPanel />}
      {loading ? (
        <div className="text-center py-4"><span className="spinner-border" style={{ color: '#e94560' }} /></div>
      ) : faqs.length === 0 ? (
        <div className="glass-card p-4 text-center" style={{ borderRadius: 14, color: '#8890a6' }}>No FAQs yet. Click "Add FAQ" to create the first one.</div>
      ) : (
        faqs.map((faq, i) => (
          <div key={faq.id} className="glass-card p-3 mb-3 fade-in-up" style={{ borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ background: 'rgba(233,69,96,0.2)', color: '#e94560', fontWeight: 700, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 8 }}>#{i + 1}</span>
                  <span style={{ background: 'rgba(30,45,80,0.6)', color: '#8890a6', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 8 }}>order: {faq.sort_order}</span>
                </div>
                <p style={{ fontWeight: 600, color: '#e8e8f0', fontSize: '0.9rem', marginBottom: 4 }}>{faq.question}</p>
                <p style={{ color: '#8890a6', fontSize: '0.84rem', marginBottom: 0, lineHeight: 1.6 }}>{faq.answer}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(faq)} style={{ background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.3)', color: '#4facfe', borderRadius: 8, padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>✏️ Edit</button>
                <button onClick={() => handleDelete(faq.id)} disabled={deleting === faq.id} style={{ background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', color: '#e94560', borderRadius: 8, padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                  {deleting === faq.id ? '...' : '🗑️'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

/* ── Tab: Contact Info ────────────────────────────────────────────── */
const ContactTab = () => {
  const [form, setForm]     = useState({ cable_phone: '', cable_email: '', website_phone: '', website_email: '', working_hours: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [alert, setAlert]     = useState(null);

  useEffect(() => {
    api.get('/api/contact')
      .then(({ data }) => { if (data) setForm(f => ({ ...f, ...data })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await api.put('/api/contact', form);
      setAlert({ msg: 'Contact info updated successfully.', type: 'success' });
    } catch {
      setAlert({ msg: 'Failed to update contact info.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-4"><span className="spinner-border" style={{ color: '#e94560' }} /></div>;

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input className="form-control" type={type} name={name} value={form[name]} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} placeholder={placeholder} />
    </div>
  );

  return (
    <div>
      {alert && <Alert msg={alert.msg} type={alert.type} onClose={() => setAlert(null)} />}
      <p style={{ color: '#8890a6', fontSize: '0.88rem', marginBottom: 20 }}>
        Update the contact information displayed on the public Contact Us page.
      </p>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="glass-card p-4" style={{ borderRadius: 14 }}>
            <p style={{ fontWeight: 700, color: '#e94560', marginBottom: 14, fontSize: '0.9rem' }}>📡 Cable Enquiry</p>
            <Field label="Phone Number" name="cable_phone" placeholder="e.g. 9751775472" />
            <Field label="Email Address" name="cable_email" type="email" placeholder="e.g. happystar88793@gmail.com" />
          </div>
        </div>
        <div className="col-md-6">
          <div className="glass-card p-4" style={{ borderRadius: 14 }}>
            <p style={{ fontWeight: 700, color: '#4facfe', marginBottom: 14, fontSize: '0.9rem' }}>💻 Website Enquiry</p>
            <Field label="Phone Number" name="website_phone" placeholder="e.g. 9360294463" />
            <Field label="Email Address" name="website_email" type="email" placeholder="e.g. bharathkkbharath3@gmail.com" />
          </div>
        </div>
        <div className="col-12">
          <div className="glass-card p-4" style={{ borderRadius: 14 }}>
            <Field label="🕐 Operating Hours" name="working_hours" placeholder="e.g. 10 AM – 6 PM" />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary-custom d-flex align-items-center gap-2">
          {saving ? <><span className="spinner-border spinner-border-sm" /> Saving...</> : '💾 Save Contact Info'}
        </button>
      </div>
    </div>
  );
};

/* ── Tab: Logo Management ─────────────────────────────────────────── */
const LogoTab = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [alert, setAlert]     = useState(null);

  useEffect(() => {
    api.get('/api/site-settings/logo')
      .then(({ data }) => { const u = data?.logo_url || ''; setLogoUrl(u); setInput(u); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!input.trim()) return;
    setSaving(true);
    setAlert(null);
    try {
      await api.put('/api/site-settings/logo', { logo_url: input.trim() });
      setLogoUrl(input.trim());
      setAlert({ msg: 'Logo updated! It will appear in the header across all pages.', type: 'success' });
    } catch {
      setAlert({ msg: 'Failed to update logo.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-4"><span className="spinner-border" style={{ color: '#e94560' }} /></div>;

  return (
    <div>
      {alert && <Alert msg={alert.msg} type={alert.type} onClose={() => setAlert(null)} />}
      <p style={{ color: '#8890a6', fontSize: '0.88rem', marginBottom: 20 }}>
        Enter a public image URL for the company logo. It will appear in the header of all Legal & Support pages.
        Recommended: upload to <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" style={{ color: '#4facfe' }}>Cloudinary</a> and paste the URL below.
      </p>
      <div className="glass-card p-4 mb-4" style={{ borderRadius: 14 }}>
        {logoUrl && (
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <p style={{ color: '#8890a6', fontSize: '0.8rem', marginBottom: 10 }}>Current Logo Preview:</p>
            <img src={logoUrl} alt="Current logo" style={{ maxHeight: 80, maxWidth: 240, objectFit: 'contain', borderRadius: 12, border: '1px solid rgba(30,45,80,0.6)', padding: 8 }} onError={e => e.target.style.display = 'none'} />
          </div>
        )}
        <label className="form-label">Logo Image URL *</label>
        <input className="form-control mb-3" value={input} onChange={e => setInput(e.target.value)} placeholder="https://res.cloudinary.com/..." />
        {input && input !== logoUrl && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#8890a6', fontSize: '0.8rem', marginBottom: 8 }}>New Logo Preview:</p>
            <img src={input} alt="Preview" style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain', borderRadius: 10, border: '1px solid rgba(79,172,254,0.3)', padding: 6 }} onError={e => { e.target.alt = 'Image failed to load — check the URL'; }} />
          </div>
        )}
        <button onClick={handleSave} disabled={saving || !input.trim()} className="btn-primary-custom d-flex align-items-center gap-2">
          {saving ? <><span className="spinner-border spinner-border-sm" /> Saving...</> : '💾 Update Logo'}
        </button>
      </div>
    </div>
  );
};

/* ── Main Admin Page ──────────────────────────────────────────────── */
const TABS = [
  { key: 'pages',   label: '📄 Page Content', icon: '📄' },
  { key: 'faq',     label: '❓ FAQ Manager',   icon: '❓' },
  { key: 'contact', label: '📞 Contact Info',  icon: '📞' },
  { key: 'logo',    label: '🖼️ Logo',           icon: '🖼️' },
];

const LegalAdmin = () => {
  const [activeTab, setActiveTab] = useState('pages');

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-content">
        <div className="page-header mb-4">
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', background: 'linear-gradient(135deg, #e94560, #f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ⚖️ Legal & CMS Manager
          </h2>
          <p style={{ color: '#8890a6', margin: 0 }}>
            Manage public legal pages, FAQ content, contact information, and site logo.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: '8px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              background: activeTab === key ? 'linear-gradient(135deg, #e94560, #c73652)' : 'rgba(30,45,80,0.5)',
              border: `1px solid ${activeTab === key ? 'transparent' : 'rgba(30,45,80,0.8)'}`,
              color: activeTab === key ? '#fff' : '#8890a6',
              transition: 'all 0.2s',
              boxShadow: activeTab === key ? '0 4px 15px rgba(233,69,96,0.3)' : 'none',
            }}>{label}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass-card p-4" style={{ borderRadius: 18 }}>
          {activeTab === 'pages'   && <PageContentTab />}
          {activeTab === 'faq'     && <FAQTab />}
          {activeTab === 'contact' && <ContactTab />}
          {activeTab === 'logo'    && <LogoTab />}
        </div>
      </div>
    </div>
  );
};

export default LegalAdmin;
