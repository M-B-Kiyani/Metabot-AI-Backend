import * as fs from "fs";
import * as path from "path";

function updateDatabaseUrl(newUrl: string) {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found");
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, "utf8");

  // Replace the DATABASE_URL line
  const urlRegex = /^DATABASE_URL=.*$/m;
  const newLine = `DATABASE_URL="${newUrl}"`;

  if (urlRegex.test(envContent)) {
    envContent = envContent.replace(urlRegex, newLine);
    console.log("✅ Updated existing DATABASE_URL");
  } else {
    envContent += `\n${newLine}\n`;
    console.log("✅ Added new DATABASE_URL");
  }

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file updated successfully");
  console.log("🔍 New DATABASE_URL:", newUrl.replace(/:[^:@]*@/, ":****@"));
}

// Get new URL from command line argument
const newUrl = process.argv[2];

if (!newUrl) {
  console.log(
    'Usage: npx tsx scripts/update-database-url.ts "postgresql://user:pass@host:port/db"'
  );
  console.log("");
  console.log("Steps to get your Railway DATABASE_URL:");
  console.log("1. Go to Railway dashboard");
  console.log("2. Select your PostgreSQL service");
  console.log("3. Go to Variables tab");
  console.log("4. Copy the DATABASE_URL value");
  console.log("5. Run this script with the new URL");
  process.exit(1);
}

updateDatabaseUrl(newUrl);
