import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            <div className="container-fluid px-4">
                {/* Brand */}
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/admin">
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #e94560, #f5a623)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📡</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.1 }}>Happy Star</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7, letterSpacing: 1 }}>ADMIN PANEL</div>
                    </div>
                </Link>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="adminNav">
                    <ul className="navbar-nav mx-auto gap-1">
                        {[
                            { path: '/admin', icon: '📊', label: 'Dashboard' },
                            { path: '/admin/customers', icon: '📦', label: 'Box List' },
                            { path: '/admin/customers/new', icon: '➕', label: 'Insert Box' },
                            { path: '/admin/payments', icon: '💳', label: 'Payments' },
                            { path: '/admin/stats', icon: '📈', label: 'Statistics' },
                            { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
                        ].map(({ path, icon, label }) => (
                            <li className="nav-item" key={path}>
                                <Link
                                    className={`nav-link px-3 py-2 rounded-3 ${isActive(path)}`}
                                    to={path}
                                    style={isActive(path) ? { background: 'rgba(233,69,96,0.25)', color: '#e94560', fontWeight: 600 } : {}}
                                >
                                    <span className="me-1">{icon}</span> {label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <button
                        className="btn btn-sm px-3 py-2 rounded-3"
                        onClick={handleLogout}
                        style={{ background: 'rgba(233,69,96,0.2)', color: '#e94560', border: '1px solid rgba(233,69,96,0.4)', fontWeight: 600 }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
