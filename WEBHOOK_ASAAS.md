# Configuração do Webhook Asaas

Este documento explica como configurar o webhook do Asaas para receber notificações automáticas de pagamento e atualizar o status dos pedidos.

## 📋 Visão Geral

O webhook foi implementado para receber eventos do Asaas e automaticamente atualizar o status dos pedidos quando:
- Um pagamento é confirmado (PIX, Boleto, Cartão)
- Um pagamento é cancelado ou reembolsado
- O status de um pagamento muda

## 🔗 Endpoint do Webhook

```
POST https://seu-dominio.com/api/webhooks/asaas
```

**Nota:** Substitua `seu-dominio.com` pelo domínio real do seu site.

## ⚙️ Como Configurar no Painel Asaas

### 1. Acesse o Painel Asaas

- Acesse: https://www.asaas.com/login (produção) ou https://sandbox.asaas.com/login (sandbox)
- Faça login com suas credenciais

### 2. Configure o Webhook

1. No menu lateral, vá em **Configurações** > **Integrações** > **Webhooks**
2. Clique em **Novo Webhook**
3. Preencha os dados:

   - **URL de destino:** `https://seu-dominio.com/api/webhooks/asaas`
   - **Versão da API:** v3
   - **Email para notificações de erro:** seu-email@dominio.com
   - **Eventos para sincronização:**
     - ✅ PAYMENT_RECEIVED (Pagamento recebido)
     - ✅ PAYMENT_CONFIRMED (Pagamento confirmado)
     - ✅ PAYMENT_UPDATED (Pagamento atualizado)
     - ✅ PAYMENT_OVERDUE (Pagamento vencido)
     - ✅ PAYMENT_DELETED (Pagamento deletado)
     - ✅ PAYMENT_REFUNDED (Pagamento reembolsado)

4. Clique em **Salvar**

### 3. Teste o Webhook

Após configurar, você pode testar:

1. No painel do Asaas, vá para a página de webhooks
2. Clique em **Testar** no webhook criado
3. Selecione um evento de teste (ex: PAYMENT_RECEIVED)
4. Envie o teste
5. Verifique os logs do servidor para confirmar o recebimento

## 📊 Mapeamento de Eventos

O webhook mapeia os eventos do Asaas para os seguintes status internos:

| Evento Asaas | Status Interno | Descrição |
|-------------|---------------|-----------|
| `PAYMENT_RECEIVED` | `paid` | Pagamento recebido e confirmado |
| `PAYMENT_CONFIRMED` | `paid` | Pagamento confirmado |
| `PAYMENT_UPDATED` (status CONFIRMED/RECEIVED) | `paid` | Atualização confirmando pagamento |
| `PAYMENT_DELETED` | `cancelled` | Pagamento deletado |
| `PAYMENT_REFUNDED` | `cancelled` | Pagamento reembolsado |
| `PAYMENT_OVERDUE` | (mantém status atual) | Pagamento vencido |

## 📝 Logs e Monitoramento

O webhook gera logs detalhados para facilitar o monitoramento:

```
📩 Webhook Asaas recebido: { event, paymentId, status, value }
📦 Compra encontrada: { purchaseId, currentStatus, paymentMethod }
✅ Pagamento confirmado! Atualizando status para 'paid'
✅ Status atualizado com sucesso: { purchaseId, oldStatus, newStatus }
```

### Como Visualizar os Logs

1. Acesse o servidor via SSH
2. Execute: `npm run dev` ou visualize os logs do PM2/serviço
3. Os logs aparecerão no console em tempo real

## 🔒 Segurança

O webhook é público (não requer autenticação) pois o Asaas não envia tokens de autenticação customizados. Para aumentar a segurança:

1. **Validação de IP:** Configure o firewall para aceitar apenas IPs do Asaas
2. **Validação de dados:** O webhook valida que o evento e pagamento existem
3. **Verificação de pagamento:** Busca o pagamento no banco antes de processar

### IPs do Asaas (adicionar ao firewall)

Consulte a documentação oficial do Asaas para os IPs atualizados:
https://docs.asaas.com/reference/webhooks

## 🧪 Testando Localmente

Para testar o webhook localmente, você pode usar o **ngrok** ou **localtunnel**:

### Usando ngrok

```bash
# Instale o ngrok
npm install -g ngrok

# Execute seu servidor local
npm run dev

# Em outro terminal, crie um túnel
ngrok http 5000

# Use a URL gerada no painel Asaas
# Exemplo: https://abc123.ngrok.io/api/webhooks/asaas
```

### Testando Manualmente

Você pode testar manualmente enviando uma requisição POST:

```bash
curl -X POST https://seu-dominio.com/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_123456789",
      "status": "RECEIVED",
      "value": 100.00
    }
  }'
```

## 🐛 Troubleshooting

### Webhook não está sendo recebido

1. Verifique se a URL está correta e acessível publicamente
2. Confirme que o servidor está rodando
3. Verifique os logs do Asaas para erros de entrega
4. Teste a URL manualmente com curl

### Status não está sendo atualizado

1. Verifique os logs do servidor
2. Confirme que o `asaasPaymentId` está salvo corretamente no banco
3. Verifique se o evento está sendo mapeado corretamente

### Erros 404

- Certifique-se de que o endpoint está correto: `/api/webhooks/asaas`
- Verifique se o servidor está rodando e acessível

## 📚 Referências

- [Documentação oficial Asaas - Webhooks](https://docs.asaas.com/reference/webhooks)
- [Lista de eventos disponíveis](https://docs.asaas.com/reference/eventos-webhook)

## 🆘 Suporte

Para problemas relacionados ao webhook:
1. Verifique os logs do servidor
2. Consulte a documentação do Asaas
3. Entre em contato com o suporte técnico do Asaas

---

**Última atualização:** 2025-01-09
