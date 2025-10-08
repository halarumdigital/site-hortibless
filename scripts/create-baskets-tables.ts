import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createBasketsTables() {
  console.log("Creating baskets and basket_items tables...");

  // Create baskets table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS baskets (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price_loose VARCHAR(50),
      price_subscription VARCHAR(50),
      image_path VARCHAR(500),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create basket_items table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS basket_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      basket_id INT NOT NULL,
      loose_item_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (basket_id) REFERENCES baskets(id) ON DELETE CASCADE,
      FOREIGN KEY (loose_item_id) REFERENCES loose_items(id) ON DELETE CASCADE
    )
  `);

  console.log("✅ Tables baskets and basket_items created successfully!");
}

createBasketsTables()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
