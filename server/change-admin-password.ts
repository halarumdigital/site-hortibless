import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function changeAdminPassword() {
  console.log('Connecting to MySQL...');
  console.log('Host:', process.env.MYSQL_HOST);
  console.log('Database:', process.env.MYSQL_DATABASE);

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST!,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
  });

  try {
    console.log('Changing admin password...');

    const newPassword = '@Arcano1987';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await connection.execute(`
      UPDATE users
      SET password = ?
      WHERE username = 'admin'
    `, [hashedPassword]);

    console.log('Admin password changed successfully!');
    console.log('Username: admin');
    console.log('New Password: @Arcano1987');
    console.log('Result:', result);

  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

changeAdminPassword();
