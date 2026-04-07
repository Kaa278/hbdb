import pool from '../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { db, table } = req.query;
    if (!db || !table) return res.status(400).json({ message: 'Database (db) and Table (table) names are required' });

    try {
        // We use DESCRIBE on the specified table in the specified DB
        // Use nested array for multipart identifiers [db, table] -> `db`.`table`
        const [columns] = await pool.query(`DESCRIBE ??`, [[db, table]]);
        res.status(200).json({ success: true, columns, database: db, table });
    } catch (error) {
        console.error('API /schema error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch schema', error: error.message });
    }
}
