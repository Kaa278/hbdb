import { signJWT, setTokenCookie } from '../../../lib/auth';

// In-memory store for failed attempts
// In a production multi-server environment, use Redis or a DB
const failedAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes lockout

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check for lockout
    const attemptData = failedAttempts.get(email);
    if (attemptData && attemptData.count >= MAX_ATTEMPTS) {
        const now = Date.now();
        if (now - attemptData.lastAttempt < LOCK_TIME) {
            const remainingMinutes = Math.ceil((LOCK_TIME - (now - attemptData.lastAttempt)) / 60000);
            return res.status(429).json({
                message: `Too many failed attempts. Account locked. Try again in ${remainingMinutes} minutes.`
            });
        } else {
            // Lock expired, reset
            failedAttempts.delete(email);
        }
    }

    // Direct comparison with env variables for a flexible setup
    const authUser = process.env.AUTH_USER || 'admin';
    const authPassword = process.env.AUTH_PASSWORD || 'admin123';

    if (email === authUser && password === authPassword) {
        // Success: Clear failed attempts
        failedAttempts.delete(email);

        // Generate JWT
        const token = await signJWT({
            id: 1,
            name: 'Administrator',
            email: authUser,
            role: 'admin',
        });

        // Set cookie
        setTokenCookie(res, token);

        return res.status(200).json({
            success: true,
            user: {
                id: 1,
                name: 'Administrator',
                email: authUser,
                role: 'admin',
            },
        });
    } else {
        // Failure: Increment counter
        const currentData = failedAttempts.get(email) || { count: 0 };
        const newData = {
            count: currentData.count + 1,
            lastAttempt: Date.now()
        };
        failedAttempts.set(email, newData);

        const remaining = MAX_ATTEMPTS - newData.count;
        const message = remaining > 0
            ? `Invalid credentials. ${remaining} attempts remaining.`
            : 'Invalid credentials. Account locked for 15 minutes.';

        return res.status(401).json({ message });
    }
}
