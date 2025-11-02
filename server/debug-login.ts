import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugLogin() {
  console.log('=== DEBUG COMPLETO DO LOGIN ===\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST!,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
  });

  try {
    console.log('✓ Conectado ao banco de dados de PRODUÇÃO\n');

    // Listar TODOS os usuários
    const [allUsers] = await connection.execute(
      'SELECT id, name, email, username, role, is_active, created_at FROM users ORDER BY id'
    );

    console.log('=== TODOS OS USUÁRIOS NO BANCO ===');
    console.table(allUsers);
    console.log('');

    // Buscar especificamente o usuário "admin"
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );

    const users = rows as any[];

    if (users.length === 0) {
      console.log('✗ PROBLEMA: Usuário "admin" não existe!\n');
      return;
    }

    const user = users[0];

    console.log('=== DETALHES DO USUÁRIO "admin" ===');
    console.log('ID:', user.id);
    console.log('Nome:', user.name);
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('is_active (raw):', user.is_active, '(type:', typeof user.is_active + ')');
    console.log('is_active === 1:', user.is_active === 1);
    console.log('is_active === true:', user.is_active === true);
    console.log('Criado em:', user.created_at);
    console.log('Atualizado em:', user.updated_at);
    console.log('Hash da senha:', user.password.substring(0, 20) + '...');
    console.log('');

    // Testar TODAS as possíveis senhas
    const testPasswords = [
      '@Arcano1987',
      'admin',
      'admin123',
      'Admin@1987',
      '@arcano1987'  // minúscula
    ];

    console.log('=== TESTANDO SENHAS ===');
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`Senha "${pwd}": ${isValid ? '✓ VÁLIDA' : '✗ inválida'}`);
    }
    console.log('');

    // Verificar se is_active está correto
    if (user.is_active !== 1 && user.is_active !== true) {
      console.log('⚠️  ATENÇÃO: Campo is_active não está como 1 ou true!');
      console.log('Corrigindo...\n');

      await connection.execute(
        'UPDATE users SET is_active = 1 WHERE username = ?',
        ['admin']
      );

      console.log('✓ Campo is_active atualizado para 1\n');
    }

    // Simular a validação que o código faz
    console.log('=== SIMULAÇÃO DA VALIDAÇÃO DO CÓDIGO ===');
    const testPassword = '@Arcano1987';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    const isActive = user.is_active === 1 || user.is_active === true;

    console.log('1. Senha válida?', isPasswordValid ? '✓ SIM' : '✗ NÃO');
    console.log('2. Usuário ativo?', isActive ? '✓ SIM' : '✗ NÃO');
    console.log('3. Login deveria funcionar?', (isPasswordValid && isActive) ? '✓ SIM' : '✗ NÃO');
    console.log('');

    if (!isPasswordValid) {
      console.log('❌ PROBLEMA: Senha não confere!');
      console.log('Atualizando senha para: @Arcano1987\n');

      const hashedPassword = await bcrypt.hash('@Arcano1987', 10);
      await connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );

      console.log('✓ Senha atualizada com sucesso!\n');
    }

    if (!isActive) {
      console.log('❌ PROBLEMA: Usuário não está ativo!');
      console.log('Ativando usuário...\n');

      await connection.execute(
        'UPDATE users SET is_active = 1 WHERE username = ?',
        ['admin']
      );

      console.log('✓ Usuário ativado com sucesso!\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await connection.end();
    console.log('=== DEBUG CONCLUÍDO ===');
  }
}

debugLogin();
