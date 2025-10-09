# Webhook Asaas - Documentação Completa

##  Webhook Corrigido!

O webhook agora suporta **eventos de assinatura** e **eventos de pagamento**.

## Eventos Suportados

### =Ë Assinaturas (tabela `orders`)
-  `SUBSCRIPTION_CREATED` - Assinatura criada
-  `SUBSCRIPTION_UPDATED` - Assinatura atualizada
-  `SUBSCRIPTION_DELETED` - Assinatura cancelada

### =³ Pagamentos (tabela `one_time_purchases`)
-  `PAYMENT_RECEIVED` - Pagamento recebido
-  `PAYMENT_CONFIRMED` - Pagamento confirmado
-  `PAYMENT_UPDATED` - Pagamento atualizado
-  `PAYMENT_DELETED` - Pagamento cancelado
-  `PAYMENT_REFUNDED` - Pagamento reembolsado

## Como Funciona

O webhook identifica automaticamente o tipo de evento:
- Se tem `subscription` ’ processa como assinatura na tabela `orders`
- Se tem `payment` ’ processa como pagamento na tabela `one_time_purchases`

## Exemplo de Resposta (Antes do Fix)

L **Erro 400**:
```json
{
  "success": false,
  "message": "Invalid webhook data"
}
```

## Exemplo de Resposta (Depois do Fix)

 **Sucesso 200**:
```json
{
  "success": true,
  "message": "Subscription webhook processed successfully"
}
```

## Teste o Webhook

```bash
curl --request POST \
     --url http://localhost:5000/api/webhooks/asaas \
     --header 'content-type: application/json' \
     --data '{
  "event": "SUBSCRIPTION_CREATED",
  "subscription": {
    "id": "sub_7hqldw8mgs2oauf5",
    "status": "ACTIVE",
    "customer": "cus_000007093203",
    "value": 109
  }
}'
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Subscription webhook processed successfully"
}
```
