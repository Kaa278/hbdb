import { signJWT, setTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Direct comparison with env variables for a flexible setup
    // Fallback to defaults if env not set
    const authUser = process.env.AUTH_USER || 'admin';
    const authPassword = process.env.AUTH_PASSWORD || 'admin123';

    if (email === authUser && password === authPassword) {
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
        return res.status(401).json({ message: 'Invalid credentials' });
    }
}
