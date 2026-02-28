const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// ── Default settings (used when DB has no row yet) ───────────────────────────
const DEFAULT_SETTINGS = {
    villages: [
        { name: 'Chennai', price: 250 },
        { name: 'Karur', price: 230 },
        { name: 'Coimbatore', price: 240 },
        { name: 'Madurai', price: 220 },
        { name: 'Salem', price: 230 },
        { name: 'Trichy', price: 235 },
        { name: 'Tirunelveli', price: 220 },
        { name: 'Erode', price: 225 },
        { name: 'Vellore', price: 225 },
        { name: 'Thanjavur', price: 220 },
        { name: 'Dindigul', price: 215 },
        { name: 'Tiruppur', price: 230 },
        { name: 'Hosur', price: 240 },
        { name: 'Kanchipuram', price: 235 },
        { name: 'Ooty', price: 250 },
    ],
    offers: [
        { label: '1 Month', months: 1, multiplier: 1, freeMonths: 0 },
        { label: '6 Months', months: 6, multiplier: 5, freeMonths: 1 },
        { label: '1 Year', months: 12, multiplier: 10, freeMonths: 2 },
    ],
    amplifierDiscount: 50,
    formMeta: {
        supportPhone: '+91 XXXXXXXXXX',
        businessName: 'Happy Star Satellite Vision',
        tagline: 'Recharge your Cable TV subscription online',
        requireAmplifierAddress: true,
        showStreetField: true,
    },
};

// ── Helper: fetch settings row from DB ───────────────────────────────────────
const fetchSettings = async () => {
    const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'payment_form')
        .maybeSingle();

    if (error) throw error;
    return data ? data.value : DEFAULT_SETTINGS;
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/settings
// Used by the customer payment form — no auth needed
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const settings = await fetchSettings();
        res.json(settings);
    } catch (err) {
        console.error('[Settings] GET error:', err.message);
        // Gracefully fall back to defaults on DB error so payment form never breaks
        res.json(DEFAULT_SETTINGS);
    }
});

// ── All write routes below are admin-protected ───────────────────────────────
router.use(auth);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/settings  — Replace entire settings document
// ─────────────────────────────────────────────────────────────────────────────
router.put('/', async (req, res) => {
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
        return res.status(400).json({ error: 'Invalid settings payload.' });
    }
    try {
        const { error } = await supabase
            .from('app_settings')
            .upsert([{ key: 'payment_form', value: newSettings }], { onConflict: 'key' });

        if (error) throw error;
        res.json({ message: 'Settings saved successfully.', settings: newSettings });
    } catch (err) {
        console.error('[Settings] PUT error:', err.message);
        res.status(500).json({ error: 'Failed to save settings: ' + err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/settings/villages — Add or update a single village
// Body: { name, price }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/villages', async (req, res) => {
    const { name, price, oldName } = req.body;
    if (!name || price === undefined) {
        return res.status(400).json({ error: 'Village name and price are required.' });
    }
    try {
        const settings = await fetchSettings();
        const villages = [...(settings.villages || [])];

        if (oldName) {
            // Update existing
            const idx = villages.findIndex(v => v.name === oldName);
            if (idx === -1) return res.status(404).json({ error: 'Village not found.' });
            villages[idx] = { name: name.trim(), price: Number(price) };
        } else {
            // Add new — reject duplicate
            if (villages.find(v => v.name.toLowerCase() === name.toLowerCase())) {
                return res.status(409).json({ error: `Village "${name}" already exists.` });
            }
            villages.push({ name: name.trim(), price: Number(price) });
        }

        const updated = { ...settings, villages };
        const { error } = await supabase
            .from('app_settings')
            .upsert([{ key: 'payment_form', value: updated }], { onConflict: 'key' });

        if (error) throw error;
        res.json({ message: oldName ? 'Village updated.' : 'Village added.', villages: updated.villages });
    } catch (err) {
        console.error('[Settings] PATCH /villages error:', err.message);
        res.status(500).json({ error: 'Failed to update village.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/settings/villages/:name — Remove a village
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/villages/:name', async (req, res) => {
    const target = decodeURIComponent(req.params.name);
    try {
        const settings = await fetchSettings();
        const villages = (settings.villages || []).filter(v => v.name !== target);
        const updated = { ...settings, villages };

        const { error } = await supabase
            .from('app_settings')
            .upsert([{ key: 'payment_form', value: updated }], { onConflict: 'key' });

        if (error) throw error;
        res.json({ message: `Village "${target}" removed.`, villages });
    } catch (err) {
        console.error('[Settings] DELETE /villages error:', err.message);
        res.status(500).json({ error: 'Failed to delete village.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/settings/offers — Add or update a single offer
// Body: { label, months, multiplier, freeMonths, index? }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/offers', async (req, res) => {
    const { label, months, multiplier, freeMonths, index } = req.body;
    if (!label || months === undefined || multiplier === undefined) {
        return res.status(400).json({ error: 'label, months, and multiplier are required.' });
    }
    try {
        const settings = await fetchSettings();
        const offers = [...(settings.offers || [])];
        const offer = { label: label.trim(), months: Number(months), multiplier: Number(multiplier), freeMonths: Number(freeMonths || 0) };

        if (index !== undefined && index >= 0 && index < offers.length) {
            offers[index] = offer; // update
        } else {
            offers.push(offer); // add
        }

        const updated = { ...settings, offers };
        const { error } = await supabase
            .from('app_settings')
            .upsert([{ key: 'payment_form', value: updated }], { onConflict: 'key' });

        if (error) throw error;
        res.json({ message: index !== undefined ? 'Offer updated.' : 'Offer added.', offers: updated.offers });
    } catch (err) {
        console.error('[Settings] PATCH /offers error:', err.message);
        res.status(500).json({ error: 'Failed to update offer.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/settings/offers/:index — Remove an offer by array index
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/offers/:index', async (req, res) => {
    const idx = parseInt(req.params.index, 10);
    try {
        const settings = await fetchSettings();
        const offers = (settings.offers || []).filter((_, i) => i !== idx);
        if (offers.length === 0) {
            return res.status(400).json({ error: 'Cannot remove all offers. At least one must remain.' });
        }
        const updated = { ...settings, offers };

        const { error } = await supabase
            .from('app_settings')
            .upsert([{ key: 'payment_form', value: updated }], { onConflict: 'key' });

        if (error) throw error;
        res.json({ message: 'Offer removed.', offers });
    } catch (err) {
        console.error('[Settings] DELETE /offers error:', err.message);
        res.status(500).json({ error: 'Failed to delete offer.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/settings/form-meta — Update formMeta + amplifierDiscount
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/form-meta', async (req, res) => {
    try {
        const settings = await fetchSettings();
        const updated = {
            ...settings,
            amplifierDiscount: req.body.amplifierDiscount !== undefined ? Number(req.body.amplifierDiscount) : settings.amplifierDiscount,
            formMeta: { ...settings.formMeta, ...req.body.formMeta },
        };

        const { error } = await supabase
            .from('app_settings')
            .upsert([{ key: 'payment_form', value: updated }], { onConflict: 'key' });

        if (error) throw error;
        res.json({ message: 'Form meta updated.', settings: updated });
    } catch (err) {
        console.error('[Settings] PATCH /form-meta error:', err.message);
        res.status(500).json({ error: 'Failed to update form meta.' });
    }
});

module.exports = router;
