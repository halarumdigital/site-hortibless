import fetch from 'node-fetch';

const webhookData = {
  "id": "evt_15e444ff9b9ab9ec29294aa1abe68025&10718149",
  "event": "PAYMENT_CONFIRMED",
  "dateCreated": "2025-10-09 19:35:36",
  "payment": {
    "object": "payment",
    "id": "pay_tcp4pgq0mdrxqhw0",
    "dateCreated": "2025-10-09",
    "customer": "cus_000007093192",
    "subscription": "sub_4s1qli6p8xo70jgc",
    "checkoutSession": null,
    "paymentLink": null,
    "value": 276,
    "netValue": 270.02,
    "originalValue": null,
    "interestValue": null,
    "description": "Assinatura semanal - Bella Day - Cesta Essência (Pequena)",
    "billingType": "CREDIT_CARD",
    "confirmedDate": "2025-10-09",
    "creditCard": {
      "creditCardNumber": "8829",
      "creditCardBrand": "MASTERCARD",
      "creditCardToken": "bc7bf741-afb9-4851-a416-491b9d06085c"
    },
    "pixTransaction": null,
    "status": "CONFIRMED",
    "dueDate": "2025-10-09",
    "originalDueDate": "2025-10-09",
    "paymentDate": null,
    "clientPaymentDate": "2025-10-09",
    "installmentNumber": null,
    "invoiceUrl": "https://sandbox.asaas.com/i/tcp4pgq0mdrxqhw0",
    "invoiceNumber": "11563553",
    "externalReference": null,
    "deleted": false,
    "anticipated": false,
    "anticipable": false,
    "creditDate": "2025-11-10",
    "estimatedCreditDate": "2025-11-10",
    "transactionReceiptUrl": "https://sandbox.asaas.com/comprovantes/8009303766127575",
    "nossoNumero": null,
    "bankSlipUrl": null,
    "lastInvoiceViewedDate": null,
    "lastBankSlipViewedDate": null,
    "discount": {
      "value": 0,
      "limitDate": null,
      "dueDateLimitDays": 0,
      "type": "FIXED"
    },
    "fine": {
      "value": 0,
      "type": "FIXED"
    },
    "interest": {
      "value": 0,
      "type": "PERCENTAGE"
    },
    "postalService": false,
    "escrow": null,
    "refunds": null
  }
};

async function testWebhook() {
  console.log('🧪 Testando webhook PAYMENT_CONFIRMED com assinatura...\n');

  try {
    const response = await fetch('http://localhost:5000/api/webhooks/asaas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const data = await response.json();

    console.log('📊 Status da resposta:', response.status);
    console.log('📦 Resposta do webhook:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Webhook processado com sucesso!');
    } else {
      console.log('❌ Webhook retornou erro:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro ao chamar webhook:', error.message);
  }
}

testWebhook();
