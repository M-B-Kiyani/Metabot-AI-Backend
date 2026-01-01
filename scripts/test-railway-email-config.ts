import { EmailClient } from "../src/integrations/email.client";
import { config } from "../src/config";

async function testRailwayEmailConfig() {
  console.log("🚂 Testing Railway Email Configuration...");
  console.log("=====================================");

  try {
    // 1. Check environment variables
    console.log("\n1️⃣ Checking Environment Variables...");

    const requiredEnvVars = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "FROM_EMAIL",
      "FROM_NAME",
      "ADMIN_EMAIL",
    ];

    const missingVars = [];
    const presentVars = [];

    requiredEnvVars.forEach((varName) => {
      const value = process.env[varName];
      if (!value || value.trim() === "") {
        missingVars.push(varName);
      } else {
        presentVars.push({
          name: varName,
          value: varName.includes("PASSWORD") ? "***HIDDEN***" : value,
        });
      }
    });

    console.log("✅ Present environment variables:");
    presentVars.forEach(({ name, value }) => {
      console.log(`  - ${name}: ${value}`);
    });

    if (missingVars.length > 0) {
      console.log("❌ Missing environment variables:");
      missingVars.forEach((varName) => {
        console.log(`  - ${varName}`);
      });
      console.log("\n🔧 To fix this on Railway:");
      console.log("1. Go to your Railway project dashboard");
      console.log("2. Click on your service");
      console.log("3. Go to Variables tab");
      console.log("4. Add the missing environment variables");
      return;
    }

    // 2. Check config loading
    console.log("\n2️⃣ Checking Config Loading...");

    try {
      console.log("📧 Email config loaded:");
      console.log(`  - SMTP Host: ${config.email.smtpHost}`);
      console.log(`  - SMTP Port: ${config.email.smtpPort}`);
      console.log(`  - SMTP User: ${config.email.smtpUser}`);
      console.log(`  - From Email: ${config.email.fromEmail}`);
      console.log(`  - From Name: ${config.email.fromName}`);
      console.log(`  - Admin Email: ${config.email.adminEmail}`);
      console.log(`  - Retry Attempts: ${config.email.retryAttempts}`);
      console.log(`  - Retry Delay: ${config.email.retryDelay}`);
    } catch (configError) {
      console.log("❌ Config loading failed:", configError);
      return;
    }

    // 3. Test EmailClient instantiation
    console.log("\n3️⃣ Testing EmailClient Instantiation...");

    let emailClient;
    try {
      emailClient = new EmailClient();
      console.log("✅ EmailClient created successfully");
    } catch (clientError) {
      console.log("❌ EmailClient creation failed:", clientError);
      return;
    }

    // 4. Test SMTP connection
    console.log("\n4️⃣ Testing SMTP Connection...");

    try {
      const isConnected = await emailClient.verifyConnection();

      if (isConnected) {
        console.log("✅ SMTP connection successful");
      } else {
        console.log("❌ SMTP connection failed");
        console.log("\n🔍 Common Railway SMTP issues:");
        console.log("1. Railway might block certain SMTP ports (25, 465, 587)");
        console.log("2. Some SMTP providers block Railway IP addresses");
        console.log("3. Firewall restrictions on Railway infrastructure");
        console.log("4. SMTP credentials might be different for production");
        return;
      }
    } catch (connectionError) {
      console.log("❌ SMTP connection error:", connectionError);

      if (connectionError instanceof Error) {
        if (connectionError.message.includes("ECONNREFUSED")) {
          console.log("\n🔍 Connection refused - possible causes:");
          console.log("1. Railway blocks the SMTP port");
          console.log("2. SMTP server rejects Railway IP addresses");
          console.log("3. Incorrect SMTP host or port");
        } else if (connectionError.message.includes("ETIMEDOUT")) {
          console.log("\n🔍 Connection timeout - possible causes:");
          console.log("1. Railway firewall blocking SMTP traffic");
          console.log("2. SMTP server not responding");
          console.log("3. Network connectivity issues");
        } else if (connectionError.message.includes("authentication")) {
          console.log("\n🔍 Authentication failed - possible causes:");
          console.log("1. Wrong SMTP username or password");
          console.log("2. SMTP credentials not set in Railway environment");
          console.log("3. Account locked or suspended");
        }
      }
      return;
    }

    // 5. Test actual email sending
    console.log("\n5️⃣ Testing Email Sending...");

    try {
      const testResult = await emailClient.sendEmail({
        to: config.email.adminEmail,
        subject: "Railway Email Test - " + new Date().toISOString(),
        html: `
          <h2>Railway Email Test</h2>
          <p>This email was sent from your Railway deployment to test email functionality.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Environment: ${process.env.NODE_ENV || "unknown"}</li>
            <li>SMTP Host: ${config.email.smtpHost}</li>
            <li>From: ${config.email.fromEmail}</li>
          </ul>
          <p>If you received this email, your Railway email configuration is working!</p>
        `,
        text: "Railway email test - if you received this, email is working on Railway!",
      });

      if (testResult.success) {
        console.log("✅ Test email sent successfully from Railway!");
        console.log("📧 Message ID:", testResult.messageId);
        console.log("📬 Sent to:", config.email.adminEmail);
        console.log("\n🎉 Email system is working on Railway!");
      } else {
        console.log("❌ Test email failed to send");
        console.log("Error:", testResult.error);
      }
    } catch (sendError) {
      console.log("❌ Email sending failed:", sendError);
    }

    // 6. Railway-specific recommendations
    console.log("\n6️⃣ Railway Email Recommendations...");
    console.log("📋 For reliable email on Railway, consider:");
    console.log(
      "1. Use SendGrid, Mailgun, or AWS SES instead of Hostinger SMTP"
    );
    console.log("2. Use port 587 with STARTTLS (most Railway-compatible)");
    console.log("3. Avoid port 25 (often blocked) and 465 (SSL issues)");
    console.log("4. Set up dedicated email service API instead of SMTP");
    console.log("5. Check Railway logs for detailed error messages");

    await emailClient.close();
  } catch (error) {
    console.error("\n❌ Railway email test failed:", error);

    console.log("\n🔧 Troubleshooting steps:");
    console.log("1. Check Railway environment variables are set correctly");
    console.log("2. Verify SMTP credentials work from Railway IP");
    console.log("3. Try a different SMTP provider (SendGrid, Mailgun)");
    console.log("4. Check Railway deployment logs for errors");
    console.log("5. Test with a simple email service API instead of SMTP");
  }
}

// Load environment variables
require("dotenv").config();

testRailwayEmailConfig()
  .then(() => {
    console.log("\n✅ Railway email configuration test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Railway email test failed:", error);
    process.exit(1);
  });
