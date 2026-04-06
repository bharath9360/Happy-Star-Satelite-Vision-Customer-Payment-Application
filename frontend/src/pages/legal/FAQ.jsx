import { useState, useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import api from '../../api/axios';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/faq')
      .then(({ data }) => setFaqs(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = faqs.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const CATEGORIES = [
    { icon: '💳', label: 'Payments', keywords: ['payment', 'pay', 'razorpay', 'upi', 'card'] },
    { icon: '📺', label: 'Subscription', keywords: ['recharge', 'plan', 'month', 'subscription'] },
    { icon: '🔑', label: 'STB / Box', keywords: ['stb', 'box', 'number', 'registered'] },
    { icon: '🔄', label: 'Refunds', keywords: ['refund', 'fail', 'debit'] },
  ];

  return (
    <LegalLayout
      title="Frequently Asked Questions"
      subtitle="Find answers to the most common questions about cable TV recharges, payments, and our service."
      icon="❓"
    >
      {/* Search */}
      <div className="mb-4 fade-in-up">
        <div style={{ position: 'relative' }}>
          <input
            className="form-control"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search questions..."
            style={{ paddingLeft: '1rem', fontSize: '0.95rem', borderRadius: 14 }}
          />
        </div>
      </div>

      {/* Category pills */}
      {!search && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }} className="fade-in-up">
          {CATEGORIES.map(({ icon, label, keywords }) => (
            <button key={label}
              onClick={() => setSearch(keywords[0])}
              style={{
                background: 'rgba(30,45,80,0.7)', border: '1px solid rgba(30,45,80,0.9)',
                color: '#c0c6d8', borderRadius: 20, padding: '6px 16px', fontSize: '0.83rem',
                cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,69,96,0.15)'; e.currentTarget.style.borderColor = 'rgba(233,69,96,0.4)'; e.currentTarget.style.color = '#e94560'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,45,80,0.7)'; e.currentTarget.style.borderColor = 'rgba(30,45,80,0.9)'; e.currentTarget.style.color = '#c0c6d8'; }}
            >
              {icon} {label}
            </button>
          ))}
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.4)', color: '#e94560', borderRadius: 20, padding: '6px 16px', fontSize: '0.83rem', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Clear filter
            </button>
          )}
        </div>
      )}
      {search && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#8890a6', fontSize: '0.85rem' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</span>
          <button onClick={() => setSearch('')} style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', color: '#e94560', borderRadius: 8, padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>Clear ✕</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><span className="spinner-border" style={{ color: '#e94560' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-5 text-center fade-in-up" style={{ borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤔</div>
          <p style={{ fontWeight: 700, color: '#e8e8f0', marginBottom: 8 }}>No results found</p>
          <p style={{ color: '#8890a6', fontSize: '0.9rem', marginBottom: 16 }}>Try a different search term or browse by category above.</p>
          <a href="/contact" style={{ textDecoration: 'none', background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.35)', color: '#e94560', borderRadius: 10, padding: '8px 20px', fontWeight: 600, fontSize: '0.88rem' }}>
            📞 Ask Us Directly
          </a>
        </div>
      ) : (
        <div className="fade-in-up">
          {filtered.map((faq, i) => (
            <div
              key={faq.id}
              className="glass-card mb-3"
              style={{ borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  padding: '1.1rem 1.3rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', gap: 12, textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    background: openId === faq.id ? 'rgba(233,69,96,0.2)' : 'rgba(30,45,80,0.6)',
                    border: `1px solid ${openId === faq.id ? 'rgba(233,69,96,0.4)' : 'rgba(30,45,80,0.8)'}`,
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.75rem',
                    color: openId === faq.id ? '#e94560' : '#8890a6',
                  }}>{String(i + 1).padStart(2, '0')}</div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: openId === faq.id ? '#e8e8f0' : '#c0c6d8', lineHeight: 1.4 }}>
                    {faq.question}
                  </span>
                </div>
                <div style={{
                  width: 28, height: 28, flexShrink: 0,
                  background: openId === faq.id ? 'rgba(233,69,96,0.15)' : 'rgba(30,45,80,0.5)',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: openId === faq.id ? '#e94560' : '#8890a6',
                  transition: 'all 0.2s', fontSize: 14,
                  transform: openId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>▼</div>
              </button>
              {openId === faq.id && (
                <div style={{ padding: '0 1.3rem 1.2rem 1.3rem', borderTop: '1px solid rgba(30,45,80,0.4)' }}>
                  <p style={{ color: '#8890a6', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 0, paddingTop: 14 }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Still need help CTA */}
      <div className="glass-card p-4 mt-4 fade-in-up text-center" style={{ borderRadius: 16 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
        <h3 style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '1rem', marginBottom: 8 }}>Still have questions?</h3>
        <p style={{ color: '#8890a6', fontSize: '0.88rem', marginBottom: 16 }}>Our support team is available Monday–Saturday, 10 AM to 6 PM IST.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="tel:9751775472" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.35)', color: '#e94560', borderRadius: 10, padding: '8px 18px', fontWeight: 600, fontSize: '0.88rem' }}>📞 Call Us</a>
          <a href="/contact" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.35)', color: '#4facfe', borderRadius: 10, padding: '8px 18px', fontWeight: 600, fontSize: '0.88rem' }}>✉️ Contact Form</a>
        </div>
      </div>
    </LegalLayout>
  );
};

export default FAQ;
