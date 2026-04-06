import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminNavbar from '../components/AdminNavbar';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn()
    }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('AdminNavbar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderComponent = () => render(
        <BrowserRouter>
            <AdminNavbar />
        </BrowserRouter>
    );

    it('should render brand "Happy Star"', () => {
        renderComponent();
        expect(screen.getByText('Happy Star')).toBeInTheDocument();
    });

    it('should render ADMIN PANEL label', () => {
        renderComponent();
        expect(screen.getByText('ADMIN PANEL')).toBeInTheDocument();
    });

    it('should render Dashboard nav link', () => {
        renderComponent();
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    it('should render Box List nav link', () => {
        renderComponent();
        expect(screen.getByText(/Box List/i)).toBeInTheDocument();
    });

    it('should render Insert Box nav link', () => {
        renderComponent();
        expect(screen.getByText(/Insert Box/i)).toBeInTheDocument();
    });

    it('should render Payments nav link', () => {
        renderComponent();
        expect(screen.getByText(/Payments/i)).toBeInTheDocument();
    });

    it('should render Settings nav link', () => {
        renderComponent();
        expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('should render Logout button', () => {
        renderComponent();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });

    it('should show stored username from localStorage', () => {
        localStorage.setItem('adminUsername', 'testadmin');
        renderComponent();
        expect(screen.getByText('testadmin')).toBeInTheDocument();
    });

    it('should show "Admin" as default username when not set in localStorage', () => {
        renderComponent();
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should call api.post /api/auth/logout and navigate to /login on logout click', async () => {
        api.post.mockResolvedValueOnce({});
        localStorage.setItem('adminToken', 'mock-token');
        localStorage.setItem('adminUsername', 'admin');

        renderComponent();
        fireEvent.click(screen.getByText(/Logout/i));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
            expect(localStorage.getItem('adminToken')).toBeNull();
            expect(localStorage.getItem('adminUsername')).toBeNull();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('should still clear localStorage and navigate even if logout API call fails', async () => {
        api.post.mockRejectedValueOnce(new Error('Network error'));
        localStorage.setItem('adminToken', 'mock-token');

        renderComponent();
        fireEvent.click(screen.getByText(/Logout/i));

        await waitFor(() => {
            expect(localStorage.getItem('adminToken')).toBeNull();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });
});
