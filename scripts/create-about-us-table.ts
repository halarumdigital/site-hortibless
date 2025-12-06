import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createAboutUsTable() {
  try {
    console.log("Creating about_us table...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS about_us (
        id INT PRIMARY KEY AUTO_INCREMENT,
        image1_path VARCHAR(500),
        image2_path VARCHAR(500),
        image3_path VARCHAR(500),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table about_us created successfully!");

    // Insert default row if table is empty
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM about_us`);
    const count = (result as any)[0][0].count;

    if (count === 0) {
      await db.execute(sql`
        INSERT INTO about_us (image1_path, image2_path, image3_path)
        VALUES (NULL, NULL, NULL)
      `);
      console.log("✅ Default about_us row inserted!");
    } else {
      console.log("ℹ️ Table already has data, skipping default insert.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createAboutUsTable();
