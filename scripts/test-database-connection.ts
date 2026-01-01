import { PrismaClient } from "@prisma/client";

async function testDatabaseConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log("🔍 Testing database connection...");
    console.log(
      "Database URL:",
      process.env.DATABASE_URL?.replace(/:[^:@]*@/, ":****@")
    ); // Hide password

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful!");

    // Test query execution
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Query execution successful:", result);

    // Test database info
    const dbInfo = await prisma.$queryRaw`SELECT version() as version`;
    console.log("✅ Database version:", dbInfo);

    // Check if tables exist (optional)
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      console.log("📋 Available tables:", tables);
    } catch (error) {
      console.log(
        "ℹ️  Could not fetch table list (this is normal for new databases)"
      );
    }
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error details:", error);

    if (error instanceof Error) {
      if (error.message.includes("ENOTFOUND")) {
        console.error("🔍 DNS resolution failed - check the hostname");
      } else if (error.message.includes("ECONNREFUSED")) {
        console.error(
          "🔍 Connection refused - check if the database server is running"
        );
      } else if (error.message.includes("authentication")) {
        console.error("🔍 Authentication failed - check username/password");
      } else if (error.message.includes("timeout")) {
        console.error("🔍 Connection timeout - check network connectivity");
      }
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Load environment variables
require("dotenv").config();

testDatabaseConnection()
  .then(() => {
    console.log("🎉 Database test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Database test failed:", error);
    process.exit(1);
  });
