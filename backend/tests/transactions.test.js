const request = require('supertest');
const app = require('../server');
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

// Mock Supabase
jest.mock('../config/supabase', () => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    order: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const validToken = jwt.sign({ id: 'admin-id', username: 'admin' }, JWT_SECRET);

const mockTransaction = {
    id: 1,
    stb_number: 'STB001',
    amount_paid: 200,
    months_recharged: 1,
    payment_id: 'pay_xxx',
    payment_status: 'success',
    date: new Date().toISOString(),
    customers: { name: 'John', mobile: '9876543210', village: 'TV' },
};

describe('Transactions API', () => {
    beforeEach(() => jest.clearAllMocks());

    // ─── GET /api/transactions ─────────────────────────────────────────────────
    describe('GET /api/transactions', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/transactions');
            expect(res.status).toBe(401);
        });

        it('should return 200 and array of transactions', async () => {
            supabase.order.mockResolvedValueOnce({ data: [mockTransaction], error: null });

            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].stb_number).toBe('STB001');
        });

        it('should return empty array when no transactions', async () => {
            supabase.order.mockResolvedValueOnce({ data: [], error: null });

            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return 500 on database error', async () => {
            supabase.order.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
        });
    });

    // ─── GET /api/transactions/stats ──────────────────────────────────────────
    describe('GET /api/transactions/stats', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/transactions/stats');
            expect(res.status).toBe(401);
        });

        it('should return stats object with required fields', async () => {
            // Mock totalCustomers count
            supabase.select.mockResolvedValueOnce({ count: 10 });
            // Mock allTx
            supabase.eq.mockResolvedValueOnce({ data: [mockTransaction] });

            const res = await request(app)
                .get('/api/transactions/stats')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('totalCustomers');
            expect(res.body).toHaveProperty('totalTransactions');
            expect(res.body).toHaveProperty('totalAmount');
        });
    });

    // ─── GET /api/transactions/today ──────────────────────────────────────────
    describe('GET /api/transactions/today', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/transactions/today');
            expect(res.status).toBe(401);
        });

        it('should return today transactions array', async () => {
            supabase.order.mockResolvedValueOnce({ data: [mockTransaction], error: null });

            const res = await request(app)
                .get('/api/transactions/today')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // ─── GET /api/transactions/:id ─────────────────────────────────────────────
    describe('GET /api/transactions/:id', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/transactions/1');
            expect(res.status).toBe(401);
        });

        it('should return 200 for valid transaction id', async () => {
            supabase.select.mockReturnThis();
            supabase.eq.mockReturnThis();
            // Use .single() at the end
            const supabaseReal = require('../config/supabase');
            supabaseReal.single = jest.fn().mockResolvedValueOnce({ data: mockTransaction, error: null });

            const res = await request(app)
                .get('/api/transactions/1')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
        });

        it('should return 404 for unknown transaction', async () => {
            const supabaseReal = require('../config/supabase');
            supabaseReal.single = jest.fn().mockResolvedValueOnce({ data: null, error: true });

            const res = await request(app)
                .get('/api/transactions/9999')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
        });
    });
});
