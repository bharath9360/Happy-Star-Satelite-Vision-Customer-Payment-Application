import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Public endpoints that should NEVER trigger a login redirect,
// even if they return 4xx (e.g. STB not found returns 404/403, settings GET returns without auth)
const PUBLIC_PREFIXES = [
    '/api/customers/check/',   // STB validation (public)
    '/api/settings',           // Settings read (public GET)
    '/api/payment/',           // Payment endpoints (public)
    '/api/auth/',              // Auth endpoints (login etc.)
];

const isPublicUrl = (url = '') =>
    PUBLIC_PREFIXES.some((prefix) => url.includes(prefix));

// Only redirect to login on 401 (expired/missing token) for ADMIN routes.
// Never redirect on 403 from public endpoints (e.g. inactive STB check).
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';

        if (status === 401 && !isPublicUrl(url)) {
            // Token expired or missing on a protected admin route → force re-login
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        // 403 on public routes (inactive STB, etc.) is NOT a login redirect — let the
        // component handle it by showing an inline error message.
        return Promise.reject(error);
    }
);

export default api;

