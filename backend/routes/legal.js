const express = require('express');
const router  = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// PAGE CONTENT
// ─────────────────────────────────────────────────────────────────────────────

// PUBLIC: GET /api/page/:name  — fetch a page's content
router.get('/page/:name', async (req, res) => {
    const { name } = req.params;
    const allowed = ['privacy', 'terms', 'refund', 'about', 'security'];
    if (!allowed.includes(name)) return res.status(400).json({ error: 'Unknown page.' });

    try {
        const { data, error } = await supabase
            .from('pages_content')
            .select('content, last_updated')
            .eq('page_name', name)
            .maybeSingle();

        if (error) throw error;
        res.json(data || { content: '', last_updated: null });
    } catch (err) {
        console.error('[Legal] GET page error:', err.message);
        res.status(500).json({ error: 'Failed to fetch page content.' });
    }
});

// ADMIN: PUT /api/page/:name  — update a page's content
router.put('/page/:name', auth, async (req, res) => {
    const { name } = req.params;
    const { content } = req.body;
    const allowed = ['privacy', 'terms', 'refund', 'about', 'security'];
    if (!allowed.includes(name)) return res.status(400).json({ error: 'Unknown page.' });
    if (content === undefined) return res.status(400).json({ error: 'content is required.' });

    try {
        const { error } = await supabase
            .from('pages_content')
            .upsert([{ page_name: name, content, last_updated: new Date().toISOString() }], { onConflict: 'page_name' });

        if (error) throw error;
        res.json({ message: `Page "${name}" updated successfully.` });
    } catch (err) {
        console.error('[Legal] PUT page error:', err.message);
        res.status(500).json({ error: 'Failed to update page content.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

// PUBLIC: GET /api/faq
router.get('/faq', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('faq')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('[Legal] GET faq error:', err.message);
        res.status(500).json({ error: 'Failed to fetch FAQs.' });
    }
});

// ADMIN: POST /api/faq
router.post('/faq', auth, async (req, res) => {
    const { question, answer, sort_order = 0 } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer are required.' });

    try {
        const { data, error } = await supabase
            .from('faq')
            .insert([{ question, answer, sort_order: Number(sort_order) }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('[Legal] POST faq error:', err.message);
        res.status(500).json({ error: 'Failed to create FAQ.' });
    }
});

// ADMIN: PUT /api/faq/:id
router.put('/faq/:id', auth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { question, answer, sort_order } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer are required.' });

    try {
        const { data, error } = await supabase
            .from('faq')
            .update({ question, answer, sort_order: Number(sort_order || 0) })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'FAQ not found.' });
        res.json(data);
    } catch (err) {
        console.error('[Legal] PUT faq error:', err.message);
        res.status(500).json({ error: 'Failed to update FAQ.' });
    }
});

// ADMIN: DELETE /api/faq/:id
router.delete('/faq/:id', auth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const { error } = await supabase.from('faq').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: 'FAQ deleted.' });
    } catch (err) {
        console.error('[Legal] DELETE faq error:', err.message);
        res.status(500).json({ error: 'Failed to delete FAQ.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT INFO
// ─────────────────────────────────────────────────────────────────────────────

// PUBLIC: GET /api/contact
router.get('/contact', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('contact_info')
            .select('*')
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        res.json(data || {
            cable_phone: '9751775472',
            cable_email: 'happystar88793@gmail.com',
            website_phone: '9360294463',
            website_email: 'bharathkkbharath3@gmail.com',
            working_hours: '10 AM – 6 PM',
        });
    } catch (err) {
        console.error('[Legal] GET contact error:', err.message);
        res.status(500).json({ error: 'Failed to fetch contact info.' });
    }
});

// ADMIN: PUT /api/contact
router.put('/contact', auth, async (req, res) => {
    const { cable_phone, cable_email, website_phone, website_email, working_hours } = req.body;
    try {
        // Get existing row ID
        const { data: existing } = await supabase.from('contact_info').select('id').limit(1).maybeSingle();
        const payload = { cable_phone, cable_email, website_phone, website_email, working_hours };

        let result;
        if (existing) {
            result = await supabase.from('contact_info').update(payload).eq('id', existing.id).select().single();
        } else {
            result = await supabase.from('contact_info').insert([payload]).select().single();
        }

        if (result.error) throw result.error;
        res.json({ message: 'Contact info updated.', data: result.data });
    } catch (err) {
        console.error('[Legal] PUT contact error:', err.message);
        res.status(500).json({ error: 'Failed to update contact info.' });
    }
});

// PUBLIC: POST /api/contact/enquiry  — handle enquiry
router.post('/contact/enquiry', async (req, res) => {
    const { name, phone, query } = req.body;
    if (!name || !phone || !query) {
        return res.status(400).json({ error: 'name, phone, and query are required.' });
    }

    try {
        const { error } = await supabase.from('customer_enquiries').insert([{ name, phone, query }]);
        if (error) throw error;
        res.json({ message: 'Your enquiry has been received. We will contact you shortly.' });
        console.log(`[Legal] Enquiry received from ${name} (${phone})`);
    } catch (err) {
        console.error('[Legal] POST enquiry error:', err.message);
        res.status(500).json({ error: 'Failed to submit enquiry. Please try again later.' });
    }
});

// ADMIN: GET /api/contact/enquiries — fetch all enquiries
router.get('/contact/enquiries', auth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('customer_enquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('[Legal] GET enquiries error:', err.message);
        res.status(500).json({ error: 'Failed to fetch enquiries.' });
    }
});

// ADMIN: PUT /api/contact/enquiry/:id — toggle enquiry status
router.put('/contact/enquiry/:id', auth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body; // expected: 'read' or 'unread'
    
    if (!status || !['read', 'unread'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
    }

    try {
        const { data, error } = await supabase
            .from('customer_enquiries')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Enquiry not found.' });
        
        res.json({ message: 'Enquiry status updated.', data });
    } catch (err) {
        console.error('[Legal] PUT enquiry error:', err.message);
        res.status(500).json({ error: 'Failed to update enquiry.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// SITE SETTINGS — LOGO
// ─────────────────────────────────────────────────────────────────────────────

// PUBLIC: GET /api/site-settings/logo
router.get('/site-settings/logo', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('logo_url')
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        res.json({ logo_url: data?.logo_url || '' });
    } catch (err) {
        console.error('[Legal] GET logo error:', err.message);
        res.json({ logo_url: '' }); // graceful fallback
    }
});

// ADMIN: PUT /api/site-settings/logo
router.put('/site-settings/logo', auth, async (req, res) => {
    const { logo_url } = req.body;
    if (!logo_url) return res.status(400).json({ error: 'logo_url is required.' });

    try {
        const { data: existing } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
        let result;
        if (existing) {
            result = await supabase.from('site_settings').update({ logo_url }).eq('id', existing.id).select().single();
        } else {
            result = await supabase.from('site_settings').insert([{ logo_url }]).select().single();
        }
        if (result.error) throw result.error;
        res.json({ message: 'Logo updated.', logo_url });
    } catch (err) {
        console.error('[Legal] PUT logo error:', err.message);
        res.status(500).json({ error: 'Failed to update logo.' });
    }
});

module.exports = router;
