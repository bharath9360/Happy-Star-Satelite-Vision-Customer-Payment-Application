import { useState, useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import api from '../../api/axios';

/* ── Static default content ───────────────────────────────────────── */
const STATIC_SECTIONS = [
  {
    icon: '✅', title: '1. Information We Collect', color: '#28e07e',
    body: 'We collect only the minimum data needed: Customer Name, Phone Number, Cable Connection ID (STB/Box Number), and Village. We do NOT store card numbers, bank details, CVV, or UPI credentials.',
  },
  {
    icon: '🎯', title: '2. How We Use Your Data', color: '#4facfe',
    body: 'Your data is used to validate your Cable ID, process your recharge through Razorpay, and maintain payment records for compliance. We do not sell, rent, or share your data with any third party for marketing.',
  },
  {
    icon: '🛡️', title: '3. Data Protection & Security', color: '#e94560',
    body: 'All data is transmitted over HTTPS/TLS. Payment data never passes through our servers — it goes directly to Razorpay\'s secure vault. Admin access is protected with hashed credentials and JWT session tokens.',
  },
  {
    icon: '💳', title: '4. Third-Party Services — Razorpay', color: '#f5a623',
    body: 'Payments are processed by Razorpay (PCI-DSS Level 1, RBI regulated, 256-bit SSL). We do not store any financial credentials. By using this platform you also agree to Razorpay\'s Privacy Policy.',
  },
  {
    icon: '👤', title: '5. Your Rights', color: '#28e07e',
    body: 'You have the right to access, correct, or request deletion of your data. To exercise these rights, email happystar88793@gmail.com.',
  },
  {
    icon: '📅', title: '6. Policy Changes', color: '#4facfe',
    body: 'We may update this Privacy Policy periodically. Continued use of the platform after any change constitutes acceptance of the updated policy.',
  },
];

const Section = ({ icon, title, body, color = '#e94560' }) => (
  <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
    <div className="d-flex align-items-center gap-3 mb-3">
      <div style={{
        width: 42, height: 42,
        background: `${color}18`,
        border: `1px solid ${color}35`,
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ color: '#c0c6d8', fontSize: '0.92rem', lineHeight: 1.8 }}
      dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, '<br/>') }}
    />
  </div>
);

const PrivacyPolicy = () => {
  const [customContent, setCustomContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/page/privacy')
      .then(({ data }) => setCustomContent(data?.content || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="We are committed to safeguarding your personal information. This policy explains what we collect, why we collect it, and how we protect it."
      icon="🔒"
    >
      {/* Trust banner */}
      <div className="mb-4 fade-in-up" style={{
        background: 'rgba(40,224,126,0.06)', border: '1px solid rgba(40,224,126,0.2)',
        borderRadius: 14, padding: '1.2rem 1.5rem', display: 'flex', gap: 14, alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>✅</div>
        <div>
          <p style={{ fontWeight: 700, color: '#28e07e', marginBottom: 4 }}>No Sensitive Financial Data Is Stored</p>
          <p style={{ color: '#8890a6', fontSize: '0.88rem', margin: 0 }}>
            All payment processing is handled exclusively by <strong style={{ color: '#e94560' }}>Razorpay</strong> (PCI-DSS certified).
            We never see or store your card number, CVV, bank account, or UPI credentials.
          </p>
        </div>
      </div>

      {/* Dynamic custom content from Admin CMS */}
      {loading ? (
        <div className="text-center py-4"><span className="spinner-border" style={{ color: '#e94560' }} /></div>
      ) : customContent ? (
        <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
          <div style={{ color: '#c0c6d8', fontSize: '0.92rem', lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: customContent }}
          />
        </div>
      ) : (
        <>
          {/* Data collected chips */}
          <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 42, height: 42, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>Data We Collect</h2>
            </div>
            {[
              ['Customer Name', '✓ Collected', '#28e07e'],
              ['Phone / Mobile Number', '✓ Collected', '#28e07e'],
              ['Cable Connection ID (STB/Box)', '✓ Collected', '#28e07e'],
              ['Village / City', '✓ Collected', '#28e07e'],
              ['Card / Bank Details', '✗ Never Stored', '#e94560'],
              ['UPI Credentials', '✗ Never Stored', '#e94560'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', background: 'rgba(15,15,26,0.5)', borderRadius: 10, marginBottom: 8, border: '1px solid rgba(30,45,80,0.6)' }}>
                <span style={{ color: '#8890a6', fontSize: '0.85rem' }}>{label}</span>
                <span style={{ background: `${color}18`, color, border: `1px solid ${color}33`, borderRadius: 6, padding: '2px 10px', fontWeight: 600, fontSize: '0.82rem' }}>{val}</span>
              </div>
            ))}
          </div>
          {STATIC_SECTIONS.map(s => <Section key={s.title} {...s} />)}
        </>
      )}

      {/* Razorpay badges */}
      <div className="glass-card p-4 mt-2 fade-in-up" style={{ borderRadius: 16 }}>
        <p style={{ fontWeight: 700, color: '#e8e8f0', marginBottom: 14, fontSize: '0.95rem' }}>🔐 Payment Security Standards</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {[['🔐','PCI-DSS Level 1'],['🏦','RBI Regulated'],['🔒','256-bit SSL'],['✅','3D Secure']].map(([ic, txt]) => (
            <div key={txt} style={{ textAlign: 'center', background: 'rgba(233,69,96,0.07)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 10, padding: '0.8rem', fontSize: '0.82rem', color: '#c0c6d8' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{ic}</div>{txt}
            </div>
          ))}
        </div>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
