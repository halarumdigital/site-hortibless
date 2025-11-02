-- Create conversations table
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255),
  `customer_whatsapp` varchar(50) NOT NULL,
  `agent_id` int,
  `agent_name` varchar(255),
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `channel` varchar(50) NOT NULL DEFAULT 'whatsapp',
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_customer_whatsapp` (`customer_whatsapp`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
);

-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS `conversation_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender` varchar(50) NOT NULL,
  `sender_name` varchar(255),
  `message` text NOT NULL,
  `message_type` varchar(50) NOT NULL DEFAULT 'text',
  `media_url` varchar(500),
  `is_read` boolean NOT NULL DEFAULT false,
  `metadata` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_conversation_id` (`conversation_id`),
  INDEX `idx_sender` (`sender`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_conversation_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
);