-- Add Asaas integration fields to orders table
ALTER TABLE orders
ADD COLUMN asaas_customer_id VARCHAR(255),
ADD COLUMN asaas_subscription_id VARCHAR(255);
