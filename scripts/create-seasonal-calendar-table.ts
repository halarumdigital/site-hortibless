import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createSeasonalCalendarTable() {
  try {
    console.log("Recreating seasonal_calendar table...");

    await db.execute(sql`DROP TABLE IF EXISTS seasonal_calendar`);

    await db.execute(sql`
      CREATE TABLE seasonal_calendar (
        id INT PRIMARY KEY AUTO_INCREMENT,
        image_path VARCHAR(500) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table seasonal_calendar recreated successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createSeasonalCalendarTable();
