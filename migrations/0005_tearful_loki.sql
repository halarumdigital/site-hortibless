CREATE TABLE `product_portfolio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`image_path` varchar(500) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_portfolio_id` PRIMARY KEY(`id`)
);
