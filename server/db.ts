import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@shared/schema';
import * as dotenv from 'dotenv';

dotenv.config();

// Criar pool de conexões ao invés de conexão única
// Isso resolve o problema de conexão que expira após 8-24 horas
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST!,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  database: process.env.MYSQL_DATABASE!,
  charset: 'utf8mb4',
  // Configurações do pool
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  // Keep-alive para evitar timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Timeout configurations
  connectTimeout: 60000, // 60 segundos para conectar
  // Evitar que conexões fiquem idle muito tempo
  idleTimeout: 60000, // 60 segundos idle
  maxIdle: 5, // Máximo de conexões idle
});

// Testar conexão no startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL pool connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL pool connection failed:', err.message);
  });

export const db = drizzle(pool, { schema, mode: 'default' });
export { pool as connection };
