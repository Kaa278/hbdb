import { verifyJWT } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await verifyJWT(token);

    if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    return res.status(200).json({ success: true, user });
}
