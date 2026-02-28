const express = require('express');
const router = require('express').Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// ── PUBLIC: STB existence check (no auth — used by customer payment page) ──
// GET /api/customers/check/:stb_number
router.get('/check/:stb_number', async (req, res) => {
    const stb = req.params.stb_number.trim();
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('stb_number, name, village, status')
            .eq('stb_number', stb)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ exists: false, error: 'STB number not found. Please contact the office.' });
        }
        if (data.status !== 'active') {
            return res.status(403).json({ exists: true, active: false, error: `STB ${stb} is currently inactive. Please contact the office.` });
        }
        res.json({ exists: true, active: true, stb_number: data.stb_number, name: data.name, village: data.village });
    } catch (err) {
        console.error('STB check error:', err);
        res.status(500).json({ error: 'Failed to verify STB number.' });
    }
});

// ── All routes below this line are Admin-protected ──────────────────────────
router.use(auth);

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
    try {
        const { search, village, status } = req.query;
        let query = supabase.from('customers').select('*').order('id', { ascending: false });

        if (search) {
            query = query.or(`name.ilike.%${search}%,stb_number.ilike.%${search}%,mobile.ilike.%${search}%`);
        }
        if (village) query = query.eq('village', village);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Get customers error:', err);
        res.status(500).json({ error: 'Failed to fetch customers.' });
    }
});

// GET /api/customers/:id - Get single customer
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Customer not found.' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch customer.' });
    }
});

// POST /api/customers - Add new customer (Insert Box)
router.post('/', async (req, res) => {
    const { stb_number, name, mobile, village, street, has_amplifier, alternate_mobile, full_address, status } = req.body;

    if (!stb_number || !name || !mobile || !village) {
        return res.status(400).json({ error: 'STB Number, Name, Mobile, and Village are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('customers')
            .insert([{ stb_number, name, mobile, village, street, has_amplifier: has_amplifier || false, alternate_mobile, full_address, status: status || 'active' }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') return res.status(409).json({ error: 'STB Number already exists.' });
            throw error;
        }
        res.status(201).json({ message: 'Customer added successfully.', customer: data });
    } catch (err) {
        console.error('Add customer error:', err);
        res.status(500).json({ error: 'Failed to add customer.' });
    }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
    const { stb_number, name, mobile, village, street, has_amplifier, alternate_mobile, full_address, status } = req.body;

    try {
        const { data, error } = await supabase
            .from('customers')
            .update({ stb_number, name, mobile, village, street, has_amplifier, alternate_mobile, full_address, status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Customer not found.' });
        res.json({ message: 'Customer updated successfully.', customer: data });
    } catch (err) {
        console.error('Update customer error:', err);
        res.status(500).json({ error: 'Failed to update customer.' });
    }
});

// PATCH /api/customers/:id/status - Toggle active/inactive
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ error: 'Status must be active or inactive.' });
    }
    try {
        const { data, error } = await supabase
            .from('customers')
            .update({ status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: `Customer status updated to ${status}.`, customer: data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status.' });
    }
});

// POST /api/customers/bulk - Bulk insert/upsert from Excel or CSV
router.post('/bulk', async (req, res) => {
    const { rows } = req.body; // array of customer objects
    if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ error: 'No rows provided.' });
    }

    const MAX_ROWS = 1000;
    if (rows.length > MAX_ROWS) {
        return res.status(400).json({ error: `Too many rows. Max allowed: ${MAX_ROWS}.` });
    }

    const results = { inserted: 0, updated: 0, skipped: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const stb = (row.stb_number || '').toString().trim();
        const name = (row.name || '').toString().trim();
        const mobile = (row.mobile || '').toString().trim();
        const village = (row.village || '').toString().trim();

        if (!stb || !name || !mobile || !village) {
            results.skipped++;
            results.errors.push({ row: i + 1, stb: stb || '(empty)', reason: 'Missing required fields (stb_number, name, mobile, village)' });
            continue;
        }

        const record = {
            stb_number: stb,
            name,
            mobile,
            village,
            street: (row.street || '').toString().trim() || null,
            has_amplifier: row.has_amplifier === true || row.has_amplifier === 'true' || row.has_amplifier === 1 || row.has_amplifier === 'YES',
            alternate_mobile: (row.alternate_mobile || '').toString().trim() || null,
            full_address: (row.full_address || '').toString().trim() || null,
            status: ['active', 'inactive'].includes((row.status || '').toLowerCase()) ? row.status.toLowerCase() : 'active',
        };

        const { error } = await supabase
            .from('customers')
            .upsert([record], { onConflict: 'stb_number', ignoreDuplicates: false });

        if (error) {
            results.skipped++;
            results.errors.push({ row: i + 1, stb, reason: error.message });
        } else {
            results.inserted++;
        }
    }

    res.status(200).json({
        message: `Bulk insert complete. ${results.inserted} upserted, ${results.skipped} skipped.`,
        ...results,
    });
});

// DELETE /api/customers/:id - Delete customer (Remove Box)
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Customer deleted successfully.' });
    } catch (err) {
        console.error('Delete customer error:', err);
        res.status(500).json({ error: 'Failed to delete customer.' });
    }
});

module.exports = router;
