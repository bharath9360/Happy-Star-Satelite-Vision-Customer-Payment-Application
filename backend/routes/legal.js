const express = require('express');
const router  = express.Router();
const nodemailer = require('nodemailer');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// ── Nodemailer transporter (Gmail / SMTP) ─────────────────────────────────────
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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

// PUBLIC: POST /api/contact/enquiry  — send email via Nodemailer
router.post('/contact/enquiry', async (req, res) => {
    const { name, phone, query } = req.body;
    if (!name || !phone || !query) {
        return res.status(400).json({ error: 'name, phone, and query are required.' });
    }

    // Always return success to user; email is best-effort
    res.json({ message: 'Your enquiry has been received. We will contact you shortly.' });

    // Send email asynchronously
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass || emailUser.includes('your-email')) {
        console.warn('[Legal] Email not configured — skipping send. Set EMAIL_USER and EMAIL_PASS in .env');
        return;
    }

    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"Happy Star Enquiry" <${emailUser}>`,
            to: emailUser,
            replyTo: `${name} <${emailUser}>`,
            subject: `📩 New Website Enquiry from ${name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
              <h2 style="color: #e94560; margin-bottom: 4px;">📡 Happy Star Satellite Vision</h2>
              <p style="color: #666; font-size: 13px; margin-bottom: 24px;">New Customer Enquiry</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; background: #fff; border: 1px solid #eee; font-weight: bold; width: 130px;">👤 Name</td>
                  <td style="padding: 10px; background: #fff; border: 1px solid #eee;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; background: #fff; border: 1px solid #eee; font-weight: bold;">📞 Phone</td>
                  <td style="padding: 10px; background: #fff; border: 1px solid #eee;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; background: #fff; border: 1px solid #eee; font-weight: bold;">💬 Query</td>
                  <td style="padding: 10px; background: #fff; border: 1px solid #eee;">${query}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; background: #fff; border: 1px solid #eee; font-weight: bold;">🕐 Time</td>
                  <td style="padding: 10px; background: #fff; border: 1px solid #eee;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
                </tr>
              </table>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">This email was sent from the Contact Us form on the Happy Star Satellite Vision website.</p>
            </div>`,
        });
        console.log(`[Legal] Enquiry email sent for ${name} (${phone})`);
    } catch (mailErr) {
        console.error('[Legal] Nodemailer error:', mailErr.message);
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
