import pool from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { db, table } = req.query;
    if (!db) return res.status(400).json({ message: 'Database (db) is required' });

    try {
        let sqlDump = `-- God Mode SQL Dump\n`;
        sqlDump += `-- Database: ${db}\n`;
        sqlDump += `-- Generated: ${new Date().toISOString()}\n\n`;

        // If table === 'all', get all tables in db, otherwise just the specific table
        let targetTables = [];
        if (table === 'all') {
            const [tablesRes] = await pool.query(`SHOW TABLES FROM ??`, [db]);
            // Extract the table names from SHOW TABLES result which has dynamic keys like "Tables_in_dbname"
            targetTables = tablesRes.map(t => Object.values(t)[0]);
        } else if (table) {
            targetTables = [table];
        } else {
            return res.status(400).json({ message: 'Table is required (use "all" for whole DB)' });
        }

        for (const t of targetTables) {
            // 1. Get Table Schema
            const [showCreate] = await pool.query(`SHOW CREATE TABLE ??`, [`${db}.${t}`]);
            const createTableStmt = showCreate[0]['Create Table'] || showCreate[0]['Create View'];

            sqlDump += `-- --------------------------------------------------------\n`;
            sqlDump += `-- Table Structure for \`${t}\`\n`;
            sqlDump += `-- --------------------------------------------------------\n\n`;
            sqlDump += `DROP TABLE IF EXISTS \`${t}\`;\n`;
            sqlDump += `${createTableStmt};\n\n`;

            // 2. Map Rows to INSERT statements
            const [rows] = await pool.query(`SELECT * FROM ??`, [`${db}.${t}`]);

            if (rows.length > 0) {
                const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
                sqlDump += `-- Dumping data for table \`${t}\`\n`;
                sqlDump += `INSERT INTO \`${t}\` (${cols}) VALUES\n`;

                const valuesLines = rows.map((row, idx) => {
                    const mapped = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'number' || typeof val === 'boolean') return val;
                        // Escape strings safely
                        const escaped = String(val).replace(/'/g, "''").replace(/\\/g, "\\\\");
                        return `'${escaped}'`;
                    });
                    const isLast = idx === rows.length - 1;
                    return `(${mapped.join(', ')})${isLast ? ';' : ','}`;
                });

                sqlDump += valuesLines.join('\n') + '\n\n';
            }
        }

        res.setHeader('Content-Type', 'application/sql');
        const filename = table === 'all' ? `${db}.sql` : `${db}_${table}.sql`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(sqlDump);

    } catch (error) {
        console.error('API /manage/export error:', error);
        res.status(500).json({ success: false, message: 'Export failed', error: error.message });
    }
}
