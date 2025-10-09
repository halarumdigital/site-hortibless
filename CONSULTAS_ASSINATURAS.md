# Consultas de Assinaturas

## Ver todas as assinaturas criadas

```sql
SELECT
  id,
  customer_name AS nome_cliente,
  customer_email AS email,
  customer_cpf AS cpf,
  frequency AS frequencia,
  total_amount AS valor_total,
  status,
  asaas_customer_id,
  asaas_subscription_id,
  created_at AS criado_em,
  updated_at AS atualizado_em
FROM orders
WHERE asaas_subscription_id IS NOT NULL
ORDER BY created_at DESC;
```

## Ver assinaturas ativas

```sql
SELECT
  id,
  customer_name AS nome_cliente,
  customer_email AS email,
  frequency AS frequencia,
  total_amount AS valor,
  status,
  asaas_subscription_id,
  created_at AS criado_em
FROM orders
WHERE status = 'active'
  AND asaas_subscription_id IS NOT NULL
ORDER BY created_at DESC;
```

## Ver assinaturas pendentes

```sql
SELECT
  id,
  customer_name AS nome_cliente,
  customer_email AS email,
  frequency AS frequencia,
  total_amount AS valor,
  status,
  asaas_subscription_id,
  created_at AS criado_em
FROM orders
WHERE status = 'pending'
  AND asaas_subscription_id IS NOT NULL
ORDER BY created_at DESC;
```

## Ver detalhes completos de uma assinatura

```sql
SELECT
  o.*,
  b.name AS basket_name,
  b.description AS basket_description,
  b.price_subscription AS basket_price
FROM orders o
LEFT JOIN baskets b ON o.basket_id = b.id
WHERE o.id = ?;  -- Substituir ? pelo ID do pedido
```

## Contar assinaturas por status

```sql
SELECT
  status,
  COUNT(*) AS quantidade
FROM orders
WHERE asaas_subscription_id IS NOT NULL
GROUP BY status;
```

## Contar assinaturas por frequência

```sql
SELECT
  frequency AS frequencia,
  COUNT(*) AS quantidade,
  SUM(CAST(total_amount AS DECIMAL(10,2))) AS valor_total
FROM orders
WHERE asaas_subscription_id IS NOT NULL
GROUP BY frequency;
```

## Ver últimas 10 assinaturas criadas

```sql
SELECT
  id,
  customer_name,
  customer_email,
  frequency,
  total_amount,
  status,
  created_at
FROM orders
WHERE asaas_subscription_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## Buscar assinatura por CPF

```sql
SELECT
  id,
  customer_name,
  customer_email,
  customer_cpf,
  frequency,
  total_amount,
  status,
  asaas_customer_id,
  asaas_subscription_id,
  created_at
FROM orders
WHERE customer_cpf = '12345678900'  -- Substituir pelo CPF
  AND asaas_subscription_id IS NOT NULL
ORDER BY created_at DESC;
```

## Buscar assinatura por ID do Asaas

```sql
SELECT *
FROM orders
WHERE asaas_subscription_id = 'sub_000456'  -- Substituir pelo ID do Asaas
LIMIT 1;
```

## Ver endereços de entrega das assinaturas ativas

```sql
SELECT
  id,
  customer_name,
  delivery_address,
  frequency,
  status
FROM orders
WHERE status = 'active'
  AND asaas_subscription_id IS NOT NULL
ORDER BY customer_name;
```

## Exemplo de resultado

```
+----+----------------+-------------------+-------------+-----------+-------------+--------+
| id | nome_cliente   | email             | frequencia  | valor     | status      | criado |
+----+----------------+-------------------+-------------+-----------+-------------+--------+
| 1  | João Silva     | joao@email.com    | mensal      | 109.00    | active      | 2025.. |
| 2  | Maria Santos   | maria@email.com   | semanal     | 109.00    | active      | 2025.. |
| 3  | Pedro Costa    | pedro@email.com   | quinzenal   | 109.00    | pending     | 2025.. |
+----+----------------+-------------------+-------------+-----------+-------------+--------+
```

## Via Dashboard Admin

Você também pode ver as assinaturas acessando:

```
http://localhost:5000/dashboard/orders
```

Lá você terá acesso a:
- 📋 Lista de todos os pedidos/assinaturas
- 🔍 Detalhes de cada assinatura
- 📊 Status atual (pending, active, cancelled)
- 💳 Informações de pagamento
- 🔗 Links para o Asaas (usando os IDs salvos)
