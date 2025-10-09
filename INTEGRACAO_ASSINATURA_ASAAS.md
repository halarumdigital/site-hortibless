# Integração de Assinatura com Asaas

## ⚠️ IMPORTANTE: Modelo de Cobrança

**A cobrança é SEMPRE MENSAL, independente da frequência de entrega!**

## Como funciona a assinatura

### 1. Valores e Cobrança

**Exemplo com Cesta de R$ 109,00:**

#### Frequência Semanal
- 📦 **Entregas**: 4 cestas por mês (toda semana)
- 💰 **Valor calculado**: R$ 109,00 × 4 = R$ 436,00
- ✅ Valor enviado ao Asaas: **R$ 436,00**
- ✅ Cycle: `MONTHLY` (cobrança mensal)
- 📅 **Cobrança**: R$ 436,00 **uma vez por mês**

#### Frequência Quinzenal
- 📦 **Entregas**: 2 cestas por mês (a cada 15 dias)
- 💰 **Valor calculado**: R$ 109,00 × 2 = R$ 218,00
- ✅ Valor enviado ao Asaas: **R$ 218,00**
- ✅ Cycle: `MONTHLY` (cobrança mensal)
- 📅 **Cobrança**: R$ 218,00 **uma vez por mês**

#### Frequência Mensal
- 📦 **Entregas**: 1 cesta por mês
- 💰 **Valor calculado**: R$ 109,00 × 1 = R$ 109,00
- ✅ Valor enviado ao Asaas: **R$ 109,00**
- ✅ Cycle: `MONTHLY` (cobrança mensal)
- 📅 **Cobrança**: R$ 109,00 **uma vez por mês**

### 2. Data da Primeira Cobrança

- ✅ **nextDueDate**: **Data atual (hoje)** - cobrança imediata
- ✅ **Cobranças seguintes**: Automaticamente todo mês na mesma data
- Exemplo:
  - Compra em 09/10/2025 → 1ª cobrança: 09/10/2025
  - 2ª cobrança: 09/11/2025
  - 3ª cobrança: 09/12/2025
  - E assim sucessivamente...

### 3. Estrutura da Requisição ao Asaas

```bash
# Exemplo: Assinatura SEMANAL (4 entregas/mês)
curl --request POST \
     --url https://api-sandbox.asaas.com/v3/subscriptions \
     --header 'accept: application/json' \
     --header 'access_token: $aact_hmlg_...' \
     --header 'content-type: application/json' \
     --data '{
  "customer": "cus_000123",
  "billingType": "CREDIT_CARD",
  "cycle": "MONTHLY",
  "value": 436.00,
  "nextDueDate": "2025-11-08",
  "description": "Assinatura semanal - João Silva - Cesta Harmonia",
  "creditCard": {
    "holderName": "JOAO SILVA",
    "number": "5162306219378829",
    "expiryMonth": "12",
    "expiryYear": "2028",
    "ccv": "318"
  },
  "creditCardHolderInfo": {
    "name": "João Silva",
    "email": "joao@email.com",
    "cpfCnpj": "12345678900",
    "postalCode": "12345678",
    "addressNumber": "100",
    "phone": "11999999999"
  }
}'
```

## Fluxo Completo

### 1. Cliente preenche o formulário no carrinho
- Dados pessoais (nome, CPF, email, WhatsApp)
- Endereço de cadastro e entrega
- Frequência da assinatura (semanal/quinzenal/mensal)
- Dados do cartão de crédito

### 2. Frontend envia requisição para `/api/orders`
```json
{
  "basketId": 1,
  "customerName": "João Silva",
  "customerEmail": "joao@email.com",
  "customerCpf": "12345678900",
  "customerWhatsapp": "11999999999",
  "customerAddress": "Rua Exemplo, 100 - Centro - São Paulo - CEP: 12345-678",
  "deliveryAddress": "Rua Exemplo, 100 - Centro - São Paulo - CEP: 12345-678",
  "frequency": "mensal",
  "totalAmount": "109.00",
  "cardNumber": "5162306219378829",
  "cardName": "JOAO SILVA",
  "cardExpiry": "12/2028",
  "cardCvv": "318"
}
```

### 3. Backend processa (routes.ts)
1. ✅ Busca informações da cesta no banco
2. ✅ Extrai endereço (rua, número, CEP, bairro)
3. ✅ Busca ou cria cliente no Asaas pelo CPF
4. ✅ Mapeia frequência para cycle do Asaas
5. ✅ Calcula nextDueDate (hoje + 30 dias)
6. ✅ Pega valor unitário da cesta (`basket.priceSubscription`)
7. ✅ Cria assinatura no Asaas com cartão
8. ✅ Salva pedido no banco com IDs do Asaas

### 4. Resposta de sucesso
```json
{
  "success": true,
  "message": "Assinatura criada com sucesso!",
  "order": {
    "id": 1,
    "status": "active",
    "frequency": "mensal"
  }
}
```

## Campos no Banco de Dados

### Tabela `orders`
- `asaas_customer_id`: ID do cliente no Asaas (ex: "cus_000123")
- `asaas_subscription_id`: ID da assinatura no Asaas (ex: "sub_000456")
- `status`: Status do pedido
  - `pending`: Aguardando confirmação
  - `active`: Assinatura ativa
  - `cancelled`: Assinatura cancelada

## Interface do Cliente

### Resumo do Pedido
```
Valor por entrega:     R$ 109,00
Periodicidade:         mensal
Entregas por mês:      1x
─────────────────────────────
Total Mensal:          R$ 109,00

ℹ️ Como funciona:
Você será cobrado R$ 109,00 a cada entrega (mensal).
Será 1 cobrança por mês.

💳 Pagamento Recorrente
O valor será cobrado mensalmente no cartão cadastrado
de acordo com a periodicidade escolhida.
```

## Importante

⚠️ **O valor enviado ao Asaas é sempre o valor UNITÁRIO da cesta**, não o total mensal!

- ❌ Errado: Enviar R$ 436,00 para assinatura semanal
- ✅ Correto: Enviar R$ 109,00 com cycle WEEKLY

O Asaas se encarrega de cobrar automaticamente de acordo com o cycle escolhido.

## Testes

### Cartões de teste (sandbox)
```
Aprovado:
Número: 5162 3062 1937 8829
Nome: QUALQUER NOME
Validade: qualquer data futura
CVV: 318

Recusado:
Número: 5184 0190 7159 5770
Nome: QUALQUER NOME
Validade: qualquer data futura
CVV: 508
```

### Exemplo de teste via cURL
```bash
curl --request POST \
     --url http://localhost:5000/api/orders \
     --header 'content-type: application/json' \
     --data '{
  "basketId": 1,
  "customerName": "Teste Cliente",
  "customerEmail": "teste@email.com",
  "customerCpf": "12345678900",
  "customerWhatsapp": "11999999999",
  "customerAddress": "Rua Teste, 100 - Centro - São Paulo - CEP: 12345-678",
  "deliveryAddress": "Rua Teste, 100 - Centro - São Paulo - CEP: 12345-678",
  "frequency": "mensal",
  "totalAmount": "109.00",
  "cardNumber": "5162306219378829",
  "cardName": "TESTE CLIENTE",
  "cardExpiry": "12/2028",
  "cardCvv": "318"
}'
```
