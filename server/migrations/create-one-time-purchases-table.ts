import { db } from "../db";
import { sql } from "drizzle-orm";

async function createOneTimePurchasesTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS one_time_purchases (
        id INT PRIMARY KEY AUTO_INCREMENT,
        basket_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_cpf VARCHAR(14) NOT NULL,
        customer_whatsapp VARCHAR(50) NOT NULL,
        customer_address TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        total_amount VARCHAR(50) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
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

    console.log("✅ One-time purchases table created successfully");
  } catch (error) {
    console.error("❌ Error creating one-time purchases table:", error);
    throw error;
  }
}

createOneTimePurchasesTable()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
