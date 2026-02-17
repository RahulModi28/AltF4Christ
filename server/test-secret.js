require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = process.env.SUPABASE_ANON_KEY;
const secret = process.env.SUPABASE_JWT_SECRET;

console.log("Testing Secret:", secret);
console.log("Testing Token:", token.substring(0, 20) + "...");

try {
    const decoded = jwt.verify(token, secret);
    console.log("SUCCESS: Secret is valid!");
    console.log("Decoded:", decoded);
} catch (error) {
    console.error("FAILURE: Verification failed.");
    console.error("Error:", error.message);
}
