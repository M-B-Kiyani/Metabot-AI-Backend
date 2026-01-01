// Test Prisma connection without requiring client regeneration
import { execSync } from "child_process";

async function testPrismaConnection() {
  console.log("🔍 Testing Prisma database connection...");

  try {
    // Test database connection using Prisma CLI
    console.log("🔌 Testing Prisma database connectivity...");
    const result = execSync("npx prisma db execute --stdin", {
      input: "SELECT 1 as test;",
      encoding: "utf8",
      timeout: 10000,
    });

    console.log("✅ Prisma database connection successful!");
    console.log("Query result:", result);

    // Check if we can introspect the database
    console.log("🔍 Testing database introspection...");
    try {
      const introspectResult = execSync("npx prisma db pull --print", {
        encoding: "utf8",
        timeout: 15000,
      });
      console.log("✅ Database introspection successful!");
      console.log(
        "Schema preview:",
        introspectResult.substring(0, 500) + "..."
      );
    } catch (introspectError) {
      console.log(
        "ℹ️  Introspection not available (this is normal for empty databases)"
      );
    }

    // Test migration status
    console.log("🔍 Checking migration status...");
    try {
      const migrationResult = execSync("npx prisma migrate status", {
        encoding: "utf8",
        timeout: 10000,
      });
      console.log("✅ Migration status check successful!");
      console.log("Migration info:", migrationResult);
    } catch (migrationError) {
      console.log("ℹ️  No migrations found (this is normal for new databases)");
    }
  } catch (error) {
    console.error("❌ Prisma database connection failed:");
    console.error("Error details:", error);

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        console.error(
          "🔍 Connection timeout - database might be slow to respond"
        );
      } else if (error.message.includes("authentication")) {
        console.error(
          "🔍 Authentication failed - check DATABASE_URL credentials"
        );
      } else if (
        error.message.includes("database") &&
        error.message.includes("does not exist")
      ) {
        console.error(
          "🔍 Database does not exist - check DATABASE_URL database name"
        );
      }
    }

    process.exit(1);
  }
}

// Load environment variables
require("dotenv").config();

testPrismaConnection()
  .then(() => {
    console.log("🎉 Prisma database test completed successfully!");
    console.log("✅ Your database is ready for Prisma operations!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Prisma test failed:", error);
    process.exit(1);
  });
