const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// All transaction routes are protected
router.use(auth);

// GET /api/transactions/stats - Summary stats for dashboard
router.get('/stats', async (req, res) => {
    try {
        // Total customers
        const { count: totalCustomers } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });

        // Total successful payments & amount
        const { data: allTx } = await supabase
            .from('transactions')
            .select('amount_paid, months_recharged, date')
            .eq('payment_status', 'success');

        const totalAmount = allTx?.reduce((sum, t) => sum + Number(t.amount_paid), 0) || 0;
        const totalTransactions = allTx?.length || 0;

        // This month's amount
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const thisMonthAmount = allTx
            ?.filter(t => t.date >= startOfMonth)
            .reduce((sum, t) => sum + Number(t.amount_paid), 0) || 0;

        // Subscription breakdown
        const oneMonth = allTx?.filter(t => t.months_recharged === 1).length || 0;
        const sixMonth = allTx?.filter(t => t.months_recharged === 6).length || 0;
        const oneYear = allTx?.filter(t => t.months_recharged === 12).length || 0;

        // Unique paying customers
        const uniquePayers = new Set(allTx?.map(t => t.stb_number)).size || 0;

        res.json({
            totalCustomers,
            totalTransactions,
            totalAmount,
            thisMonthAmount,
            uniquePayingCustomers: uniquePayers,
            subscriptionBreakdown: { oneMonth, sixMonth, oneYear },
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
});

// GET /api/transactions/today - Today's payments with customer details
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        const { data, error } = await supabase
            .from('transactions')
            .select('*, customers(name, mobile, village, street, has_amplifier)')
            .eq('payment_status', 'success')
            .gte('date', startOfDay)
            .lt('date', endOfDay)
            .order('date', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Today transactions error:', err);
        res.status(500).json({ error: 'Failed to fetch today\'s transactions.' });
    }
});

// GET /api/transactions - All transactions with customer details
router.get('/', async (req, res) => {
    try {
        const { search, from_date, to_date, stb_number } = req.query;

        let query = supabase
            .from('transactions')
            .select('*, customers(name, mobile, village, street, has_amplifier, alternate_mobile, full_address)')
            .order('date', { ascending: false });

        if (stb_number) query = query.eq('stb_number', stb_number);
        if (from_date) query = query.gte('date', from_date);
        if (to_date) query = query.lte('date', to_date);

        const { data, error } = await query;
        if (error) throw error;

        // Client-side search on name if provided (from join)
        let result = data;
        if (search) {
            const s = search.toLowerCase();
            result = data.filter(t =>
                t.stb_number?.toLowerCase().includes(s) ||
                t.payment_id?.toLowerCase().includes(s) ||
                t.customers?.name?.toLowerCase().includes(s) ||
                t.customers?.mobile?.includes(s)
            );
        }

        res.json(result);
    } catch (err) {
        console.error('Get transactions error:', err);
        res.status(500).json({ error: 'Failed to fetch transactions.' });
    }
});

// GET /api/transactions/:id - Single transaction with full customer snapshot
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, customers(name, mobile, village, street, has_amplifier, alternate_mobile, full_address, status)')
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Transaction not found.' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch transaction.' });
    }
});

module.exports = router;
