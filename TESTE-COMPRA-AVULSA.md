# Como Testar a Criação de Cliente no Asaas

## 1. Iniciar o Servidor

```bash
npm run dev
```

## 2. Acessar a Página de Compra Avulsa

Abra no navegador:
```
http://localhost:5000/compra-avulsa?basketId=1
```

## 3. Preencher o Formulário

**Dados Pessoais:**
- Nome: João Silva Teste
- CPF: 12345678900 (use um CPF diferente para criar novo cliente)
- Email: joao.teste@email.com
- WhatsApp: (11) 98765-4321

**Endereço:**
- Rua: Rua dos Testes
- Número: 999
- CEP: 01234-567
- Bairro: Centro
- Cidade: São Paulo
- Referência: Próximo ao mercado

**Endereço de Entrega:**
- [x] Mesmo endereço de cadastro

**Forma de Pagamento:**
- Selecione: PIX (mais fácil para testar)

## 4. Finalizar Compra

Clique em "Finalizar Compra"

## 5. Verificar Logs no Terminal

Você verá algo assim:

```
🔍 Verificando cliente no Asaas...
👤 Cliente não encontrado. Criando novo cliente...
📝 Criando cliente no Asaas: João Silva Teste
✅ Cliente criado no Asaas: cus_000007093105
📱 Gerando PIX...
💳 Criando cobrança no Asaas: PIX
✅ Pagamento criado no Asaas: pay_123456789
```

## 6. Verificar no Banco de Dados

```sql
SELECT
  id,
  customer_name,
  customer_email,
  asaas_customer_id,
  asaas_payment_id,
  payment_method,
  status,
  created_at
FROM one_time_purchases
ORDER BY created_at DESC
LIMIT 1;
```

Deve retornar:
```
id: 1
customer_name: João Silva Teste
customer_email: joao.teste@email.com
asaas_customer_id: cus_000007093105  ← ID DO CLIENTE CRIADO NO ASAAS
asaas_payment_id: pay_123456789      ← ID DO PAGAMENTO NO ASAAS
payment_method: pix
status: pending
created_at: 2025-10-09 ...
```

## 7. Verificar no Painel do Asaas

Acesse: https://sandbox.asaas.com

Vá em:
- **Clientes** → Encontre "João Silva Teste"
- **Cobranças** → Encontre o PIX gerado

---

## ✅ Confirmação de Funcionamento

Se você viu os logs acima e o registro no banco com `asaas_customer_id` preenchido,
significa que **o cliente FOI CRIADO no Asaas com sucesso!**

## 🔍 Como Verificar se Cliente Já Existe

Se você usar o mesmo CPF duas vezes, verá:

```
🔍 Verificando cliente no Asaas...
✅ Cliente já existe no Asaas: cus_000007093104
📱 Gerando PIX...
```

Isso significa que **NÃO criou duplicata** - reutilizou o cliente existente! ✅
