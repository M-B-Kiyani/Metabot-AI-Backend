import { Client } from "pg";

async function testDatabaseConnectionNoSSL() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔍 Testing PostgreSQL database connection (without SSL)...");
  console.log("Database URL:", databaseUrl.replace(/:[^:@]*@/, ":****@"));

  // Parse URL manually to remove SSL requirement
  const url = new URL(databaseUrl);

  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1), // Remove leading slash
    user: url.username,
    password: url.password,
    connectionTimeoutMillis: 15000, // 15 second timeout
    query_timeout: 10000, // 10 second query timeout
    // No SSL configuration
  });

  try {
    console.log("🔌 Connecting to database...");
    console.log(`Host: ${url.hostname}:${url.port}`);
    console.log(`Database: ${url.pathname.slice(1)}`);
    console.log(`User: ${url.username}`);

    await client.connect();
    console.log("✅ Database connection successful (no SSL)!");

    const result = await client.query(
      "SELECT 1 as test, NOW() as current_time"
    );
    console.log("✅ Query execution successful:", result.rows[0]);
  } catch (error) {
    console.error("❌ Database connection failed (no SSL):");
    console.error("Error details:", error);

    // Now try with SSL
    console.log("\n🔄 Trying with SSL...");

    const sslClient = new Client({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 15000,
      query_timeout: 10000,
    });

    try {
      await sslClient.connect();
      console.log("✅ Database connection successful (with SSL)!");

      const sslResult = await sslClient.query(
        "SELECT 1 as test, NOW() as current_time"
      );
      console.log("✅ Query execution successful:", sslResult.rows[0]);

      await sslClient.end();
    } catch (sslError) {
      console.error("❌ Database connection failed (with SSL):");
      console.error("SSL Error details:", sslError);

      // Check if it's a Railway-specific issue
      console.log("\n🔍 Troubleshooting suggestions:");
      console.log(
        "1. Check if your Railway database is running and not paused"
      );
      console.log(
        "2. Verify the DATABASE_URL is current (Railway URLs can change)"
      );
      console.log("3. Check Railway dashboard for any service issues");
      console.log("4. Ensure your Railway project has database access enabled");

      process.exit(1);
    }
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

require("dotenv").config();

testDatabaseConnectionNoSSL()
  .then(() => {
    console.log("🎉 Database connection test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Database test failed:", error);
    process.exit(1);
  });
