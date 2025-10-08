import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createServiceRegionsTable() {
  try {
    console.log("Creating service_regions table...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS service_regions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table service_regions created successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createServiceRegionsTable();
