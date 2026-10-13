/**
 * Pool de conexiones a la base de datos tienda_abarrotes (MySQL / MariaDB).
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PUERTO || 3306),
  user: process.env.DB_USUARIO || 'root',
  password: process.env.DB_CLAVE || '',
  database: process.env.DB_NOMBRE || 'tienda_abarrotes',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  decimalNumbers: true,
  dateStrings: true
});

module.exports = pool;
