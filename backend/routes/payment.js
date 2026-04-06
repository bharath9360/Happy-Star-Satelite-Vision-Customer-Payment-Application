const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const sendSms = require('../utils/sms');

// Lazy-init Razorpay so missing env vars don't crash the server at startup
const getRazorpay = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || keyId.includes('xxxxxxxx') || keyId.includes('paste-')) {
        throw new Error('❌ RAZORPAY_KEY_ID is not configured in backend/.env');
    }
    if (!keySecret || keySecret.includes('your-razor')) {
        throw new Error('❌ RAZORPAY_KEY_SECRET is not configured in backend/.env');
    }
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
        return res.status(400).json({ error: 'Amount is required.' });
    }

    try {
        const razorpay = getRazorpay();
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1,
        };

        console.log('[Payment] Creating Razorpay order for ₹' + amount);
        const order = await razorpay.orders.create(options);
        console.log('[Payment] Order created:', order.id);
        res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (err) {
        console.error('[Payment] create-order error:', err.message || err);
        const msg = err.message?.startsWith('❌')
            ? err.message
            : 'Failed to create payment order. Check Razorpay credentials in backend/.env';
        res.status(500).json({ error: msg });
    }
});

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
    // ── 🛡️ SECURITY GUARD: Reject any attempt to send customer-modifying fields ──
    if ('name' in req.body || 'village' in req.body) {
        console.warn('[Payment] 403 — attempt to send customer data in payment request:', {
            ip: req.ip,
            stb: req.body.stb_number,
            sentFields: Object.keys(req.body).filter(k => ['name', 'village'].includes(k)),
        });
        return res.status(403).json({
            error: 'Forbidden. Customer data cannot be modified through the payment flow.',
        });
    }

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        stb_number,
        amount_paid,
        months_recharged,
        paid_by_name,   // Optional: payer's name (stored in transactions only)
        paid_by_phone,  // Optional: payer's mobile number
    } = req.body;

    if (!stb_number || !amount_paid || !months_recharged) {
        return res.status(400).json({ error: 'stb_number, amount_paid, and months_recharged are required.' });
    }

    // ── 1. Verify Razorpay signature ──────────────────────────────────────────
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    try {
        // ── 2. READ-ONLY customer lookup — verify customer exists and is active ──
        // We NEVER write to the customers table from the payment flow.
        const { data: customer, error: custError } = await supabase
            .from('customers')
            .select('stb_number, name, mobile, village, status')
            .eq('stb_number', stb_number)
            .maybeSingle();

        if (custError) throw custError;

        if (!customer) {
            return res.status(404).json({
                error: `STB number ${stb_number} not found. Please contact the office.`,
            });
        }

        if (customer.status !== 'active') {
            return res.status(403).json({
                error: `STB ${stb_number} is inactive. Please contact the office before paying.`,
            });
        }

        // ── 3. Insert transaction ONLY — customers table is NOT touched ────────
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert([{
                stb_number,
                amount_paid,
                months_recharged,
                payment_id: razorpay_payment_id,
                payment_status: 'success',
                paid_by_name: paid_by_name || null,
                paid_by_phone: paid_by_phone || null,
            }])
            .select()
            .single();

        if (txError) throw txError;

        // ── 4. Send SMS using admin-controlled customer data (never user input) ─
        const smsMessage =
            `Dear ${customer.name}, your cable TV subscription for STB #${stb_number} has been recharged for ${months_recharged} month(s). Amount: Rs.${amount_paid}. Payment ID: ${razorpay_payment_id}. Thank you! - Happy Star Satellite Vision`;

        await sendSms(customer.mobile, smsMessage);

        res.json({
            success: true,
            message: 'Payment verified and recorded successfully.',
            transaction,
        });
    } catch (err) {
        console.error('Payment verify error:', err);
        res.status(500).json({ error: 'Payment recorded failed. Contact support.' });
    }
});

module.exports = router;
