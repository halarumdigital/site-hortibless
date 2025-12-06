import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkLogin() {
  console.log('=== Verificando Login ===\n');
  console.log('Conectando ao banco de dados...');
  console.log('Host:', process.env.MYSQL_HOST);
  console.log('Database:', process.env.MYSQL_DATABASE);
  console.log('User:', process.env.MYSQL_USER);
  console.log('');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST!,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
  });

  try {
    console.log('✓ Conectado ao banco de dados!\n');

    // Verificar se a tabela users existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );

    if ((tables as any[]).length === 0) {
      console.log('✗ Tabela "users" não existe!');
      return;
    }

    console.log('✓ Tabela "users" existe\n');

    // Buscar o usuário admin
    const [rows] = await connection.execute(
      'SELECT id, name, email, username, password, role, is_active FROM users WHERE username = ?',
      ['admin']
    );

    const users = rows as any[];

    if (users.length === 0) {
      console.log('✗ Usuário "admin" não encontrado no banco de dados!');
      console.log('Criando usuário admin...\n');

      const hashedPassword = await bcrypt.hash('@Arcano1987', 10);

      await connection.execute(
        'INSERT INTO users (name, email, username, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['Administrador', 'admin@hortibless.com', 'admin', hashedPassword, 'admin', true]
      );

      console.log('✓ Usuário admin criado com sucesso!');
      console.log('Username: admin');
      console.log('Password: @Arcano1987\n');
      return;
    }

    const user = users[0];
    console.log('✓ Usuário "admin" encontrado:');
    console.log('  ID:', user.id);
    console.log('  Nome:', user.name);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Ativo:', user.is_active === 1 ? 'Sim' : 'Não');
    console.log('');

    // Testar senha fornecida
    const testPassword = '@Arcano1987';
    console.log(`Testando senha: ${testPassword}`);

    const isValid = await bcrypt.compare(testPassword, user.password);

    if (isValid) {
      console.log('✓ Senha CORRETA! O login deve funcionar.\n');
    } else {
      console.log('✗ Senha INCORRETA!\n');
      console.log('Atualizando senha para: @Arcano1987...');

      const hashedPassword = await bcrypt.hash(testPassword, 10);

      await connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );

      console.log('✓ Senha atualizada com sucesso!\n');

      // Verificar novamente
      const [updatedRows] = await connection.execute(
        'SELECT password FROM users WHERE username = ?',
        ['admin']
      );

      const updatedUser = (updatedRows as any[])[0];
      const isNowValid = await bcrypt.compare(testPassword, updatedUser.password);

      if (isNowValid) {
        console.log('✓ Verificação: Senha atualizada corretamente!');
      } else {
        console.log('✗ ERRO: Senha não foi atualizada corretamente!');
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await connection.end();
    console.log('\n=== Verificação concluída ===');
  }
}

checkLogin();
