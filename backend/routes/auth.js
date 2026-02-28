const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

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

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
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

// POST /api/auth/seed-admin  (Run once to create default admin)
router.post('/seed-admin', async (req, res) => {
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
