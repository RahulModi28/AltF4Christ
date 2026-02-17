const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authenticateUser = require('../middleware/auth');
const dotenv = require('dotenv');

dotenv.config();

// Supabase Admin Client for Backend (Service Role to bypass RLS if needed, but here we use RLS with user token usually)
// However, since we are doing metadata insertion via backend, we can use the service role key to write to DB freely,
// and trust the metadata coming from our auth middleware/frontend.
// OR we can pass the user's JWT specific client. 
// For Hackathon, let's use the SERVICE_KEY for database operations to ensure permissions,
// checking req.user.sub for ownership.
// Actually, using the ANON key with the user's access token is the most "Supabase" way.
// But since we are in Node environment, let's use the service role key for simplicity in admin tasks
// but valid permissions.
// WAIT: The prompt says "Backend verifies Supabase JWT using the SUPABASE_JWT_SECRET on protected routes."
// So we know who the user is from `req.user`.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
// Better to use Service Role key for backend operations if we want to bypass RLS or Manage it manually.
// But let's stick to standard postgres query via supabase-js or just use the client.

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/resources
router.get('/', async (req, res) => {
    try {
        const { subject, branch, semester, category, search } = req.query;

        let query = supabase
            .from('resources')
            .select(`
                *,
                users:uploaded_by (name)
            `)
            .order('created_at', { ascending: false });

        if (subject) query = query.ilike('subject', `%${subject}%`);
        if (branch) query = query.eq('branch', branch);
        if (semester) query = query.eq('semester', semester);
        if (category) query = query.eq('category', category);
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

        const { data, error } = await query;

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/resources
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { title, description, file_url, file_type, subject, branch, semester, year, category, tags } = req.body;
        const userId = req.user.sub; // From JWT

        // 1. Insert Resource
        const { data, error } = await supabase
            .from('resources')
            .insert([{
                title,
                description,
                file_url,
                file_type,
                subject,
                branch,
                semester,
                year,
                category,
                tags,
                uploaded_by: userId
            }])
            .select();

        if (error) throw error;

        // 2. Award Points (10 points)
        // We can do this via trigger or backend call. Let's do backend call.
        const { error: pointsError } = await supabase.rpc('increment_points', { user_id: userId, points_to_add: 10 });
        // NOTE: We haven't created this RPC yet. Alternatively, update directly.
        // Direct update:
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('points')
            .eq('id', userId)
            .single();

        if (!userError) {
            await supabase
                .from('users')
                .update({ points: (userData.points || 0) + 10 })
                .eq('id', userId);
        }

        res.status(201).json(data[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/resources/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('resources')
            .select(`*, users:uploaded_by (name)`)
            .eq('id', id)
            .single();

        if (error) return res.status(404).json({ error: 'Not found' });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/resources/:id/download
router.get('/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        // Increment download count
        // Need to find current count first or use RPC
        const { data, error } = await supabase.from('resources').select('download_count, file_url').eq('id', id).single();

        if (error) return res.status(404).json({ error: 'Not found' });

        await supabase.from('resources').update({ download_count: data.download_count + 1 }).eq('id', id);

        res.json({ file_url: data.file_url });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


// POST /api/resources/:id/rate
router.post('/:id/rate', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        const userId = req.user.sub;

        if (value < 1 || value > 5) return res.status(400).json({ error: 'Invalid rating' });

        // 1. Check if already rated
        // The unique constraint in DB handles this, but let's be nice
        const { error: checkError } = await supabase
            .from('ratings')
            .insert([{ resource_id: id, user_id: userId, value }])
            .single();

        if (checkError) {
            if (checkError.code === '23505') return res.status(400).json({ error: 'Already rated' });
            throw checkError;
        }

        // 2. Award Points to Uploader (2 points)
        // a. Get uploader id
        const { data: resource, error: resError } = await supabase.from('resources').select('uploaded_by').eq('id', id).single();
        if (resource) {
            const uploaderId = resource.uploaded_by;
            // Don't award points if rating own resource? optional logic.
            if (uploaderId !== userId) {
                const { data: userData } = await supabase.from('users').select('points').eq('id', uploaderId).single();
                await supabase.from('users').update({ points: (userData?.points || 0) + 2 }).eq('id', uploaderId);
            }
        }

        // 3. Update Average Rating
        // Calculate new average
        const { data: ratings } = await supabase.from('ratings').select('value').eq('resource_id', id);
        const avg = ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;

        await supabase.from('resources').update({ average_rating: avg }).eq('id', id);

        res.json({ message: 'Rated successfully', new_average: avg });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
