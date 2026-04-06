import { useState, useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import api from '../../api/axios';

const Rule = ({ num, title, body }) => (
  <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
    <div style={{ width: 30, height: 30, flexShrink: 0, background: 'rgba(233,69,96,0.2)', border: '1px solid rgba(233,69,96,0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', color: '#e94560', marginTop: 1 }}>{num}</div>
    <div>
      <p style={{ fontWeight: 600, color: '#e8e8f0', marginBottom: 4, fontSize: '0.92rem' }}>{title}</p>
      <p style={{ color: '#8890a6', marginBottom: 0, fontSize: '0.88rem', lineHeight: 1.65 }}>{body}</p>
    </div>
  </div>
);

const Section = ({ icon, title, children }) => (
  <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
    <div className="d-flex align-items-center gap-3 mb-3">
      <div style={{ width: 42, height: 42, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ color: '#c0c6d8', fontSize: '0.92rem', lineHeight: 1.78 }}>{children}</div>
  </div>
);

const TermsAndConditions = () => {
  const [customContent, setCustomContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/page/terms')
      .then(({ data }) => setCustomContent(data?.content || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using the Happy Star Satellite Vision cable recharge platform. By proceeding with payment, you agree to all terms below."
      icon="📜"
    >
      {/* Acceptance banner */}
      <div className="mb-4 fade-in-up" style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 14, padding: '1.2rem 1.5rem', display: 'flex', gap: 14 }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>📌</div>
        <div>
          <p style={{ fontWeight: 700, color: '#f5a623', marginBottom: 4 }}>Acceptance of Terms</p>
          <p style={{ color: '#8890a6', fontSize: '0.88rem', margin: 0 }}>
            By accessing or using this platform, you confirm you are 18+ years old and have authority to accept these terms.
            If you disagree, please do not use this service.
          </p>
        </div>
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
          <Section icon="📡" title="1. Platform Role & Service Description">
            <p>Happy Star Satellite Vision is a <strong style={{ color: '#e8e8f0' }}>cable TV subscription facilitator</strong>. This platform allows customers to verify their STB/Box number, select a plan, and pay via Razorpay's secure gateway. We do not provide streaming or satellite hardware.</p>
          </Section>

          <Section icon="📋" title="2. Service Usage Terms">
            <Rule num="2.1" title="Accurate Information" body="You are solely responsible for entering correct details including your name, mobile number, and Cable Connection ID. The platform validates your STB number against our registered database before allowing payment." />
            <Rule num="2.2" title="Wrong Cable ID Entries" body="If payment is made using an incorrect Cable ID not registered to your account, the platform is not liable for any service disruption or loss. No refunds will be issued." />
            <Rule num="2.3" title="Eligibility" body="Only customers registered with Happy Star Satellite Vision may use this platform. New customers must contact our office to register first." />
            <Rule num="2.4" title="One Transaction Per Session" body="Each session covers one recharge. For multiple connections, initiate separate sessions or contact our support." />
          </Section>

          <Section icon="🚫" title="3. Prohibited Activities">
            <ul style={{ paddingLeft: '1.2rem', marginBottom: 0 }}>
              {['Attempt to access or modify backend systems', 'Submit false STB numbers to test or exploit the system', 'Use bots or automated tools to interact with the platform', 'Impersonate another customer to make payments', 'Circumvent payment validation or exploit pricing logic'].map(item => (
                <li key={item} className="mb-2">{item}</li>
              ))}
            </ul>
          </Section>

          <Section icon="⚖️" title="4. Limitation of Liability">
            <div style={{ background: 'rgba(233,69,96,0.07)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 12, padding: '1rem', marginBottom: 16 }}>
              <p style={{ color: '#e94560', fontWeight: 700, marginBottom: 6 }}>⚠️ Important Disclaimer</p>
              <p style={{ color: '#c0c6d8', fontSize: '0.88rem', marginBottom: 0 }}>
                Happy Star Satellite Vision is not liable for payment failures caused by bank server downtime, poor internet, or Razorpay outages.
                Debited amounts in such cases will be refunded per our <a href="/refund-policy" style={{ color: '#e94560', textDecoration: 'none', fontWeight: 600 }}>Refund Policy</a>.
              </p>
            </div>
            <Rule num="4.1" title="Service Interruptions" body="We do not guarantee uninterrupted platform access and are not liable for losses from downtime or maintenance." />
            <Rule num="4.2" title="Maximum Liability" body="Our total liability for any claim shall not exceed the amount paid in the most recent transaction." />
          </Section>

          <Section icon="🏛️" title="5. Governing Law">
            <p style={{ marginBottom: 0 }}>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in Tamil Nadu, India.</p>
          </Section>

          <Section icon="📝" title="6. Modifications">
            <p style={{ marginBottom: 0 }}>We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of revised terms.</p>
          </Section>
        </>
      )}
    </LegalLayout>
  );
};

export default TermsAndConditions;
