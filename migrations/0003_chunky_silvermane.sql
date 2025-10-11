ALTER TABLE `contact_info` ADD `linkedin` varchar(255);--> statement-breakpoint
ALTER TABLE `whatsapp_connections` ADD `ai_enabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `whatsapp_connections` ADD `ai_model` varchar(100) DEFAULT 'gpt-4o-mini';--> statement-breakpoint
ALTER TABLE `whatsapp_connections` ADD `ai_temperature` varchar(10) DEFAULT '0.7';--> statement-breakpoint
ALTER TABLE `whatsapp_connections` ADD `ai_max_tokens` int DEFAULT 1000;--> statement-breakpoint
ALTER TABLE `whatsapp_connections` ADD `ai_prompt` text;