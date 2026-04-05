import pool from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { db, query } = req.body;
    if (!query) return res.status(400).json({ message: 'SQL Query is required' });

    try {
        // We get a connection to explicitly switch DBs for this query
        const connection = await pool.getConnection();

        try {
            if (db) await connection.query(`USE ??`, [db]);
            // Note: allowMultipleQueries is required if they paste a raw SQL dump with multiple statements!
            // But mysql2 pool doesn't allow multipleStatements by default for security.
            // We will execute it. If it fails due to multiple statements, they'll need to submit them one by one
            // or we must configure the pool specifically for this.
            const [result] = await connection.query(query);

            res.status(200).json({ success: true, message: 'Query executed successfully', result });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('API /manage/query error:', error);
        res.status(500).json({ success: false, message: 'Query execution failed', error: error.message });
    }
}
