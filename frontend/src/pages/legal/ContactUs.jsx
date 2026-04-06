import { useState, useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import api from '../../api/axios';

const DEFAULT_CONTACT = {
  cable_phone:   '9751775472',
  cable_email:   'happystar88793@gmail.com',
  website_phone: '9360294463',
  website_email: 'bharathkkbharath3@gmail.com',
  working_hours: '10 AM – 6 PM',
};

const ContactCard = ({ icon, label, type, value, href, color }) => (
  <a href={href} style={{
    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14,
    padding: '1rem 1.2rem', background: 'rgba(15,15,26,0.6)',
    border: `1px solid ${color}28`, borderRadius: 14, marginBottom: 12,
    transition: 'all 0.25s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.transform = 'translateX(4px)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,15,26,0.6)'; e.currentTarget.style.transform = 'translateX(0)'; }}
  >
    <div style={{ width: 42, height: 42, background: `${color}18`, border: `1px solid ${color}35`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.7rem', color: '#8890a6', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label} · {type}</div>
      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#e8e8f0' }}>{value}</div>
    </div>
    <div style={{ color, fontSize: 18 }}>→</div>
  </a>
);

const ContactUs = () => {
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT);
  const [form, setForm] = useState({ name: '', phone: '', query: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    api.get('/api/contact')
      .then(({ data }) => { if (data) setContactInfo({ ...DEFAULT_CONTACT, ...data }); })
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.query.trim().length < 10) errs.query = 'Please describe your query (at least 10 characters).';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.post('/api/contact/enquiry', form);
      setSubmitted(true);
      setForm({ name: '', phone: '', query: '' });
    } catch {
      setSubmitError('Something went wrong. Please call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactCards = [
    { icon: '📞', label: 'Cable Enquiry', type: 'Phone', value: contactInfo.cable_phone, href: `tel:${contactInfo.cable_phone}`, color: '#e94560' },
    { icon: '✉️', label: 'Cable Enquiry', type: 'Email', value: contactInfo.cable_email, href: `mailto:${contactInfo.cable_email}`, color: '#e94560' },
    { icon: '💻', label: 'Website Enquiry', type: 'Phone', value: contactInfo.website_phone, href: `tel:${contactInfo.website_phone}`, color: '#4facfe' },
    { icon: '📧', label: 'Website Enquiry', type: 'Email', value: contactInfo.website_email, href: `mailto:${contactInfo.website_email}`, color: '#4facfe' },
  ];

  return (
    <LegalLayout
      title="Contact Us"
      subtitle="Have a question about your cable subscription, payment, or a technical issue? We're here to help during business hours."
      icon="📞"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

        {/* ── LEFT: Contact Form ─────────────────────────── */}
        <div className="glass-card p-4 fade-in-up" style={{ borderRadius: 18 }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <div style={{ width: 42, height: 42, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✍️</div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>Send Us a Message</h2>
              <p style={{ color: '#8890a6', fontSize: '0.78rem', margin: 0 }}>We'll respond within 1–2 business days</p>
            </div>
          </div>

          {submitted ? (
            <div className="fade-in-up text-center" style={{ background: 'rgba(40,224,126,0.08)', border: '1px solid rgba(40,224,126,0.3)', borderRadius: 12, padding: '2rem 1rem' }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
              <p style={{ fontWeight: 700, color: '#28e07e', marginBottom: 6 }}>Message Sent!</p>
              <p style={{ color: '#8890a6', fontSize: '0.88rem', marginBottom: 16 }}>Thank you! Our team will get back to you within 1–2 business days.</p>
              <button onClick={() => setSubmitted(false)} style={{ background: 'rgba(40,224,126,0.15)', border: '1px solid rgba(40,224,126,0.35)', color: '#28e07e', borderRadius: 8, padding: '6px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                Send Another →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {submitError && (
                <div style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: 16, color: '#e94560', fontSize: '0.85rem' }}>
                  ⚠️ {submitError}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label" htmlFor="contact-name">Full Name *</label>
                <input id="contact-name" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
                {errors.name && <div style={{ color: '#e94560', fontSize: '0.78rem', marginTop: 4 }}>⚠️ {errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="contact-phone">Phone Number *</label>
                <input id="contact-phone" className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} inputMode="numeric" />
                {errors.phone && <div style={{ color: '#e94560', fontSize: '0.78rem', marginTop: 4 }}>⚠️ {errors.phone}</div>}
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="contact-query">Your Query *</label>
                <textarea id="contact-query" className="form-control" name="query" value={form.query} onChange={handleChange} placeholder="Describe your issue or question..." rows={5} style={{ resize: 'vertical', minHeight: 110 }} />
                {errors.query && <div style={{ color: '#e94560', fontSize: '0.78rem', marginTop: 4 }}>⚠️ {errors.query}</div>}
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#8890a6', marginTop: 4 }}>{form.query.length} chars</div>
              </div>
              <button type="submit" className="btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2" disabled={submitting}>
                {submitting ? <><span className="spinner-border spinner-border-sm" /> Sending...</> : <>📨 Send Message</>}
              </button>
            </form>
          )}
        </div>

        {/* ── RIGHT: Contact Info ────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Contact Cards */}
          <div className="glass-card p-4 fade-in-up" style={{ borderRadius: 18 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div style={{ width: 42, height: 42, background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📇</div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>Get In Touch</h2>
                <p style={{ color: '#8890a6', fontSize: '0.78rem', margin: 0 }}>Multiple ways to reach us</p>
              </div>
            </div>
            {contactCards.map(card => <ContactCard key={card.href} {...card} />)}
          </div>

          {/* Operating Hours */}
          <div className="glass-card p-4 fade-in-up" style={{ borderRadius: 18 }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 42, height: 42, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🕐</div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>Operating Hours</h2>
                <p style={{ color: '#8890a6', fontSize: '0.78rem', margin: 0 }}>Monday–Saturday</p>
              </div>
            </div>
            <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>☀️</div>
              <div style={{ fontWeight: 800, fontSize: '1.6rem', color: '#f5a623' }}>{contactInfo.working_hours}</div>
              <div style={{ color: '#8890a6', fontSize: '0.8rem', marginTop: 4 }}>Monday to Saturday (IST)</div>
            </div>
            <p style={{ color: '#8890a6', fontSize: '0.8rem', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
              Queries outside business hours will be addressed the next working day.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Help Topics */}
      <div className="glass-card p-4 mt-4 fade-in-up" style={{ borderRadius: 18, textAlign: 'center' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#e8e8f0', marginBottom: 8 }}>⚡ Quick Help Topics</h3>
        <p style={{ color: '#8890a6', fontSize: '0.88rem', marginBottom: 20 }}>Common issues we can help with:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {[['🔑','STB Number not found'],['💳','Payment deducted, not confirmed'],['📺','Channels not restored'],['🔄','Refund status enquiry'],['📦','New connection request'],['🔧','Technical signal issue']].map(([ico, txt]) => (
            <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(30,45,80,0.7)', border: '1px solid rgba(30,45,80,0.9)', borderRadius: 20, padding: '6px 14px', fontSize: '0.82rem', color: '#c0c6d8' }}>
              <span>{ico}</span><span>{txt}</span>
            </div>
          ))}
        </div>
      </div>
    </LegalLayout>
  );
};

export default ContactUs;
