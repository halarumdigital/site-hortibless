import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createComparativeTablesTable() {
  console.log("Creating comparative_tables table...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS comparative_tables (
      id INT PRIMARY KEY AUTO_INCREMENT,
      image_path VARCHAR(500) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Table comparative_tables created successfully!");
}

createComparativeTablesTable()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
