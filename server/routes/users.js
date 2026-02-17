const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authenticateUser = require('../middleware/auth');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/users/profile
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.sub;

        // Get user details
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // Get uploads
        const { data: uploads, error: uploadsError } = await supabase
            .from('resources')
            .select('*')
            .eq('uploaded_by', userId)
            .order('created_at', { ascending: false });

        if (uploadsError) throw uploadsError;

        res.json({ ...user, uploads });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('name, points, branch, year')
            .order('points', { ascending: false })
            .limit(10);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
