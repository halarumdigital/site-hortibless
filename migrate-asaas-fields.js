import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function migrate() {
  console.log('🔄 Iniciando migração...');

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Verificar se as colunas já existem
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM orders LIKE 'asaas_%'`
    );

    if (columns.length > 0) {
      console.log('✅ Colunas já existem no banco de dados!');
      await connection.end();
      return;
    }

    console.log('📝 Adicionando colunas asaas_customer_id e asaas_subscription_id...');

    await connection.query(`
      ALTER TABLE orders
      ADD COLUMN asaas_customer_id VARCHAR(255),
      ADD COLUMN asaas_subscription_id VARCHAR(255)
    `);

    console.log('✅ Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate()
  .then(() => {
    console.log('✨ Pronto! Você pode reiniciar o servidor agora.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });
