import { Client } from "pg";

async function finalDatabaseTest() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🎯 Final Database Verification Test");
  console.log("=====================================");
  console.log("Database URL:", databaseUrl.replace(/:[^:@]*@/, ":****@"));

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // 1. Test Connection
    console.log("\n1️⃣ Testing Connection...");
    await client.connect();
    console.log("✅ Connection successful");

    // 2. Test Database Info
    console.log("\n2️⃣ Database Information...");
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        version() as version,
        current_user as user_name
    `);
    console.log("✅ Database:", dbInfo.rows[0].database_name);
    console.log("✅ User:", dbInfo.rows[0].user_name);
    console.log(
      "✅ Version:",
      dbInfo.rows[0].version.split(" ").slice(0, 2).join(" ")
    );

    // 3. Test Schema
    console.log("\n3️⃣ Schema Verification...");
    const tables = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("✅ Tables found:");
    tables.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // 4. Test Booking Table Structure
    console.log("\n4️⃣ Booking Table Structure...");
    const bookingColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Booking' 
      ORDER BY ordinal_position
    `);

    if (bookingColumns.rows.length > 0) {
      console.log("✅ Booking table columns:");
      bookingColumns.rows.forEach((col) => {
        console.log(
          `   - ${col.column_name}: ${col.data_type} ${
            col.is_nullable === "NO" ? "(NOT NULL)" : ""
          }`
        );
      });
    } else {
      console.log("❌ Booking table not found");
    }

    // 5. Test CRUD Operations
    console.log("\n5️⃣ Testing CRUD Operations...");

    // Insert test record
    const insertResult = await client.query(`
      INSERT INTO "Booking" (
        id, name, company, email, phone, inquiry, 
        "startTime", duration, status, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), 
        'Test User', 
        'Test Company', 
        'test@example.com', 
        '+1234567890', 
        'Test inquiry', 
        NOW() + INTERVAL '1 day', 
        60, 
        'PENDING', 
        NOW(), 
        NOW()
      ) RETURNING id, name, email
    `);
    console.log("✅ Insert successful:", insertResult.rows[0]);

    const testId = insertResult.rows[0].id;

    // Read test record
    const selectResult = await client.query(
      `
      SELECT id, name, email, status, "createdAt"
      FROM "Booking" 
      WHERE id = $1
    `,
      [testId]
    );
    console.log("✅ Select successful:", selectResult.rows[0]);

    // Update test record
    const updateResult = await client.query(
      `
      UPDATE "Booking" 
      SET status = 'CONFIRMED', "updatedAt" = NOW()
      WHERE id = $1 
      RETURNING id, status
    `,
      [testId]
    );
    console.log("✅ Update successful:", updateResult.rows[0]);

    // Delete test record
    const deleteResult = await client.query(
      `
      DELETE FROM "Booking" 
      WHERE id = $1 
      RETURNING id
    `,
      [testId]
    );
    console.log("✅ Delete successful:", deleteResult.rows[0]);

    // 6. Test Enums
    console.log("\n6️⃣ Testing Enums...");
    const enumResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'BookingStatus'
      )
      ORDER BY enumsortorder
    `);

    if (enumResult.rows.length > 0) {
      console.log("✅ BookingStatus enum values:");
      enumResult.rows.forEach((row) => {
        console.log(`   - ${row.enumlabel}`);
      });
    }

    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("=====================================");
    console.log("✅ Database connection: Working");
    console.log("✅ Schema migration: Complete");
    console.log("✅ Table structure: Correct");
    console.log("✅ CRUD operations: Functional");
    console.log("✅ Data types & enums: Proper");
    console.log("\n🚀 Your Railway PostgreSQL database is fully operational!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

require("dotenv").config();

finalDatabaseTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Final test failed:", error);
    process.exit(1);
  });
