import { db } from "../db";
import { sql } from "drizzle-orm";

async function createOrdersTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        basket_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_cpf VARCHAR(14) NOT NULL,
        customer_whatsapp VARCHAR(50) NOT NULL,
        customer_address TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        frequency VARCHAR(20) NOT NULL,
        total_amount VARCHAR(50) NOT NULL,
        card_number VARCHAR(19),
        card_name VARCHAR(255),
        card_expiry VARCHAR(7),
        card_cvv VARCHAR(4),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (basket_id) REFERENCES baskets(id) ON DELETE CASCADE
      )
    `);

    console.log("✅ Orders table created successfully");
  } catch (error) {
    console.error("❌ Error creating orders table:", error);
    throw error;
  }
}

createOrdersTable()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
