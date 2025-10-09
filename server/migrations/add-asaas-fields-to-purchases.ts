import { db } from "../db";
import { sql } from "drizzle-orm";

async function addAsaasFields() {
  try {
    await db.execute(sql`
      ALTER TABLE one_time_purchases
      ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS asaas_payment_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS asaas_bank_slip_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS asaas_pix_qr_code TEXT,
      ADD COLUMN IF NOT EXISTS asaas_pix_payload TEXT
    `);

    console.log("✅ Asaas fields added to one_time_purchases table successfully");
  } catch (error) {
    console.error("❌ Error adding Asaas fields:", error);
    throw error;
  }
}

addAsaasFields()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
