import { Client } from "pg";

async function testRawDatabaseConnection() {
  // Parse the DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔍 Testing PostgreSQL database connection...");
  console.log("Database URL:", databaseUrl.replace(/:[^:@]*@/, ":****@")); // Hide password

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Railway requires SSL but with self-signed certs
    },
    connectionTimeoutMillis: 10000, // 10 second timeout
    query_timeout: 5000, // 5 second query timeout
    statement_timeout: 5000, // 5 second statement timeout
  });

  try {
    // Test connection
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Database connection successful!");

    // Test basic query
    console.log("🔍 Testing basic query...");
    const result = await client.query(
      "SELECT 1 as test, NOW() as current_time"
    );
    console.log("✅ Query execution successful:", result.rows[0]);

    // Get database version
    console.log("🔍 Getting database version...");
    const versionResult = await client.query("SELECT version()");
    console.log("✅ Database version:", versionResult.rows[0].version);

    // Check database name and connection info
    console.log("🔍 Getting database info...");
    const dbInfoResult = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);
    console.log("✅ Database info:", dbInfoResult.rows[0]);

    // Check if we can create/drop a test table (to verify write permissions)
    console.log("🔍 Testing write permissions...");
    try {
      await client.query(
        "CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_time TIMESTAMP DEFAULT NOW())"
      );
      await client.query("INSERT INTO connection_test DEFAULT VALUES");
      const testResult = await client.query(
        "SELECT COUNT(*) as count FROM connection_test"
      );
      console.log(
        "✅ Write permissions verified. Test records:",
        testResult.rows[0].count
      );
      await client.query("DROP TABLE connection_test");
      console.log("✅ Cleanup successful");
    } catch (writeError) {
      console.log(
        "⚠️  Write permission test failed (this might be normal for read-only users):",
        writeError.message
      );
    }

    // List existing tables
    console.log("🔍 Checking existing tables...");
    const tablesResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log("📋 Existing tables:");
      tablesResult.rows.forEach((row) => {
        console.log(`  - ${row.table_name} (${row.table_type})`);
      });
    } else {
      console.log(
        "📋 No tables found in public schema (this is normal for a new database)"
      );
    }
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error details:", error);

    if (error instanceof Error) {
      if (error.message.includes("ENOTFOUND")) {
        console.error(
          "🔍 DNS resolution failed - check the hostname: switchyard.proxy.rlwy.net"
        );
      } else if (error.message.includes("ECONNREFUSED")) {
        console.error(
          "🔍 Connection refused - check if the database server is running on port 5432"
        );
      } else if (
        error.message.includes("authentication") ||
        error.message.includes("password")
      ) {
        console.error(
          "🔍 Authentication failed - check username (postgres) and password"
        );
      } else if (error.message.includes("timeout")) {
        console.error("🔍 Connection timeout - check network connectivity");
      } else if (
        error.message.includes("database") &&
        error.message.includes("does not exist")
      ) {
        console.error('🔍 Database "railway" does not exist on the server');
      }
    }

    process.exit(1);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

// Load environment variables
require("dotenv").config();

testRawDatabaseConnection()
  .then(() => {
    console.log("🎉 Database connection test completed successfully!");
    console.log("✅ Your Railway PostgreSQL database is working correctly!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Database test failed:", error);
    process.exit(1);
  });
