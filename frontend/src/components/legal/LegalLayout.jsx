import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';

const NAV_LINKS = [
  { path: '/privacy-policy', label: 'Privacy Policy',    icon: '🔒' },
  { path: '/terms',          label: 'Terms',             icon: '📜' },
  { path: '/refund-policy',  label: 'Refund Policy',     icon: '💰' },
  { path: '/contact',        label: 'Contact',           icon: '📞' },
  { path: '/about',          label: 'About Us',          icon: '📘' },
  { path: '/faq',            label: 'FAQ',               icon: '❓' },
  { path: '/security',       label: 'Security',          icon: '🔐' },
];

const DEVELOPER = {
  name:    'Bharath K',
  email:   'bharathkkbharath3@gmail.com',
  image:   'https://res.cloudinary.com/dnby5o1lt/image/upload/v1753957805/bharath_profisnal_pic_inutoj.png',
  tagline: 'For website or software development, contact me',
};

const LegalLayout = ({ children, title, subtitle, icon }) => {
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/api/site-settings/logo')
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); })
      .catch(() => {}); // silently fallback
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark-bg)', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sticky Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        position: 'sticky', top: 0, zIndex: 1000,
      }}>
        <div className="container-fluid px-3 px-md-4" style={{ padding: '0.7rem 0' }}>
          <div className="d-flex align-items-center justify-content-between gap-2">

            {/* Brand / Logo */}
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
              {logoUrl
                ? <img src={logoUrl} alt="Logo" style={{ height: 36, borderRadius: 8, objectFit: 'contain' }} />
                : (
                  <div style={{
                    width: 36, height: 36,
                    background: 'linear-gradient(135deg, #e94560, #f5a623)',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>📡</div>
                )
              }
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e8e8f0', lineHeight: 1.1 }}>Happy Star</div>
                <div style={{ fontSize: '0.6rem', color: '#8890a6', letterSpacing: 1, textTransform: 'uppercase' }}>Satellite Vision</div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="d-none d-lg-flex flex-wrap gap-1 align-items-center">
              {NAV_LINKS.map(({ path, label, icon: ico }) => (
                <Link key={path} to={path} style={{
                  fontSize: '0.76rem', fontWeight: 600, padding: '5px 11px', borderRadius: 20,
                  textDecoration: 'none', transition: 'all 0.2s',
                  background: isActive(path) ? 'rgba(233,69,96,0.25)' : 'rgba(255,255,255,0.05)',
                  color: isActive(path) ? '#e94560' : '#8890a6',
                  border: isActive(path) ? '1px solid rgba(233,69,96,0.4)' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  {ico} {label}
                </Link>
              ))}
            </div>

            {/* Right: Pay + hamburger */}
            <div className="d-flex align-items-center gap-2">
              <Link to="/" style={{
                fontSize: '0.78rem', fontWeight: 600, padding: '6px 14px', borderRadius: 8,
                textDecoration: 'none', background: 'rgba(245,166,35,0.15)',
                color: '#f5a623', border: '1px solid rgba(245,166,35,0.35)',
                flexShrink: 0,
              }}>← Pay Now</Link>
              <button
                className="d-lg-none btn btn-sm"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8f0', borderRadius: 8 }}
              >☰</button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="d-lg-none" style={{ borderTop: '1px solid rgba(30,45,80,0.5)', paddingTop: 10, paddingBottom: 6, marginTop: 8 }}>
              <div className="d-flex flex-wrap gap-1">
                {NAV_LINKS.map(({ path, label, icon: ico }) => (
                  <Link key={path} to={path}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      fontSize: '0.78rem', fontWeight: 600, padding: '6px 13px', borderRadius: 20,
                      textDecoration: 'none', transition: 'all 0.2s',
                      background: isActive(path) ? 'rgba(233,69,96,0.25)' : 'rgba(255,255,255,0.05)',
                      color: isActive(path) ? '#e94560' : '#8890a6',
                      border: isActive(path) ? '1px solid rgba(233,69,96,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    {ico} {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Page Hero ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(233,69,96,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(30,45,80,0.5)',
        padding: '3rem 1rem 2.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{icon}</div>
        <h1 style={{
          fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
          background: 'linear-gradient(135deg, #e94560, #f5a623)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ color: '#8890a6', fontSize: '0.95rem', maxWidth: 580, margin: '0 auto' }}>
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: 20, background: 'rgba(40,224,126,0.1)', color: '#28e07e', border: '1px solid rgba(40,224,126,0.25)', fontWeight: 600 }}>✓ Effective Immediately</span>
          <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: 20, background: 'rgba(245,166,35,0.1)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.25)', fontWeight: 600 }}>Last Updated: April 2025</span>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1rem 4rem' }}>
        {children}
      </div>

      {/* ── Quick Nav Footer ──────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(30,45,80,0.5)', background: 'rgba(15,15,26,0.95)', padding: '2rem 1rem 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                {logoUrl
                  ? <img src={logoUrl} alt="Logo" style={{ height: 30, borderRadius: 6 }} />
                  : <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #e94560, #f5a623)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📡</div>
                }
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e8e8f0' }}>Happy Star Satellite Vision</div>
                  <div style={{ fontSize: '0.7rem', color: '#8890a6' }}>Cable TV Billing Platform</div>
                </div>
              </div>
              <p style={{ color: '#8890a6', fontSize: '0.8rem', lineHeight: 1.6 }}>
                Trusted cable TV subscription management for thousands of customers across Tamil Nadu.
              </p>
            </div>
            <div className="col-md-4">
              <p style={{ color: '#e8e8f0', fontWeight: 700, fontSize: '0.85rem', marginBottom: 12 }}>Legal & Support</p>
              <div className="d-flex flex-column gap-1">
                {NAV_LINKS.map(({ path, label, icon: ico }) => (
                  <Link key={path} to={path} style={{ color: '#8890a6', fontSize: '0.8rem', textDecoration: 'none', padding: '2px 0', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#f5a623'}
                    onMouseLeave={e => e.target.style.color = '#8890a6'}>
                    {ico} {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="col-md-4">
              <p style={{ color: '#e8e8f0', fontWeight: 700, fontSize: '0.85rem', marginBottom: 12 }}>Quick Contact</p>
              <div style={{ fontSize: '0.8rem', color: '#8890a6', lineHeight: 1.9 }}>
                <div>📞 <a href="tel:9751775472" style={{ color: '#e94560', textDecoration: 'none' }}>9751775472</a> (Cable)</div>
                <div>📞 <a href="tel:9360294463" style={{ color: '#4facfe', textDecoration: 'none' }}>9360294463</a> (Website)</div>
                <div>✉️ <a href="mailto:happystar88793@gmail.com" style={{ color: '#e94560', textDecoration: 'none' }}>happystar88793@gmail.com</a></div>
                <div>🕐 10 AM – 6 PM, Mon–Sat</div>
              </div>
            </div>
          </div>

          {/* Developer branding */}
          <div style={{
            borderTop: '1px solid rgba(30,45,80,0.5)',
            padding: '1.5rem 0',
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={DEVELOPER.image}
                alt="Bharath K"
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(233,69,96,0.4)' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', background: 'linear-gradient(135deg, #e94560, #f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Designed & Developed by {DEVELOPER.name}
                </div>
                <div style={{ color: '#8890a6', fontSize: '0.75rem' }}>{DEVELOPER.tagline}</div>
                <a href={`mailto:${DEVELOPER.email}`} style={{ color: '#4facfe', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                  {DEVELOPER.email}
                </a>
              </div>
            </div>
            <p style={{ color: '#8890a6', fontSize: '0.75rem', margin: 0 }}>
              © 2025 Happy Star Satellite Vision · Secured by <span style={{ color: '#e94560', fontWeight: 600 }}>Razorpay 🔒</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
