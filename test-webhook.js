// Script para testar o webhook do Asaas localmente
// Execute com: node test-webhook.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function testWebhook() {
  console.log('🧪 Testando Webhook do Asaas\n');
  console.log('📍 URL Base:', BASE_URL);
  console.log('═'.repeat(50));

  // Teste 1: GET endpoint de teste
  console.log('\n1️⃣ Testando GET /api/webhooks/asaas/test');
  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/asaas/test`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  // Teste 2: POST endpoint de teste
  console.log('\n2️⃣ Testando POST /api/webhooks/asaas/test');
  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/asaas/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teste: 'funcionando', timestamp: new Date().toISOString() })
    });
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  // Teste 3: Webhook principal com evento simulado
  console.log('\n3️⃣ Testando POST /api/webhooks/asaas (webhook principal)');
  const webhookData = {
    event: 'PAYMENT_RECEIVED',
    payment: {
      id: 'pay_test_' + Date.now(),
      customer: 'cus_test_123',
      value: 100.00,
      netValue: 95.00,
      status: 'RECEIVED',
      billingType: 'PIX',
      confirmedDate: new Date().toISOString(),
      description: 'Teste de webhook',
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/asaas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas',
      },
      body: JSON.stringify(webhookData)
    });
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  // Teste 4: Webhook com evento PAYMENT_CONFIRMED
  console.log('\n4️⃣ Testando evento PAYMENT_CONFIRMED');
  const confirmData = {
    event: 'PAYMENT_CONFIRMED',
    payment: {
      id: 'pay_test_' + Date.now(),
      customer: 'cus_test_456',
      value: 150.00,
      netValue: 142.50,
      status: 'CONFIRMED',
      billingType: 'BOLETO',
      confirmedDate: new Date().toISOString(),
      description: 'Teste de confirmação',
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/asaas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas',
      },
      body: JSON.stringify(confirmData)
    });
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ Testes concluídos!\n');
  console.log('💡 Dicas:');
  console.log('  - Verifique os logs do servidor para ver as mensagens detalhadas');
  console.log('  - Os testes acima simulam o que o Asaas enviaria');
  console.log('  - Se ver "Purchase not found", é normal - não há pedido real com esse ID');
  console.log('\n📝 Para usar em produção:');
  console.log('  BASE_URL=https://horti.gilliard.dev.br node test-webhook.js\n');
}

testWebhook().catch(console.error);
