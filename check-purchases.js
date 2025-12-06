import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { oneTimePurchases } from './shared/schema.ts';

// Criar conexão com o banco
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hortibless'
});

const db = drizzle(connection);

// Buscar todas as compras avulsas
const purchases = await db.select().from(oneTimePurchases).limit(10);

console.log('\n📦 COMPRAS AVULSAS NO BANCO DE DADOS:\n');
console.log('Total:', purchases.length, '\n');

purchases.forEach(p => {
  console.log('─────────────────────────────────────');
  console.log('ID:', p.id);
  console.log('Cliente:', p.customerName);
  console.log('Email:', p.customerEmail);
  console.log('Método:', p.paymentMethod);
  console.log('Status:', p.status);
  console.log('Asaas Customer ID:', p.asaasCustomerId || '❌ NÃO SALVO');
  console.log('Asaas Payment ID:', p.asaasPaymentId || '❌ NÃO SALVO');
  console.log('Criado em:', p.createdAt);
  console.log('');
});

await connection.end();
