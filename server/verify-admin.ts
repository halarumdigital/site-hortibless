import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function verifyAdmin() {
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
    console.log('\n=== Verificando usuário admin ===\n');

    const [rows] = await connection.execute(`
      SELECT id, name, email, username, password, role, is_active
      FROM users
      WHERE username = 'admin'
    `);

    console.log('Usuário encontrado:', rows);

    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0] as any;
      console.log('\nDados do usuário:');
      console.log('ID:', user.id);
      console.log('Nome:', user.name);
      console.log('Email:', user.email);
      console.log('Username:', user.username);
      console.log('Role:', user.role);
      console.log('Ativo:', user.is_active);
      console.log('Hash da senha:', user.password);

      // Testar senha
      const testPassword = '@Arcano1987';
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('\n=== Teste de senha ===');
      console.log('Senha testada:', testPassword);
      console.log('Senha corresponde?', isMatch ? 'SIM ✓' : 'NÃO ✗');

      if (!isMatch) {
        console.log('\n=== Atualizando senha novamente ===');
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        await connection.execute(`
          UPDATE users
          SET password = ?
          WHERE username = 'admin'
        `, [hashedPassword]);
        console.log('Senha atualizada com sucesso!');
        console.log('Novo hash:', hashedPassword);
      }
    } else {
      console.log('Usuário admin não encontrado!');
    }

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

verifyAdmin();
