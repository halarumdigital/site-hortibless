import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createGalleryTable() {
  try {
    console.log("Creating gallery table...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(20) NOT NULL,
        path VARCHAR(500) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        \`order\` INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table gallery created successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createGalleryTable();
