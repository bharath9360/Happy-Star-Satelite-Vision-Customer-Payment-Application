const request = require('supertest');
const app = require('../server');
const supabase = require('../config/supabase');

// Mock razorpay
const mockOrderCreate = jest.fn();
jest.mock('razorpay', () => jest.fn().mockImplementation(() => ({
    orders: { create: mockOrderCreate }
})));

// Mock supabase
jest.mock('../config/supabase', () => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
}));

describe('Payment API', () => {
    beforeEach(() => jest.clearAllMocks());

    // ─── POST /api/payment/create-order ──────────────────────────────────────
    describe('POST /api/payment/create-order', () => {
        it('should return 400 if amount is missing', async () => {
            const res = await request(app)
                .post('/api/payment/create-order')
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Amount is required.');
        });

        it('should return 500 if Razorpay credentials are not configured', async () => {
            // With default test env, Razorpay keys are missing/invalid in .env
            const res = await request(app)
                .post('/api/payment/create-order')
                .send({ amount: 500, currency: 'INR' });
            // The getRazorpay() will throw since keys are not set
            expect(res.status).toBe(500);
            expect(res.body.error).toMatch(/Razorpay|configured/i);
        });

        it('should return orderId when Razorpay is mocked correctly', async () => {
            // Override env vars so getRazorpay() won't throw
            const origKeyId = process.env.RAZORPAY_KEY_ID;
            const origKeySecret = process.env.RAZORPAY_KEY_SECRET;
            process.env.RAZORPAY_KEY_ID = 'rzp_test_validkey';
            process.env.RAZORPAY_KEY_SECRET = 'validSecret';

            mockOrderCreate.mockResolvedValueOnce({ id: 'order_mock123', amount: 50000, currency: 'INR' });

            const res = await request(app)
                .post('/api/payment/create-order')
                .send({ amount: 500, currency: 'INR' });

            process.env.RAZORPAY_KEY_ID = origKeyId;
            process.env.RAZORPAY_KEY_SECRET = origKeySecret;

            expect(res.status).toBe(200);
            expect(res.body.orderId).toBe('order_mock123');
        });
    });

    // ─── POST /api/payment/verify ─────────────────────────────────────────────
    describe('POST /api/payment/verify', () => {
        it('should return 400 for invalid signature', async () => {
            const res = await request(app)
                .post('/api/payment/verify')
                .send({
                    razorpay_order_id: 'order_123',
                    razorpay_payment_id: 'pay_456',
                    razorpay_signature: 'invalid_signature',
                    stb_number: 'STB001',
                    name: 'John',
                    mobile: '9999999999',
                    village: 'TV',
                    amount_paid: 200,
                    months_recharged: 1
                });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Payment verification failed. Invalid signature.');
        });
    });
});
