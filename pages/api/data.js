import pool from '../../lib/db';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
    const { db, table } = req.query;
    if (!db || !table) return res.status(400).json({ message: 'Database (db) and Table (table) names are required' });

    const identifiers = [`${db}.${table}`];

    // Helper to hash passwords if present
    const hashPasswords = async (data) => {
        const processed = { ...data };
        for (const key of Object.keys(processed)) {
            if (key.toLowerCase().includes('password') && typeof processed[key] === 'string' && processed[key].length > 0) {
                // Only hash if it's not already a hash (starts with $2b$ or $2a$)
                if (!processed[key].startsWith('$2b$') && !processed[key].startsWith('$2a$')) {
                    processed[key] = await bcrypt.hash(processed[key], 10);
                }
            }
        }
        return processed;
    };

    // --- GET: Fetch Rows ---
    if (req.method === 'GET') {
        try {
            const [rows] = await pool.query(`SELECT * FROM ?? LIMIT 100`, identifiers);
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Select error', error: error.message });
        }
    }

    // --- POST: Insert Row ---
    if (req.method === 'POST') {
        try {
            const dataToInsert = await hashPasswords(req.body);
            const [result] = await pool.query(`INSERT INTO ?? SET ?`, [identifiers[0], dataToInsert]);
            return res.status(201).json({ success: true, message: 'Inserted successfully', id: result.insertId });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Insert error', error: error.message });
        }
    }

    // --- PUT: Update Row ---
    if (req.method === 'PUT') {
        let { id, pk_field, ...data } = req.body;
        if (!id || !pk_field) return res.status(400).json({ message: 'ID and Primary Key field name are required' });
        try {
            data = await hashPasswords(data);
            const [result] = await pool.query(`UPDATE ?? SET ? WHERE ?? = ?`, [identifiers[0], data, pk_field, id]);
            return res.status(200).json({ success: true, message: 'Updated successfully', affected: result.affectedRows });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Update error', error: error.message });
        }
    }

    // --- DELETE: Remove Row ---
    if (req.method === 'DELETE') {
        const { id, pk_field } = req.body;
        if (!id || !pk_field) return res.status(400).json({ message: 'ID and Primary Key field name are required' });
        try {
            const [result] = await pool.query(`DELETE FROM ?? WHERE ?? = ?`, [identifiers[0], pk_field, id]);
            return res.status(200).json({ success: true, message: 'Deleted successfully', affected: result.affectedRows });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Delete error', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
