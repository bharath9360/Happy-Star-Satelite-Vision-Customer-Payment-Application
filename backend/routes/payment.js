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
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        // Customer details
        stb_number,
        name,
        mobile,
        village,
        street,
        has_amplifier,
        alternate_mobile,
        full_address,
        amount_paid,
        months_recharged,
    } = req.body;

    // ── 1. Verify Razorpay signature ──────────────────────────
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    try {
        // ── 2. Upsert customer FIRST (FK constraint: customer must exist before transaction) ──
        const { error: custError } = await supabase
            .from('customers')
            .upsert([{
                stb_number,
                name,
                mobile,
                village,
                street: street || null,
                has_amplifier: has_amplifier || false,
                alternate_mobile: alternate_mobile || null,
                full_address: full_address || null,
                status: 'active',
            }], { onConflict: 'stb_number' });

        if (custError) throw custError;

        // ── 3. Insert transaction (customer now exists, FK satisfied) ─────────
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert([{
                stb_number,
                amount_paid,
                months_recharged,
                payment_id: razorpay_payment_id,
                payment_status: 'success',
            }])
            .select()
            .single();

        if (txError) throw txError;

        // ── 4. Send SMS notification ──────────────────────────────────────────
        const smsMessage =
            `Dear ${name}, your cable TV subscription for STB #${stb_number} has been recharged for ${months_recharged} month(s). Amount: Rs.${amount_paid}. Payment ID: ${razorpay_payment_id}. Thank you! - Happy Star Satellite Vision`;

        await sendSms(mobile, smsMessage);

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
