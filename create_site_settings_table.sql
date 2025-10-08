-- Criar tabela de configurações do site
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  site_name VARCHAR(255) NOT NULL DEFAULT 'Meu Site',
  logo_path VARCHAR(500),
  footer_logo_path VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configuração inicial
INSERT INTO site_settings (site_name) VALUES ('ZATPLANT - Hydroponic & Horticulture')
ON DUPLICATE KEY UPDATE site_name = site_name;
