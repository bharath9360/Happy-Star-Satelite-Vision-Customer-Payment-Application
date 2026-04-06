import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PrivateRoute from '../components/PrivateRoute';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn(),
    }
}));

describe('PrivateRoute Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderWithRouter = (initialPath = '/admin') => render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <div data-testid="protected-content">Protected Page</div>
                        </PrivateRoute>
                    }
                />
                <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
            </Routes>
        </MemoryRouter>
    );

    it('should show a spinner while checking token validity', () => {
        localStorage.setItem('adminToken', 'mock-token');
        api.get.mockReturnValueOnce(new Promise(() => {})); // Never resolves = stays "checking"

        renderWithRouter();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should redirect to /login when no token is stored', async () => {
        // No token in localStorage

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByTestId('login-page')).toBeInTheDocument();
        });
    });

    it('should redirect to /login when token exists but api.get /api/auth/me fails', async () => {
        localStorage.setItem('adminToken', 'stale-token');
        api.get.mockRejectedValueOnce(new Error('Unauthorized'));

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByTestId('login-page')).toBeInTheDocument();
        });
    });

    it('should remove stale token from localStorage when API rejects', async () => {
        localStorage.setItem('adminToken', 'stale-token');
        api.get.mockRejectedValueOnce(new Error('Unauthorized'));

        renderWithRouter();

        await waitFor(() => {
            expect(localStorage.getItem('adminToken')).toBeNull();
        });
    });

    it('should render protected children when token is valid', async () => {
        localStorage.setItem('adminToken', 'valid-token');
        api.get.mockResolvedValueOnce({ data: { username: 'admin' } });

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        });
    });
});
