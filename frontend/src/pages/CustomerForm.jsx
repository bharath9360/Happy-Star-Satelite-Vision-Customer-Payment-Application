import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { VILLAGE_PRICES, OFFERS, AMPLIFIER_DISCOUNT } from '../constants/pricing';

// ── Static fallbacks (used if API fails) ─────────────────────────────────────
const FALLBACK_VILLAGES = Object.entries(VILLAGE_PRICES).map(([name, price]) => ({ name, price }));
const FALLBACK_OFFERS = OFFERS;
const FALLBACK_DISCOUNT = AMPLIFIER_DISCOUNT;
const FALLBACK_META = {
    businessName: 'Happy Star Satellite Vision',
    tagline: 'Recharge your Cable TV subscription online',
    supportPhone: '+91 XXXXXXXXXX',
    requireAmplifierAddress: true,
    showStreetField: true,
};

const CustomerForm = () => {
    // ── Settings (loaded from API) ───────────────────────────────────────────
    const [configLoading, setConfigLoading] = useState(true);
    const [villages, setVillages] = useState(FALLBACK_VILLAGES);
    const [offers, setOffers] = useState(FALLBACK_OFFERS);
    const [amplifierDiscount, setAmplifierDiscount] = useState(FALLBACK_DISCOUNT);
    const [formMeta, setFormMeta] = useState(FALLBACK_META);

    useEffect(() => {
        api.get('/api/settings')
            .then(({ data }) => {
                if (data.villages?.length) setVillages(data.villages);
                if (data.offers?.length) setOffers(data.offers);
                if (data.amplifierDiscount !== undefined) setAmplifierDiscount(data.amplifierDiscount);
                if (data.formMeta) setFormMeta({ ...FALLBACK_META, ...data.formMeta });
            })
            .catch(() => { /* silently fallback to defaults */ })
            .finally(() => setConfigLoading(false));
    }, []);

    const [form, setForm] = useState({
        name: '', stb_number: '', mobile: '',
        village: '', street: '',
        has_amplifier: false, alternate_mobile: '', full_address: '',
    });
    const [selectedOffer, setSelectedOffer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // STB validation state — status: 'idle' | 'checking' | 'valid' | 'invalid'
    const [stbCheck, setStbCheck] = useState({ status: 'idle', message: '', customerName: '' });
    const stbDebounceRef = useRef(null);

    const villageNames = villages.map(v => v.name);
    const villagePriceMap = Object.fromEntries(villages.map(v => [v.name, v.price]));
    const basePrice = villagePriceMap[form.village] || 0;
    const offer = offers[selectedOffer] || offers[0] || { multiplier: 1, months: 1, freeMonths: 0, label: '1 Month' };
    const rawTotal = basePrice * offer.multiplier;
    const totalPrice = form.has_amplifier && basePrice > 0 ? rawTotal - amplifierDiscount : rawTotal;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newVal = type === 'checkbox' ? checked : value;
        setForm(prev => ({ ...prev, [name]: newVal }));
        // Reset STB validation when the user edits the STB field
        if (name === 'stb_number') {
            setStbCheck({ status: 'idle', message: '', customerName: '' });
            clearTimeout(stbDebounceRef.current);
        }
    };

    // Called onBlur of STB input — hits the public /check endpoint
    const validateStb = async () => {
        const stb = form.stb_number.trim();
        if (!stb) return;
        setStbCheck({ status: 'checking', message: 'Verifying STB number...', customerName: '' });
        try {
            const { data } = await api.get(`/api/customers/check/${encodeURIComponent(stb)}`);
            setStbCheck({ status: 'valid', message: `✅ Registered to: ${data.name} (${data.village})`, customerName: data.name });
        } catch (err) {
            const msg = err.response?.data?.error || 'STB number not found. Please contact the office.';
            setStbCheck({ status: 'invalid', message: `❌ ${msg}`, customerName: '' });
        }
    };

    const loadRazorpay = () => new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handlePay = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.name || !form.stb_number || !form.mobile || !form.village) {
            setError('Please fill in all required fields.');
            return;
        }

        // Block payment if STB hasn't been validated yet
        if (stbCheck.status === 'idle' || stbCheck.status === 'checking') {
            setError('Please wait — verifying your STB number.');
            await validateStb();
            return;
        }
        if (stbCheck.status === 'invalid') {
            setError(stbCheck.message.replace('❌ ', ''));
            return;
        }

        if (form.has_amplifier && (!form.alternate_mobile || !form.full_address)) {
            setError('Alternate Mobile and Full Address are required for Amplifier customers.');
            return;
        }
        if (totalPrice <= 0) {
            setError('Please select a valid village to get the price.');
            return;
        }

        setLoading(true);
        const ok = await loadRazorpay();
        if (!ok) { setError('Payment gateway failed to load. Check your internet.'); setLoading(false); return; }

        try {
            const { data: order } = await api.post('/api/payment/create-order', {
                amount: totalPrice,
                receipt: `stb_${form.stb_number}_${Date.now()}`,
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Happy Star Satellite Vision',
                description: `${offer.label} Cable TV Subscription`,
                order_id: order.orderId,
                prefill: {
                    name: form.name,
                    contact: form.mobile,
                    // Pre-filling email is optional but helps UPI collect flow
                    email: '',
                },
                theme: { color: '#e94560' },

                // ── UPI Configuration ──────────────────────────────────────────
                // Enables UPI as the PRIMARY payment method in the checkout modal.
                // Shows UPI apps (GPay, PhonePe, Paytm, BHIM) first, then QR, then VPA.
                config: {
                    display: {
                        blocks: {
                            upi_block: {
                                name: 'Pay via UPI',
                                instruments: [
                                    { method: 'upi', flows: ['intent'] },   // UPI apps (GPay, PhonePe, Paytm, BHIM)
                                    { method: 'upi', flows: ['qr'] },        // Scan QR code
                                    { method: 'upi', flows: ['collect'] },   // Enter UPI ID / VPA
                                ],
                            },
                            other_block: {
                                name: 'Other Payment Methods',
                                instruments: [
                                    { method: 'card' },
                                    { method: 'netbanking' },
                                    { method: 'wallet' },
                                ],
                            },
                        },
                        sequence: ['block.upi_block', 'block.other_block'],
                        preferences: { show_default_blocks: false },
                    },
                },
                // ──────────────────────────────────────────────────────────────

                handler: async (response) => {
                    try {
                        const { data } = await api.post('/api/payment/verify', {
                            ...response,
                            ...form,
                            amount_paid: totalPrice,
                            months_recharged: offer.months,
                        });
                        setSuccess({ paymentId: response.razorpay_payment_id, amount: totalPrice, months: offer.months });
                        setForm({ name: '', stb_number: '', mobile: '', village: '', street: '', has_amplifier: false, alternate_mobile: '', full_address: '' });
                        setSelectedOffer(0);
                    } catch (err) {
                        setError(err.response?.data?.error || 'Payment recorded failed. Contact support.');
                    } finally { setLoading(false); }
                },
                modal: { ondismiss: () => setLoading(false) },
            };

            new window.Razorpay(options).open();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to initiate payment.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <div className="payment-card fade-in-up" style={{ padding: '2rem 1rem', width: '100%', maxWidth: 520 }}>
                {/* Header */}
                <div className="text-center mb-4">
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📡</div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.6rem', background: 'linear-gradient(135deg, #e94560, #f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {configLoading ? 'Loading...' : formMeta.businessName}
                    </h1>
                    <p style={{ color: '#8890a6', fontSize: '0.9rem' }}>{formMeta.tagline}</p>
                </div>

                {/* Success Banner */}
                {success && (
                    <div className="glass-card p-3 mb-4 text-center fade-in-up" style={{ border: '1px solid rgba(40,224,126,0.3)', background: 'rgba(40,224,126,0.05)' }}>
                        <div style={{ fontSize: 40 }}>✅</div>
                        <h5 style={{ color: '#28e07e', fontWeight: 700 }}>Payment Successful!</h5>
                        <p style={{ color: '#8890a6', fontSize: '0.85rem', margin: 0 }}>
                            ₹{success.amount} paid for {success.months} month(s)<br />
                            Payment ID: <code style={{ color: '#f5a623' }}>{success.paymentId}</code>
                        </p>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="glass-card p-3 mb-4" style={{ border: '1px solid rgba(233,69,96,0.3)', background: 'rgba(233,69,96,0.05)' }}>
                        <p style={{ color: '#e94560', margin: 0, fontSize: '0.9rem' }}>⚠️ {error}</p>
                    </div>
                )}

                <div className="glass-card p-4">
                    <form onSubmit={handlePay}>
                        {/* Personal Info */}
                        <div className="mb-3">
                            <label className="form-label">Full Name *</label>
                            <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" required />
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <label className="form-label">STB / Box Number *</label>
                                <input
                                    className="form-control"
                                    name="stb_number"
                                    value={form.stb_number}
                                    onChange={handleChange}
                                    onBlur={validateStb}
                                    placeholder="e.g. STB001234"
                                    required
                                    style={{
                                        borderColor: stbCheck.status === 'valid' ? 'rgba(40,224,126,0.6)'
                                            : stbCheck.status === 'invalid' ? 'rgba(233,69,96,0.6)'
                                                : undefined,
                                    }}
                                />
                                {/* STB check status badge */}
                                {stbCheck.status !== 'idle' && (
                                    <div style={{
                                        marginTop: 5,
                                        fontSize: '0.78rem',
                                        color: stbCheck.status === 'valid' ? '#28e07e'
                                            : stbCheck.status === 'invalid' ? '#e94560'
                                                : '#f5a623',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                    }}>
                                        {stbCheck.status === 'checking' && (
                                            <span className="spinner-border spinner-border-sm" style={{ width: 10, height: 10 }} />
                                        )}
                                        {stbCheck.message}
                                    </div>
                                )}
                            </div>
                            <div className="col-6">
                                <label className="form-label">Mobile Number *</label>
                                <input className="form-control" name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} required />
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <label className="form-label">Village / City *</label>
                                <select className="form-select" name="village" value={form.village} onChange={handleChange} required>
                                    <option value="">Select village...</option>
                                    {villageNames.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            {formMeta.showStreetField && (
                                <div className="col-6">
                                    <label className="form-label">Street</label>
                                    <input className="form-control" name="street" value={form.street} onChange={handleChange} placeholder="Street / Area" />
                                </div>
                            )}
                        </div>

                        {/* Amplifier Checkbox */}
                        <div className="mb-3 glass-card p-3" style={{ borderRadius: 10 }}>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="has_amplifier" name="has_amplifier" checked={form.has_amplifier} onChange={handleChange} />
                                <label className="form-check-label" htmlFor="has_amplifier" style={{ color: '#e8e8f0', fontWeight: 500 }}>
                                    📶 I have an Amplifier
                                    {amplifierDiscount > 0 && <span style={{ color: '#28e07e', fontSize: '0.8rem', marginLeft: 8 }}>(-₹{amplifierDiscount} discount)</span>}
                                </label>
                            </div>
                            {form.has_amplifier && (
                                <div className="mt-3 fade-in-up">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">Alternate Mobile Number *</label>
                                            <input className="form-control" name="alternate_mobile" value={form.alternate_mobile} onChange={handleChange} placeholder="Alternate contact number" maxLength={10} required={form.has_amplifier && formMeta.requireAmplifierAddress} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Full Address {formMeta.requireAmplifierAddress ? '*' : ''}</label>
                                            <textarea className="form-control" name="full_address" value={form.full_address} onChange={handleChange} rows={2} placeholder="Door No., Street, Landmark..." required={form.has_amplifier && formMeta.requireAmplifierAddress} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Offer Selection */}
                        {form.village && (
                            <div className="mb-4 fade-in-up">
                                <label className="form-label mb-2">Select Subscription Plan</label>
                                <div className="d-flex gap-2">
                                    {offers.map((o, idx) => {
                                        const price = basePrice * o.multiplier - (form.has_amplifier ? amplifierDiscount : 0);
                                        return (
                                            <div key={idx} className={`offer-card flex-fill ${selectedOffer === idx ? 'active' : ''}`} onClick={() => setSelectedOffer(idx)}>
                                                <div className="label">{o.label}</div>
                                                <div className="price">₹{price}</div>
                                                {o.freeMonths > 0 && <div className="offer-badge">🎁 {o.freeMonths} month free</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Price Summary */}
                        {form.village && (
                            <div className="glass-card p-3 mb-4 fade-in-up" style={{ borderRadius: 10 }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span style={{ color: '#8890a6', fontSize: '0.9rem' }}>Base price ({form.village})</span>
                                    <span>₹{basePrice}/month</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-1">
                                    <span style={{ color: '#8890a6', fontSize: '0.9rem' }}>Plan ({offer.label})</span>
                                    <span>₹{basePrice} × {offer.multiplier}</span>
                                </div>
                                {form.has_amplifier && (
                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                        <span style={{ color: '#28e07e', fontSize: '0.9rem' }}>Amplifier discount</span>
                                        <span style={{ color: '#28e07e' }}>-₹{amplifierDiscount}</span>
                                    </div>
                                )}
                                <hr style={{ borderColor: 'rgba(30,45,80,0.5)', margin: '0.75rem 0' }} />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Amount</span>
                                    <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#e94560' }}>₹{totalPrice}</span>
                                </div>
                            </div>
                        )}

                        {/* Pay Button */}
                        <button
                            type="submit"
                            className="btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2"
                            disabled={loading || !form.village || stbCheck.status === 'invalid' || stbCheck.status === 'checking'}
                        >
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm" /> Processing...</>
                            ) : stbCheck.status === 'checking' ? (
                                <><span className="spinner-border spinner-border-sm" /> Verifying STB...</>
                            ) : (
                                <>💳 Pay ₹{totalPrice || '0'} Now</>
                            )}
                        </button>
                        {stbCheck.status === 'invalid' && (
                            <p style={{ color: '#e94560', fontSize: '0.78rem', textAlign: 'center', marginTop: 6, marginBottom: 0 }}>
                                ⚠️ Payment blocked — STB number not recognised. Contact the office.
                            </p>
                        )}
                    </form>
                </div>

                <p className="text-center mt-3" style={{ color: '#8890a6', fontSize: '0.75rem' }}>
                    Secured by Razorpay 🔒 | Support: {formMeta.supportPhone}
                </p>
            </div>

            {/* ── Site Footer ──────────────────────────────────────────── */}
            <footer style={{
                width: '100%',
                marginTop: '3rem',
                background: 'rgba(15,15,26,0.95)',
                borderTop: '1px solid rgba(30,45,80,0.7)',
                backdropFilter: 'blur(10px)',
            }}>
                {/* ── Main footer grid ─────────────────────────────────── */}
                <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                        {/* Column 1 – Brand */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{
                                    width: 34, height: 34,
                                    background: 'linear-gradient(135deg, #e94560, #f5a623)',
                                    borderRadius: 8, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 16, flexShrink: 0,
                                }}>📡</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e8e8f0' }}>Happy Star Satellite Vision</div>
                                    <div style={{ fontSize: '0.62rem', color: '#8890a6', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cable TV Billing Platform</div>
                                </div>
                            </div>
                            <p style={{ color: '#8890a6', fontSize: '0.78rem', lineHeight: 1.65, marginBottom: 0 }}>
                                Trusted cable TV subscription management for thousands of customers across Tamil Nadu.
                            </p>
                        </div>

                        {/* Column 2 – Legal & Support links */}
                        <div>
                            <p style={{ color: '#e8e8f0', fontWeight: 700, fontSize: '0.82rem', marginBottom: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Legal &amp; Support
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { href: '/privacy-policy', label: '🔒 Privacy Policy' },
                                    { href: '/terms',          label: '📜 Terms & Conditions' },
                                    { href: '/refund-policy',  label: '💰 Refund Policy' },
                                    { href: '/about',          label: '📘 About Us' },
                                    { href: '/faq',            label: '❓ FAQ' },
                                    { href: '/security',       label: '🔐 Security' },
                                    { href: '/contact',        label: '📞 Contact Us' },
                                ].map(({ href, label }) => (
                                    <a key={href} href={href}
                                        style={{ color: '#8890a6', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#f5a623'}
                                        onMouseLeave={e => e.target.style.color = '#8890a6'}
                                    >{label}</a>
                                ))}
                            </div>
                        </div>

                        {/* Column 3 – Quick Contact */}
                        <div>
                            <p style={{ color: '#e8e8f0', fontWeight: 700, fontSize: '0.82rem', marginBottom: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Quick Contact
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <a href="tel:9751775472" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                                    <span style={{ width: 28, height: 28, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>📞</span>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#8890a6' }}>Cable Enquiry</div>
                                        <div style={{ fontSize: '0.82rem', color: '#e94560', fontWeight: 600 }}>9751775472</div>
                                    </div>
                                </a>
                                <a href="tel:9360294463" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                                    <span style={{ width: 28, height: 28, background: 'rgba(79,172,254,0.15)', border: '1px solid rgba(79,172,254,0.3)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>💻</span>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#8890a6' }}>Website Enquiry</div>
                                        <div style={{ fontSize: '0.82rem', color: '#4facfe', fontWeight: 600 }}>9360294463</div>
                                    </div>
                                </a>
                                <a href="mailto:happystar88793@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                                    <span style={{ width: 28, height: 28, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✉️</span>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#8890a6' }}>Cable Email</div>
                                        <div style={{ fontSize: '0.72rem', color: '#e94560', fontWeight: 600, wordBreak: 'break-all' }}>happystar88793@gmail.com</div>
                                    </div>
                                </a>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 28, height: 28, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🕐</span>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#8890a6' }}>Working Hours</div>
                                        <div style={{ fontSize: '0.82rem', color: '#f5a623', fontWeight: 600 }}>10 AM – 6 PM, Mon–Sat</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Divider ──────────────────────────────────────── */}
                    <div style={{ borderTop: '1px solid rgba(30,45,80,0.6)', paddingTop: '1.5rem' }}>

                        {/* Developer branding */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img
                                    src="https://res.cloudinary.com/dnby5o1lt/image/upload/v1753957805/bharath_profisnal_pic_inutoj.png"
                                    alt="Bharath K"
                                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(233,69,96,0.4)', flexShrink: 0 }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <div>
                                    <div style={{
                                        fontWeight: 800, fontSize: '0.88rem',
                                        background: 'linear-gradient(135deg, #e94560, #f5a623)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    }}>
                                        Designed &amp; Developed by Bharath K
                                    </div>
                                    <div style={{ color: '#8890a6', fontSize: '0.73rem' }}>
                                        For website or software development, contact me
                                    </div>
                                    <a
                                        href="mailto:bharathkkbharath3@gmail.com"
                                        style={{ color: '#4facfe', fontSize: '0.73rem', fontWeight: 600, textDecoration: 'none' }}
                                    >
                                        bharathkkbharath3@gmail.com
                                    </a>
                                </div>
                            </div>

                            {/* Copyright + Razorpay badge */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(40,224,126,0.1)', color: '#28e07e', border: '1px solid rgba(40,224,126,0.25)', fontWeight: 600 }}>
                                        🔒 Secured by Razorpay
                                    </span>
                                </div>
                                <p style={{ color: '#8890a6', fontSize: '0.7rem', margin: 0 }}>
                                    © 2025 Happy Star Satellite Vision. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CustomerForm;

