CREATE TABLE `whatsapp_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsapp_connections_phone_number_unique` UNIQUE(`phone_number`)
);
