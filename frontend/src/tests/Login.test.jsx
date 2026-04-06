import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../pages/Login';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
    default: { post: vi.fn(), get: vi.fn() }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderLogin = () => render(<BrowserRouter><Login /></BrowserRouter>);

    // ─── Rendering Tests ───────────────────────────────────────────────────────
    it('should render the Admin Login heading', () => {
        renderLogin();
        expect(screen.getByText('Admin Login')).toBeInTheDocument();
    });

    it('should render Happy Star Satellite Vision tagline', () => {
        renderLogin();
        expect(screen.getByText('Happy Star Satellite Vision')).toBeInTheDocument();
    });

    it('should render Username text', () => {
        renderLogin();
        expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should render Password text', () => {
        renderLogin();
        expect(screen.getByText('Password')).toBeInTheDocument();
    });

    it('should render Sign In button', () => {
        renderLogin();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render Back to Payment Page link', () => {
        renderLogin();
        expect(screen.getByText(/back to payment page/i)).toBeInTheDocument();
    });

    it('should render username input with admin placeholder', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('admin')).toBeInTheDocument();
    });

    it('should render password input', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    // ─── Interaction Tests ─────────────────────────────────────────────────────
    it('should update username input on change', () => {
        renderLogin();
        const input = screen.getByPlaceholderText('admin');
        fireEvent.change(input, { target: { value: 'myadmin' } });
        expect(input.value).toBe('myadmin');
    });

    it('should update password input on change', () => {
        renderLogin();
        const input = screen.getByPlaceholderText('••••••••');
        fireEvent.change(input, { target: { value: 'mysecret' } });
        expect(input.value).toBe('mysecret');
    });

    it('should show error when both fields are empty and form is submitted', async () => {
        const { container } = renderLogin();
        fireEvent.submit(container.querySelector('form'));
        await waitFor(() => {
            const found = document.body.textContent.includes('Username and password are required');
            expect(found).toBe(true);
        });
    });

    it('should show error when only password is filled but username is blank', async () => {
        const { container } = renderLogin();
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.submit(container.querySelector('form'));
        await waitFor(() => {
            const found = document.body.textContent.includes('Username and password are required');
            expect(found).toBe(true);
        });
    });

    it('should show error when only username is filled but password is blank', async () => {
        const { container } = renderLogin();
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.submit(container.querySelector('form'));
        await waitFor(() => {
            const found = document.body.textContent.includes('Username and password are required');
            expect(found).toBe(true);
        });
    });

    it('should not call api.post if fields are empty', () => {
        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        expect(api.post).not.toHaveBeenCalled();
    });

    it('should call api.post with correct payload on valid submit', async () => {
        api.post.mockResolvedValueOnce({ data: { token: 'tok', username: 'admin' } });
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin@123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/api/auth/login', { username: 'admin', password: 'admin@123' });
        });
    });

    it('should save token to localStorage on successful login', async () => {
        api.post.mockResolvedValueOnce({ data: { token: 'mock_jwt', username: 'admin' } });
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin@123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => expect(localStorage.getItem('adminToken')).toBe('mock_jwt'));
    });

    it('should save adminUsername to localStorage on successful login', async () => {
        api.post.mockResolvedValueOnce({ data: { token: 'tok', username: 'admin' } });
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin@123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => expect(localStorage.getItem('adminUsername')).toBe('admin'));
    });

    it('should navigate to /admin on successful login', async () => {
        api.post.mockResolvedValueOnce({ data: { token: 'tok', username: 'admin' } });
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin@123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'));
    });

    it('should show error message on invalid credentials response', async () => {
        api.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials.' } } });
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    });

    it('should show fallback error on network failure', async () => {
        api.post.mockRejectedValueOnce(new Error('Network Error'));
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
    });

    it('should trim username before API call', async () => {
        api.post.mockResolvedValueOnce({ data: { token: 'tok', username: 'admin' } });
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: '  admin  ' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin@123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/api/auth/login', { username: 'admin', password: 'admin@123' });
        });
    });

    it('should redirect to /admin if already logged in', async () => {
        localStorage.setItem('adminToken', 'existing_token');
        api.get.mockResolvedValueOnce({ data: { username: 'admin' } });
        renderLogin();
        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/api/auth/me');
            expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
        });
    });

    it('should clear stale token when /api/auth/me fails', async () => {
        localStorage.setItem('adminToken', 'stale_token');
        api.get.mockRejectedValueOnce(new Error('Expired'));
        renderLogin();
        await waitFor(() => expect(localStorage.getItem('adminToken')).toBeNull());
    });
});
