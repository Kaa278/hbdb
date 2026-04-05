import pool from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Database name is required' });
        }

        // Basic sanitization
        const safeName = name.replace(/[^a-zA-Z0-9_]/g, '');
        if (!safeName) return res.status(400).json({ message: 'Invalid database name' });

        try {
            await pool.query(`CREATE DATABASE ??`, [safeName]);
            return res.status(201).json({ success: true, message: `Database ${safeName} created` });
        } catch (error) {
            console.error('API /manage/database POST error:', error);
            return res.status(500).json({ success: false, message: 'Failed to create database', error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Database name is required' });

        try {
            // WARNING: Destructive action
            await pool.query(`DROP DATABASE ??`, [name]);
            return res.status(200).json({ success: true, message: `Database ${name} dropped` });
        } catch (error) {
            console.error('API /manage/database DELETE error:', error);
            return res.status(500).json({ success: false, message: 'Failed to drop database', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
