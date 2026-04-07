import pool from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { db } = req.query;
    if (!db) return res.status(400).json({ message: 'Database name (db) is required' });

    try {
        const [rows] = await pool.query(`SHOW TABLES FROM ??`, [db]);
        // Safer way to access the column value regardless of the dynamic key
        const tables = rows.map(row => Object.values(row)[0]);

        res.status(200).json({ success: true, tables, database: db });
    } catch (error) {
        console.error('API /tables error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tables', error: error.message });
    }
}
