import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
// Ubah baris database menjadi seperti ini:
database: process.env.DB_NAME || null,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true, // Allow multiple statements for .sql imports
});

export default pool;
