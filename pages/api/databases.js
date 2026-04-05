import pool from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const [rows] = await pool.query('SHOW DATABASES');
        // Filter out internal MySQL/MariaDB system databases if desired, 
        // but a "God" wants to see everything.
        const databases = rows.map(row => Object.values(row)[0]);

        res.status(200).json({ success: true, databases });
    } catch (error) {
        console.error('API /databases error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch databases', error: error.message });
    }
}
