import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

async function testLogin() {
  console.log('=== Teste de Login Completo ===\n');

  try {
    // Teste 1: Conexão direta MySQL
    console.log('1. Testando conexão direta MySQL...');
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST!,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER!,
      password: process.env.MYSQL_PASSWORD!,
      database: process.env.MYSQL_DATABASE!,
    });

    const [rows] = await connection.execute(`
      SELECT id, name, email, username, password, role, is_active
      FROM users
      WHERE username = ?
    `, ['admin']);

    console.log('Usuário encontrado (MySQL direto):', rows);

    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0] as any;
      const testPassword = '@Arcano1987';
      const isMatchDirect = await bcrypt.compare(testPassword, user.password);
      console.log('Senha corresponde (MySQL direto)?', isMatchDirect ? 'SIM ✓' : 'NÃO ✗\n');
    }

    await connection.end();

    // Teste 2: Usando Drizzle ORM
    console.log('\n2. Testando com Drizzle ORM...');
    const [userDrizzle] = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);

    console.log('Usuário encontrado (Drizzle):', userDrizzle);

    if (userDrizzle) {
      const testPassword = '@Arcano1987';
      const isMatchDrizzle = await bcrypt.compare(testPassword, userDrizzle.password);
      console.log('Senha corresponde (Drizzle)?', isMatchDrizzle ? 'SIM ✓' : 'NÃO ✗');
      console.log('isActive:', userDrizzle.isActive);
    }

    // Teste 3: Testando com diferentes variações da senha
    console.log('\n3. Testando variações da senha...');
    const testPasswords = [
      '@Arcano1987',
      'admin',
      'admin123',
      '@arcano1987',
      'Arcano1987',
    ];

    for (const pwd of testPasswords) {
      const isMatch = await bcrypt.compare(pwd, userDrizzle.password);
      console.log(`  "${pwd}": ${isMatch ? 'SIM ✓' : 'NÃO ✗'}`);
    }

    console.log('\n=== Teste Concluído ===');

  } catch (error) {
    console.error('Erro no teste:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

testLogin();
