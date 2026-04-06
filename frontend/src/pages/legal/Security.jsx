import { useState, useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import api from '../../api/axios';

const Security = () => {
  const [customContent, setCustomContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/page/security')
      .then(({ data }) => setCustomContent(data?.content || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const FEATURES = [
    {
      icon: '💳', title: 'Razorpay Payment Security', color: '#e94560',
      points: ['PCI-DSS Level 1 certified — the highest standard for payment security', 'RBI regulated payment aggregator', '3D Secure authentication for all card transactions', 'Your payment data is never transmitted to or stored on our servers'],
    },
    {
      icon: '🔒', title: 'No Storage of Financial Data', color: '#28e07e',
      points: ['We NEVER store card numbers, CVV, expiry dates, or bank account details', 'UPI credentials are never seen or stored by our platform', 'Razorpay handles all tokenization and secure storage', 'Our database contains only: name, phone, cable ID, and payment confirmation IDs'],
    },
    {
      icon: '🌐', title: 'Encrypted Communication (HTTPS)', color: '#4facfe',
      points: ['All data between your browser and our servers is encrypted via TLS 1.2/1.3', '256-bit AES encryption for all data at rest', 'HTTPS enforced on all pages — no HTTP fallback allowed', 'Secure WebSocket connections for real-time features'],
    },
    {
      icon: '🚨', title: 'Fraud Prevention', color: '#f5a623',
      points: ['STB/Box Number verification before every payment — preventing unauthorized recharges', 'JWT-based admin authentication with session expiry', 'Rate limiting on all API endpoints to prevent brute force', 'Razorpay\'s built-in fraud detection and risk scoring'],
    },
    {
      icon: '🛡️', title: 'Data Privacy & Compliance', color: '#28e07e',
      points: ['Minimal data collection — we only ask for what\'s strictly necessary', 'No sharing of personal data with third-party marketers', 'Customer data accessible only to authorized admins', 'Right to access, correct, and delete your data upon request'],
    },
    {
      icon: '🔑', title: 'Admin Access Controls', color: '#e94560',
      points: ['All admin routes protected by JWT bearer tokens', 'bcrypt-hashed admin passwords — never stored as plain text', 'Session tokens expire automatically after inactivity', 'Audit trail of all payment and configuration changes'],
    },
  ];

  return (
    <LegalLayout
      title="Security"
      subtitle="Your security is our top priority. Every aspect of this platform is designed to protect your personal data and payment information."
      icon="🔐"
    >
      {/* Trust Score Banner */}
      <div className="glass-card p-4 mb-4 fade-in-up text-center" style={{ borderRadius: 18, background: 'linear-gradient(135deg, rgba(40,224,126,0.08), rgba(79,172,254,0.08))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { label: 'PCI-DSS\nLevel 1', icon: '🔐', color: '#28e07e' },
            { label: 'RBI\nRegulated', icon: '🏦', color: '#4facfe' },
            { label: '256-bit\nSSL/TLS', icon: '🔒', color: '#f5a623' },
            { label: '3D Secure\nAuth', icon: '✅', color: '#e94560' },
            { label: 'Zero Data\nBreach', icon: '🛡️', color: '#28e07e' },
          ].map(({ label, icon, color }) => (
            <div key={label} style={{ textAlign: 'center', minWidth: 90 }}>
              <div style={{ width: 56, height: 56, background: `${color}15`, border: `2px solid ${color}40`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 8px' }}>{icon}</div>
              <div style={{ fontSize: '0.72rem', color, fontWeight: 700, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{label}</div>
            </div>
          ))}
        </div>
        <p style={{ color: '#8890a6', fontSize: '0.85rem', margin: 0 }}>
          Happy Star Satellite Vision meets and exceeds industry security standards for online payment platforms.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-4"><span className="spinner-border" style={{ color: '#e94560' }} /></div>
      ) : customContent ? (
        <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
          <div style={{ color: '#c0c6d8', fontSize: '0.92rem', lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: customContent }} />
        </div>
      ) : (
        <>
          {/* Security Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
            {FEATURES.map(({ icon, title, color, points }) => (
              <div key={title} className="glass-card p-4 fade-in-up" style={{ borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, background: `${color}18`, border: `1px solid ${color}35`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e8e8f0', margin: 0, lineHeight: 1.3 }}>{title}</h3>
                </div>
                <ul style={{ paddingLeft: '1rem', marginBottom: 0 }}>
                  {points.map(pt => (
                    <li key={pt} style={{ color: '#8890a6', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: 6 }}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* What you should do */}
          <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', marginBottom: 16 }}>👤 Your Role in Staying Secure</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {[
                { icon: '✅', tip: 'Always verify your STB Number before making payment to avoid wrong recharges.' },
                { icon: '✅', tip: 'Only use this platform on trusted networks — avoid public Wi-Fi for payments.' },
                { icon: '✅', tip: 'Never share your UPI PIN, card CVV, or OTP with anyone — including our staff.' },
                { icon: '✅', tip: 'Report suspicious activity immediately by calling 9751775472.' },
              ].map(({ icon, tip }) => (
                <div key={tip} style={{ display: 'flex', gap: 10, background: 'rgba(40,224,126,0.06)', border: '1px solid rgba(40,224,126,0.2)', borderRadius: 12, padding: '0.9rem' }}>
                  <span style={{ color: '#28e07e', flexShrink: 0, marginTop: 2 }}>{icon}</span>
                  <span style={{ color: '#8890a6', fontSize: '0.85rem', lineHeight: 1.6 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report Security Issue */}
          <div className="fade-in-up" style={{ background: 'rgba(233,69,96,0.06)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🚨</div>
            <h3 style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '1rem', marginBottom: 8 }}>Report a Security Issue</h3>
            <p style={{ color: '#8890a6', fontSize: '0.88rem', marginBottom: 16 }}>
              Found a vulnerability or suspicious activity? Please report it immediately.
            </p>
            <a href="mailto:bharathkkbharath3@gmail.com?subject=Security Issue Report" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #e94560, #c73652)', color: '#fff', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              🔐 Report to Developer
            </a>
          </div>
        </>
      )}
    </LegalLayout>
  );
};

export default Security;
