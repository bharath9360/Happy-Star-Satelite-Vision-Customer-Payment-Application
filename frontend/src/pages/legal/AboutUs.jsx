import { useState, useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import api from '../../api/axios';

const AboutUs = () => {
  const [customContent, setCustomContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/page/about')
      .then(({ data }) => setCustomContent(data?.content || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const VALUES = [
    { icon: '🤝', title: 'Trust', desc: 'We operate with full transparency. Every transaction is verifiable and every policy is clearly stated.', color: '#28e07e' },
    { icon: '⚡', title: 'Speed', desc: 'Recharge your cable subscription in under 2 minutes from anywhere — no office visit required.', color: '#f5a623' },
    { icon: '🔒', title: 'Security', desc: 'Your data is protected with industry-grade encryption. Payments handled exclusively by Razorpay.', color: '#e94560' },
    { icon: '💡', title: 'Innovation', desc: 'Modern technology for small-town cable TV operations — bringing digital transformation to every home.', color: '#4facfe' },
  ];

  const STATS = [
    { value: '1000+', label: 'Customers Served', icon: '👥' },
    { value: '5000+', label: 'Recharges Processed', icon: '🔄' },
    { value: '₹0', label: 'Data Breaches', icon: '🛡️' },
    { value: '99.9%', label: 'Payment Success Rate', icon: '✅' },
  ];

  return (
    <LegalLayout
      title="About Us"
      subtitle="Learn about Happy Star Satellite Vision — our mission, our story, and our commitment to making cable TV recharges simple, secure, and transparent."
      icon="📘"
    >
      {/* Hero Statement */}
      <div className="glass-card p-5 mb-4 fade-in-up text-center" style={{ borderRadius: 20 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📡</div>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', background: 'linear-gradient(135deg, #e94560, #f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>
          Happy Star Satellite Vision
        </h2>
        <p style={{ color: '#c0c6d8', fontSize: '1rem', lineHeight: 1.8, maxWidth: 620, margin: '0 auto' }}>
          A trusted cable TV operator serving thousands of homes across Tamil Nadu.
          We combine decades of local expertise with modern digital technology to make
          your cable subscription management simple, fast, and worry-free.
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
          {/* Stats Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {STATS.map(({ value, label, icon }) => (
              <div key={label} className="glass-card fade-in-up" style={{ borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.6rem', background: 'linear-gradient(135deg, #e94560, #f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
                <div style={{ color: '#8890a6', fontSize: '0.8rem', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Mission & Vision */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
            {[
              { icon: '🎯', title: 'Our Mission', color: '#e94560', body: 'To provide the most convenient and reliable cable TV recharge experience for every household in Tamil Nadu — fast payments, verified subscriptions, zero hassle.' },
              { icon: '🌟', title: 'Our Vision', color: '#f5a623', body: 'To become the leading digital-first cable TV operator in regional India by building trust through technology, transparency, and exceptional customer service.' },
            ].map(({ icon, title, color, body }) => (
              <div key={title} className="glass-card p-4 fade-in-up" style={{ borderRadius: 16 }}>
                <div style={{ width: 48, height: 48, background: `${color}18`, border: `1px solid ${color}35`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontWeight: 700, color: color, fontSize: '1.05rem', marginBottom: 10 }}>{title}</h3>
                <p style={{ color: '#c0c6d8', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 0 }}>{body}</p>
              </div>
            ))}
          </div>

          {/* Core Values */}
          <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e8e8f0', marginBottom: 20 }}>💎 Core Values</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {VALUES.map(({ icon, title, desc, color }) => (
                <div key={title} style={{ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 12, padding: '1.2rem' }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
                  <h4 style={{ fontWeight: 700, color, fontSize: '0.95rem', marginBottom: 8 }}>{title}</h4>
                  <p style={{ color: '#8890a6', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What We Offer */}
          <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e8e8f0', marginBottom: 16 }}>🛠️ What We Offer</h2>
            {[
              ['Online Cable TV Recharge', 'Recharge your subscription anytime, anywhere — no physical visit required.'],
              ['Multiple Subscription Plans', '1-month, 6-month, and 1-year plans with bonus free months on longer subscriptions.'],
              ['Amplifier Customer Support', 'Special pricing and dedicated support for amplifier-connected customers.'],
              ['Razorpay-Powered Payments', 'UPI, cards, netbanking, and wallet support — all secured by Razorpay.'],
              ['Instant STB Verification', 'Real-time validation of your Cable ID before any payment is processed.'],
              ['Admin Dashboard', 'Full-featured admin panel for managing customers, payments, and statistics.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, background: '#e94560', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <span style={{ fontWeight: 600, color: '#e8e8f0', fontSize: '0.9rem' }}>{title}: </span>
                  <span style={{ color: '#8890a6', fontSize: '0.88rem' }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="fade-in-up text-center" style={{ background: 'rgba(233,69,96,0.07)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 16, padding: '2rem' }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>📞</div>
            <h3 style={{ fontWeight: 700, color: '#e8e8f0', marginBottom: 8 }}>Get in Touch</h3>
            <p style={{ color: '#8890a6', fontSize: '0.9rem', marginBottom: 16 }}>
              Have questions about our service? We're here to help.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tel:9751775472" className="btn-primary-custom" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                📞 Call 9751775472
              </a>
              <a href="/contact" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.35)', color: '#4facfe', borderRadius: 10, padding: '0.65rem 1.5rem', fontWeight: 600 }}>
                ✉️ Send a Message
              </a>
            </div>
          </div>
        </>
      )}
    </LegalLayout>
  );
};

export default AboutUs;
