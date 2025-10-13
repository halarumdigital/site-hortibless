// Script para atualizar senha do admin em produção
// Execute com: node update-admin-password-prod.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  console.log('=== Atualizando senha do administrador ===\n');

  // Configuração do banco de dados de produção
  const config = {
    host: '85.31.60.98',
    port: 3306,
    user: 'horti_site',
    password: '0ZEtqllQNAsF',
    database: 'horti_site'
  };

  let connection;

  try {
    console.log('Conectando ao banco de dados...');
    console.log('Host:', config.host);
    console.log('Database:', config.database);

    connection = await mysql.createConnection(config);
    console.log('✓ Conectado com sucesso!\n');

    // Nova senha
    const newPassword = '@Arcano1987';
    console.log('Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✓ Hash gerado!\n');

    // Verificar se o usuário existe
    console.log('Verificando usuário admin...');
    const [users] = await connection.execute(
      'SELECT id, username, email, role FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length === 0) {
      console.log('✗ Usuário admin não encontrado!');
      return;
    }

    console.log('✓ Usuário encontrado:', users[0]);

    // Atualizar senha
    console.log('\nAtualizando senha...');
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );

    if (result.affectedRows > 0) {
      console.log('✓ Senha atualizada com sucesso!');
      console.log('\n=== Credenciais de Login ===');
      console.log('Usuário: admin');
      console.log('Senha: @Arcano1987');
      console.log('========================\n');

      // Verificar a senha
      const [updatedUsers] = await connection.execute(
        'SELECT password FROM users WHERE username = ?',
        ['admin']
      );

      const isValid = await bcrypt.compare(newPassword, updatedUsers[0].password);
      console.log('Validação da senha:', isValid ? '✓ OK' : '✗ ERRO');
    } else {
      console.log('✗ Nenhuma linha foi atualizada');
    }

  } catch (error) {
    console.error('\n✗ Erro:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Não foi possível conectar ao banco de dados. Verifique:');
      console.error('- O host e porta estão corretos');
      console.error('- O servidor MySQL está rodando');
      console.error('- As credenciais estão corretas');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Acesso negado. Verifique o usuário e senha do banco de dados.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConexão fechada.');
    }
  }
}

updateAdminPassword();
