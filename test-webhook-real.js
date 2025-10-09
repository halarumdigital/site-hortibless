// Script para testar webhook com um pedido real
// Execute: node test-webhook-real.js

const BASE_URL = process.env.BASE_URL || 'https://horti.gilliard.dev.br';

async function getPurchases() {
  console.log('🔍 Buscando pedidos...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/one-time-purchases`, {
      headers: {
        'Cookie': 'connect.sid=YOUR_SESSION_ID' // Você precisaria estar autenticado
      }
    });

    if (response.status === 401) {
      console.log('❌ Não autenticado. Você precisa:');
      console.log('   1. Fazer login no dashboard');
      console.log('   2. Copiar o cookie de sessão');
      console.log('   3. Substituir YOUR_SESSION_ID no script\n');
      console.log('📋 OU verificar diretamente no dashboard em /dashboard/pedidos\n');
      return null;
    }

    const data = await response.json();
    return data.purchases || [];
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error.message);
    return null;
  }
}

async function testWebhookWithRealPurchase() {
  console.log('🧪 Teste de Webhook com Pedido Real\n');
  console.log('📍 URL:', BASE_URL);
  console.log('═'.repeat(60));

  const purchases = await getPurchases();

  if (!purchases || purchases.length === 0) {
    console.log('\n⚠️  Nenhum pedido encontrado no banco de dados.');
    console.log('\n💡 Como testar:');
    console.log('   1. Faça uma compra pelo site');
    console.log('   2. Anote o Payment ID do Asaas');
    console.log('   3. Execute este teste novamente\n');

    console.log('🔧 Ou teste manualmente:');
    console.log('\ncurl -X POST ' + BASE_URL + '/api/webhooks/asaas \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{\n' +
                '    "event": "PAYMENT_RECEIVED",\n' +
                '    "payment": {\n' +
                '      "id": "SEU_PAYMENT_ID_AQUI",\n' +
                '      "status": "RECEIVED",\n' +
                '      "value": 100.00\n' +
                '    }\n' +
                '  }\'\n');
    return;
  }

  console.log(`\n✅ Encontrados ${purchases.length} pedido(s)\n`);

  // Mostrar os primeiros 3 pedidos
  purchases.slice(0, 3).forEach((p, index) => {
    console.log(`${index + 1}. Pedido #${p.id}`);
    console.log(`   Cliente: ${p.customerName}`);
    console.log(`   Status atual: ${p.status}`);
    console.log(`   Payment ID: ${p.asaasPaymentId || 'Não definido'}`);
    console.log(`   Método: ${p.paymentMethod}`);
    console.log('');
  });

  // Pegar o primeiro pedido com asaasPaymentId
  const purchaseToTest = purchases.find(p => p.asaasPaymentId);

  if (!purchaseToTest) {
    console.log('❌ Nenhum pedido possui asaasPaymentId');
    console.log('   Certifique-se de fazer uma compra pelo site primeiro\n');
    return;
  }

  console.log('═'.repeat(60));
  console.log('\n🎯 Testando webhook com pedido real:\n');
  console.log(`   Pedido ID: ${purchaseToTest.id}`);
  console.log(`   Payment ID: ${purchaseToTest.asaasPaymentId}`);
  console.log(`   Status atual: ${purchaseToTest.status}`);

  const webhookData = {
    event: 'PAYMENT_RECEIVED',
    payment: {
      id: purchaseToTest.asaasPaymentId,
      customer: purchaseToTest.asaasCustomerId,
      value: parseFloat(purchaseToTest.totalAmount || '0'),
      netValue: parseFloat(purchaseToTest.totalAmount || '0'),
      status: 'RECEIVED',
      billingType: purchaseToTest.paymentMethod?.toUpperCase() || 'PIX',
      confirmedDate: new Date().toISOString(),
      description: `Pedido #${purchaseToTest.id}`,
    }
  };

  console.log('\n📤 Enviando webhook...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/asaas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Test',
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();

    console.log(`✅ Status HTTP: ${response.status}`);
    console.log(`📦 Resposta:`, JSON.stringify(result, null, 2));

    if (response.status === 200) {
      console.log('\n🎉 SUCESSO! O webhook foi processado!');
      console.log('\n📝 Próximos passos:');
      console.log('   1. Verifique no dashboard se o status mudou para "Pago"');
      console.log('   2. Acesse: ' + BASE_URL + '/dashboard/pedidos');
      console.log('   3. Procure pelo pedido #' + purchaseToTest.id);
    }

  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error.message);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n💡 Para ver os logs do servidor:');
  console.log('   - Se usando PM2: pm2 logs');
  console.log('   - Se usando Docker: docker logs -f container-name');
  console.log('   - Se em desenvolvimento: npm run dev\n');
}

testWebhookWithRealPurchase().catch(console.error);
