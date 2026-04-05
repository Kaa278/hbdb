import pool from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { db, tableName, columns } = req.body;
        if (!db || !tableName || !Array.isArray(columns) || columns.length === 0) {
            return res.status(400).json({ message: 'Database, tableName, and columns array are required' });
        }

        const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
        try {
            const colDefs = columns.map(col => {
                const safeName = col.name.replace(/[^a-zA-Z0-9_]/g, '');
                let def = `\`${safeName}\` ${col.type}`;
                if (col.length) def += `(${parseInt(col.length)})`;
                if (!col.nullable) def += ' NOT NULL';
                if (col.autoIncrement) def += ' AUTO_INCREMENT';
                if (col.primaryKey) def += ' PRIMARY KEY';
                return def;
            });
            const query = `CREATE TABLE \`${db}\`.\`${safeTableName}\` (${colDefs.join(', ')})`;
            await pool.query(query);
            return res.status(201).json({ success: true, message: `Table ${safeTableName} created in ${db}` });
        } catch (error) {
            console.error('API /manage/table POST error:', error);
            return res.status(500).json({ success: false, message: 'Failed to create table', error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        const { db, tableName } = req.body;
        if (!db || !tableName) {
            return res.status(400).json({ message: 'Database and Table name are required' });
        }

        try {
            // WARNING: Destructive action
            await pool.query(`DROP TABLE \`${db}\`.\`${tableName}\``);
            return res.status(200).json({ success: true, message: `Table ${tableName} dropped from ${db}` });
        } catch (error) {
            console.error('API /manage/table DELETE error:', error);
            return res.status(500).json({ success: false, message: 'Failed to drop table', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
