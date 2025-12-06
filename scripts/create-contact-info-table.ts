import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createContactInfoTable() {
  try {
    console.log("Creating contact_info table...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_info (
        id INT PRIMARY KEY AUTO_INCREMENT,
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        instagram VARCHAR(255),
        facebook VARCHAR(255),
        tiktok VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table contact_info created successfully!");

    // Insert default info if table is empty
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM contact_info`);
    const count = (result as any)[0][0].count;

    if (count === 0) {
      await db.execute(sql`
        INSERT INTO contact_info (whatsapp, email)
        VALUES ('+55 11 99999-9999', 'contato@zatplant.com')
      `);
      console.log("✅ Default contact info inserted!");
    } else {
      console.log("ℹ️ Table already has data, skipping default insert.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

createContactInfoTable();
