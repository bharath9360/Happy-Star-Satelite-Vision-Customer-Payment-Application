const request = require('supertest');
const app = require('../server');
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

// Mock supabase to prevent real DB calls
jest.mock('../config/supabase', () => {
    const mock = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(),
        maybeSingle: jest.fn(),
    };
    return mock;
});

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const validToken = jwt.sign({ id: 'admin-id', username: 'admin' }, JWT_SECRET);

const mockCustomer = {
    id: 1,
    stb_number: 'STB001',
    name: 'John Doe',
    mobile: '9876543210',
    village: 'TestVillage',
    street: 'Main St',
    has_amplifier: false,
    status: 'active',
};

describe('Customers API', () => {
    beforeEach(() => jest.clearAllMocks());

    // ─── GET /api/customers ────────────────────────────────────────────────────
    describe('GET /api/customers', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/customers');
            expect(res.status).toBe(401);
        });

        it('should return 200 and customer array with valid token', async () => {
            supabase.order.mockResolvedValueOnce({ data: [mockCustomer], error: null });

            const res = await request(app)
                .get('/api/customers')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return 200 with empty array when no customers exist', async () => {
            supabase.order.mockResolvedValueOnce({ data: [], error: null });

            const res = await request(app)
                .get('/api/customers')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return 500 on database error', async () => {
            supabase.order.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

            const res = await request(app)
                .get('/api/customers')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
        });
    });

    // ─── GET /api/customers/:id ────────────────────────────────────────────────
    describe('GET /api/customers/:id', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/customers/1');
            expect(res.status).toBe(401);
        });

        it('should return 200 for a valid customer id', async () => {
            supabase.single.mockResolvedValueOnce({ data: mockCustomer, error: null });

            const res = await request(app)
                .get('/api/customers/1')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.stb_number).toBe('STB001');
        });

        it('should return 404 if customer not found', async () => {
            supabase.single.mockResolvedValueOnce({ data: null, error: { message: 'No rows returned' } });

            const res = await request(app)
                .get('/api/customers/999')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
        });
    });

    // ─── POST /api/customers ───────────────────────────────────────────────────
    describe('POST /api/customers', () => {
        const validPayload = { stb_number: 'STB002', name: 'Jane', mobile: '9999999999', village: 'TestVillage' };

        it('should return 401 without token', async () => {
            const res = await request(app).post('/api/customers').send(validPayload);
            expect(res.status).toBe(401);
        });

        it('should return 400 if stb_number is missing', async () => {
            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ name: 'Jane', mobile: '123', village: 'TV' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/required/i);
        });

        it('should return 400 if name is missing', async () => {
            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ stb_number: 'STB002', mobile: '123', village: 'TV' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if mobile is missing', async () => {
            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ stb_number: 'STB002', name: 'Jane', village: 'TV' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if village is missing', async () => {
            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ stb_number: 'STB002', name: 'Jane', mobile: '123' });
            expect(res.status).toBe(400);
        });

        it('should create customer and return 201', async () => {
            supabase.single.mockResolvedValueOnce({ data: { ...mockCustomer, ...validPayload }, error: null });

            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${validToken}`)
                .send(validPayload);

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Customer added successfully.');
            expect(res.body.customer).toBeDefined();
        });

        it('should return 409 if STB number already exists', async () => {
            supabase.single.mockResolvedValueOnce({ data: null, error: { code: '23505', message: 'Duplicate' } });

            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', `Bearer ${validToken}`)
                .send(validPayload);

            expect(res.status).toBe(409);
            expect(res.body.error).toBe('STB Number already exists.');
        });
    });

    // ─── PUT /api/customers/:id ────────────────────────────────────────────────
    describe('PUT /api/customers/:id', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).put('/api/customers/1').send({ name: 'Jane' });
            expect(res.status).toBe(401);
        });

        it('should update customer and return 200', async () => {
            supabase.single.mockResolvedValueOnce({ data: { ...mockCustomer, name: 'Jane' }, error: null });

            const res = await request(app)
                .put('/api/customers/1')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ stb_number: 'STB001', name: 'Jane', mobile: '999', village: 'TV' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Customer updated successfully.');
        });
    });

    // ─── PATCH /api/customers/:id/status ──────────────────────────────────────
    describe('PATCH /api/customers/:id/status', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).patch('/api/customers/1/status').send({ status: 'inactive' });
            expect(res.status).toBe(401);
        });

        it('should return 400 for invalid status value', async () => {
            const res = await request(app)
                .patch('/api/customers/1/status')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ status: 'banned' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Status must be active or inactive.');
        });

        it('should toggle status to inactive', async () => {
            supabase.single.mockResolvedValueOnce({ data: { ...mockCustomer, status: 'inactive' }, error: null });

            const res = await request(app)
                .patch('/api/customers/1/status')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ status: 'inactive' });

            expect(res.status).toBe(200);
        });
    });

    // ─── DELETE /api/customers/:id ─────────────────────────────────────────────
    describe('DELETE /api/customers/:id', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).delete('/api/customers/1');
            expect(res.status).toBe(401);
        });

        it('should delete customer and return 200', async () => {
            supabase.eq.mockResolvedValueOnce({ error: null });

            const res = await request(app)
                .delete('/api/customers/1')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Customer deleted successfully.');
        });
    });

    // ─── GET /api/customers/check/:stb_number (PUBLIC) ────────────────────────
    describe('GET /api/customers/check/:stb_number (public route)', () => {
        it('should return 200 for active STB', async () => {
            supabase.maybeSingle.mockResolvedValueOnce({ data: { stb_number: 'STB001', name: 'John', village: 'TV', status: 'active' }, error: null });

            const res = await request(app).get('/api/customers/check/STB001');
            expect(res.status).toBe(200);
            expect(res.body.exists).toBe(true);
            expect(res.body.active).toBe(true);
        });

        it('should return 404 for unknown STB', async () => {
            supabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

            const res = await request(app).get('/api/customers/check/UNKNOWN');
            expect(res.status).toBe(404);
            expect(res.body.exists).toBe(false);
        });

        it('should return 403 for inactive STB', async () => {
            supabase.maybeSingle.mockResolvedValueOnce({ data: { stb_number: 'STB001', name: 'John', village: 'TV', status: 'inactive' }, error: null });

            const res = await request(app).get('/api/customers/check/STB001');
            expect(res.status).toBe(403);
            expect(res.body.active).toBe(false);
        });
    });
});
