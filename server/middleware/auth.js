const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
        console.error("SUPABASE_JWT_SECRET is not set");
        return res.status(500).json({ error: "Internal Server Error" });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        console.error("Used Secret:", secret.substring(0, 5) + "...");
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = authenticateUser;
