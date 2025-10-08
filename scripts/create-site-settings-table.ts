import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createSiteSettingsTable() {
  try {
    console.log("Creating site_settings table...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        site_name VARCHAR(255) NOT NULL DEFAULT 'Meu Site',
        logo_path VARCHAR(500),
        footer_logo_path VARCHAR(500),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table site_settings created successfully!");

    // Insert default settings if table is empty
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM site_settings`);
    const count = (result as any)[0][0].count;

    if (count === 0) {
      await db.execute(sql`
        INSERT INTO site_settings (site_name)
        VALUES ('ZATPLANT - Hydroponic & Horticulture')
      `);
      console.log("✅ Default settings inserted!");
    } else {
      console.log("ℹ️ Table already has data, skipping default insert.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createSiteSettingsTable();
