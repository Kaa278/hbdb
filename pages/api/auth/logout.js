import { removeTokenCookie } from '../../../lib/auth';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    removeTokenCookie(res);

    return res.status(200).json({ success: true });
}
