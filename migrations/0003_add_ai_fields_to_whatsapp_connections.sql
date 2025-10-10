-- Add AI configuration fields to whatsapp_connections table
ALTER TABLE `whatsapp_connections`
ADD COLUMN `ai_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN `ai_model` VARCHAR(100) DEFAULT 'gpt-4o-mini',
ADD COLUMN `ai_temperature` VARCHAR(10) DEFAULT '0.7',
ADD COLUMN `ai_max_tokens` INT DEFAULT 1000,
ADD COLUMN `ai_prompt` TEXT;
