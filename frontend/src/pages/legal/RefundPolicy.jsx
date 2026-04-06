import { useState, useEffect } from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import api from '../../api/axios';

const RefundPolicy = () => {
  const [customContent, setCustomContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/page/refund')
      .then(({ data }) => setCustomContent(data?.content || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      subtitle="We maintain a transparent and strict refund policy to protect both customers and the integrity of our cable service operations."
      icon="💰"
    >
      {/* Critical: No Refunds Banner */}
      <div className="mb-4 fade-in-up" style={{
        background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(233,69,96,0.05))',
        border: '2px solid rgba(233,69,96,0.45)', borderRadius: 16, padding: '1.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>🚫</div>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: '#e94560', marginBottom: 8 }}>
          No Refunds for Successful Recharges
        </h2>
        <p style={{ color: '#c0c6d8', maxWidth: 540, margin: '0 auto', fontSize: '0.92rem', lineHeight: 1.7 }}>
          Once a cable TV recharge payment is successfully processed and confirmed, it is{' '}
          <strong style={{ color: '#e94560' }}>non-refundable</strong> and{' '}
          <strong style={{ color: '#e94560' }}>non-transferable</strong>.
          The subscription is immediately activated for the registered Cable ID.
        </p>
      </div>

      {/* Critical: Auto-Refund Banner */}
      <div className="mb-4 fade-in-up" style={{
        background: 'linear-gradient(135deg, rgba(40,224,126,0.12), rgba(40,224,126,0.04))',
        border: '2px solid rgba(40,224,126,0.35)', borderRadius: 16, padding: '1.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>✅</div>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: '#28e07e', marginBottom: 8 }}>
          Failed Transactions Are Auto-Refunded
        </h2>
        <p style={{ color: '#c0c6d8', maxWidth: 560, margin: '0 auto', fontSize: '0.92rem', lineHeight: 1.7 }}>
          If your amount is <strong style={{ color: '#e8e8f0' }}>debited</strong> but the payment is marked{' '}
          <strong style={{ color: '#f5a623' }}>failed</strong>, it will be automatically reversed to your
          original payment source within <strong style={{ color: '#28e07e' }}>5–7 working days</strong> by Razorpay.
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
          {/* Eligibility Grid */}
          <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div style={{ width: 42, height: 42, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>Refund Eligibility</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div style={{ background: 'rgba(233,69,96,0.06)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 12, padding: '1rem' }}>
                <p style={{ color: '#e94560', fontWeight: 700, marginBottom: 10, fontSize: '0.9rem' }}>✗ NOT Eligible</p>
                {['Successful recharge payments', 'Wrong Cable ID was entered', 'Change of mind after payment', 'Duplicate payments with valid receipts', 'Partial-month cancellation'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#e94560', flexShrink: 0 }}>✗</span>
                    <span style={{ color: '#8890a6', fontSize: '0.85rem' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(40,224,126,0.06)', border: '1px solid rgba(40,224,126,0.2)', borderRadius: 12, padding: '1rem' }}>
                <p style={{ color: '#28e07e', fontWeight: 700, marginBottom: 10, fontSize: '0.9rem' }}>✓ Eligible</p>
                {['Amount debited but payment failed', 'Double charge for same transaction', 'Technical gateway error confirmed', 'Payment pending beyond 48 hours'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#28e07e', flexShrink: 0 }}>✓</span>
                    <span style={{ color: '#8890a6', fontSize: '0.85rem' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Refund Timeline */}
          <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div style={{ width: 42, height: 42, background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⏱️</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>Refund Timeline</h2>
            </div>
            {[
              { icon: '📤', title: 'Refund Initiated by Razorpay', body: 'Within 24–48 hours of a confirmed failed or duplicate transaction.', color: '#4facfe' },
              { icon: '🏦', title: 'Bank / Payment Network Processing', body: 'Your bank processes the reversed credit — typically 3–5 working days.', color: '#f5a623' },
              { icon: '✅', title: 'Credit Received', body: 'The refunded amount appears in your original payment source within 5–7 working days.', color: '#28e07e' },
            ].map(({ icon, title, body, color }, i, arr) => (
              <div key={title} style={{ display: 'flex', gap: 16, marginBottom: i < arr.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
                  {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(30,45,80,0.6)', marginTop: 6, minHeight: 12 }} />}
                </div>
                <div style={{ paddingTop: 8, paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                  <p style={{ fontWeight: 700, color: '#e8e8f0', marginBottom: 4, fontSize: '0.92rem' }}>{title}</p>
                  <p style={{ color: '#8890a6', marginBottom: 0, fontSize: '0.88rem' }}>{body}</p>
                </div>
              </div>
            ))}
            <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 10, padding: '0.9rem', marginTop: 16, fontSize: '0.88rem' }}>
              <span style={{ color: '#f5a623', fontWeight: 600 }}>💡 Note: </span>
              Weekends and public holidays are not counted as working days. If no refund is received after 7 working days, contact us with your Razorpay Payment ID.
            </div>
          </div>

          {/* Contact for Refunds */}
          <div className="glass-card p-4 mb-4 fade-in-up" style={{ borderRadius: 16 }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 42, height: 42, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📞</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>Contact for Refund Enquiry</h2>
            </div>
            <p style={{ color: '#c0c6d8', fontSize: '0.88rem', marginBottom: 16 }}>
              Provide your full name, registered mobile, STB number, Razorpay Payment ID (starts with <code style={{ color: '#f5a623', background: 'rgba(245,166,35,0.1)', padding: '1px 6px', borderRadius: 4 }}>pay_</code>), date & amount, and a screenshot if available.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="tel:9751775472" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#e94560', fontWeight: 600, fontSize: '0.88rem' }}>📞 9751775472</a>
              <a href="mailto:happystar88793@gmail.com" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#f5a623', fontWeight: 600, fontSize: '0.88rem' }}>✉️ happystar88793@gmail.com</a>
            </div>
          </div>

          {/* Razorpay Disclaimer */}
          <div className="glass-card p-4 fade-in-up" style={{ borderRadius: 16 }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 42, height: 42, background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💳</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8e8f0', margin: 0 }}>Payment Gateway Disclaimer</h2>
            </div>
            <p style={{ color: '#c0c6d8', fontSize: '0.88rem', lineHeight: 1.75, marginBottom: 0 }}>
              All refund operations are processed through <strong style={{ color: '#e94560' }}>Razorpay's automated refund system</strong>.
              Happy Star Satellite Vision does not hold or transfer your payment funds directly.
              Exact timelines depend on Razorpay's schedule, your bank's policies, and network clearing cycles.
              We are not liable for delays caused by third-party financial institutions.
            </p>
          </div>
        </>
      )}
    </LegalLayout>
  );
};

export default RefundPolicy;
