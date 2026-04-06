const request = require('supertest');
const app = require('../server');
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock supabase
jest.mock('../config/supabase', () => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn().mockResolvedValue('hashedpassword123'),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const validToken = jwt.sign({ id: 'admin-id', username: 'admin' }, JWT_SECRET);

const mockAdmin = {
    id: 'admin-id',
    username: 'admin',
    password: 'hashedpassword123',
};

describe('Auth API Routes', () => {
    beforeEach(() => jest.clearAllMocks());

    // ─── POST /api/auth/login ──────────────────────────────────────────────────
    describe('POST /api/auth/login', () => {
        it('should return 400 when both username and password are missing', async () => {
            const res = await request(app).post('/api/auth/login').send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Username and password are required.');
        });

        it('should return 400 when username is missing', async () => {
            const res = await request(app).post('/api/auth/login').send({ password: 'pwd' });
            expect(res.status).toBe(400);
        });

        it('should return 400 when password is missing', async () => {
            const res = await request(app).post('/api/auth/login').send({ username: 'admin' });
            expect(res.status).toBe(400);
        });

        it('should return 401 when user does not exist in DB', async () => {
            supabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'nonexistent', password: 'pass' });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials.');
        });

        it('should return 401 when password does not match', async () => {
            supabase.single.mockResolvedValueOnce({ data: mockAdmin, error: null });
            bcrypt.compare.mockResolvedValueOnce(false);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'wrongpassword' });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials.');
        });

        it('should login successfully with valid credentials', async () => {
            supabase.single.mockResolvedValueOnce({ data: mockAdmin, error: null });
            bcrypt.compare.mockResolvedValueOnce(true);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'admin@123' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.username).toBe('admin');
        });

        it('should trim leading/trailing spaces from username', async () => {
            supabase.single.mockResolvedValueOnce({ data: mockAdmin, error: null });
            bcrypt.compare.mockResolvedValueOnce(true);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: '  admin  ', password: 'admin@123' });

            expect(res.status).toBe(200);
            expect(supabase.eq).toHaveBeenCalledWith('username', 'admin');
        });
    });

    // ─── POST /api/auth/logout ─────────────────────────────────────────────────
    describe('POST /api/auth/logout', () => {
        it('should return 200 for logout (stateless)', async () => {
            const res = await request(app).post('/api/auth/logout');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Logged out successfully.');
        });
    });

    // ─── GET /api/auth/me ──────────────────────────────────────────────────────
    describe('GET /api/auth/me', () => {
        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Access denied. No token provided.');
        });

        it('should return 401 if token is invalid', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer thisisnotavalidtoken');
            expect(res.status).toBe(401);
        });

        it('should return admin info when token is valid', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${validToken}`);
            expect(res.status).toBe(200);
            expect(res.body.username).toBe('admin');
        });
    });
});
