ALTER TABLE `whatsapp_connections` ADD `instance_name` varchar(255);--> statement-breakpoint
ALTER TABLE `whatsapp_connections` ADD `status` varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `whatsapp_connections` ADD `qr_code` text;--> statement-breakpoint
ALTER TABLE `whatsapp_connections` ADD CONSTRAINT `whatsapp_connections_instance_name_unique` UNIQUE(`instance_name`);