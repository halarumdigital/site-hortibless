import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@shared/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST!,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  database: process.env.MYSQL_DATABASE!,
  charset: 'utf8mb4',
});

export const db = drizzle(connection, { schema, mode: 'default' });
export { connection };
