// Simple test to verify JSON configuration works
const fs = require("fs");

// Read the JSON file
const jsonContent = fs.readFileSync("./google-service-account.json", "utf8");

// Test parsing
try {
  const parsed = JSON.parse(jsonContent);
  console.log("✓ JSON is valid");
  console.log("✓ Type:", parsed.type);
  console.log("✓ Project ID:", parsed.project_id);
  console.log("✓ Client Email:", parsed.client_email);

  // Create properly escaped JSON for .env
  const escapedJson = JSON.stringify(jsonContent);
  console.log("\n📋 For .env file, use:");
  console.log(`GOOGLE_SERVICE_ACCOUNT_KEY_JSON=${escapedJson}`);
} catch (error) {
  console.error("❌ JSON parsing failed:", error.message);
}
