const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    // Trim username only — passwords must arrive completely unmodified for bcrypt.compare
    const username = (req.body.username || '').trim();
    const password = req.body.password;   // raw value — do NOT trim

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Fetch admin from Supabase
        const { data: admin, error } = await supabase
            .from('admin')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !admin) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Compare plaintext password against stored bcrypt hash
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.warn(`[Auth] Password mismatch for username: "${username}"`);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, username: admin.username });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// POST /api/auth/logout  (stateless JWT — client just drops the token)
router.post('/logout', (req, res) => {
    // With stateless JWTs there's nothing to invalidate server-side.
    // The client is responsible for deleting the token from localStorage.
    res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me — verify token & return admin identity (used by frontend on page load)
router.get('/me', auth, (req, res) => {
    // If we reach here the auth middleware already verified the token.
    res.json({ id: req.admin.id, username: req.admin.username });
});

// POST /api/auth/seed-admin  ← PROTECTED: only an existing admin can call this
// Useful for resetting the admin password via admin panel in the future.
router.post('/seed-admin', auth, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('admin@123', 10);
        const { data, error } = await supabase
            .from('admin')
            .insert([{ username: 'admin', password: hashedPassword }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json({ message: 'Admin seeded successfully.', admin: { id: data[0].id, username: data[0].username } });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
