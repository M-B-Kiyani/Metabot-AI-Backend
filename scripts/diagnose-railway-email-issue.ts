import { EmailClient } from "../src/integrations/email.client";
import { config } from "../src/config";
import * as nodemailer from "nodemailer";

async function diagnoseRailwayEmailIssue() {
  console.log("🔍 Diagnosing Railway Email Issue...");
  console.log("=====================================");

  try {
    // 1. Environment Check
    console.log("\n1️⃣ Environment Information...");
    console.log("Node Environment:", process.env.NODE_ENV);
    console.log("Platform:", process.platform);
    console.log(
      "Railway Environment:",
      process.env.RAILWAY_ENVIRONMENT || "Not detected"
    );

    // 2. SMTP Configuration Check
    console.log("\n2️⃣ SMTP Configuration...");
    console.log("SMTP Host:", config.email.smtpHost);
    console.log("SMTP Port:", config.email.smtpPort);
    console.log("SMTP User:", config.email.smtpUser);
    console.log("From Email:", config.email.fromEmail);
    console.log(
      "SSL/TLS Mode:",
      config.email.smtpPort === 465 ? "SSL" : "STARTTLS"
    );

    // 3. Test different SMTP configurations
    console.log("\n3️⃣ Testing SMTP Connection Variations...");

    const testConfigs = [
      {
        name: "Current Config (Hostinger)",
        config: {
          host: config.email.smtpHost,
          port: config.email.smtpPort,
          secure: config.email.smtpPort === 465,
          auth: {
            user: config.email.smtpUser,
            pass: config.email.smtpPassword,
          },
        },
      },
      {
        name: "Hostinger with different port (465)",
        config: {
          host: config.email.smtpHost,
          port: 465,
          secure: true,
          auth: {
            user: config.email.smtpUser,
            pass: config.email.smtpPassword,
          },
        },
      },
      {
        name: "Hostinger with port 25",
        config: {
          host: config.email.smtpHost,
          port: 25,
          secure: false,
          auth: {
            user: config.email.smtpUser,
            pass: config.email.smtpPassword,
          },
        },
      },
    ];

    for (const testConfig of testConfigs) {
      console.log(`\n🔧 Testing: ${testConfig.name}`);

      try {
        const transporter = nodemailer.createTransporter(testConfig.config);

        // Test connection
        const isConnected = await transporter.verify();

        if (isConnected) {
          console.log(`✅ ${testConfig.name}: Connection successful`);

          // Try sending a test email
          try {
            const info = await transporter.sendMail({
              from: `${config.email.fromName} <${config.email.fromEmail}>`,
              to: config.email.adminEmail,
              subject: `Railway Test - ${testConfig.name}`,
              html: `
                <h3>Railway Email Test</h3>
                <p>This email was sent using: ${testConfig.name}</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
                <p>If you received this, the configuration is working!</p>
              `,
              text: `Railway email test using ${
                testConfig.name
              } - ${new Date().toISOString()}`,
            });

            console.log(`✅ ${testConfig.name}: Email sent successfully!`);
            console.log(`📧 Message ID: ${info.messageId}`);

            transporter.close();
            return; // Success! Stop testing other configs
          } catch (sendError) {
            console.log(`❌ ${testConfig.name}: Email sending failed`);
            console.log(
              `Error: ${
                sendError instanceof Error ? sendError.message : sendError
              }`
            );
          }
        } else {
          console.log(`❌ ${testConfig.name}: Connection failed`);
        }

        transporter.close();
      } catch (error) {
        console.log(`❌ ${testConfig.name}: Connection error`);
        console.log(`Error: ${error instanceof Error ? error.message : error}`);

        // Analyze specific error types
        if (error instanceof Error) {
          if (error.message.includes("ECONNREFUSED")) {
            console.log(
              `   🔍 Port ${testConfig.config.port} is likely blocked by Railway`
            );
          } else if (error.message.includes("ETIMEDOUT")) {
            console.log(
              `   🔍 Connection timeout - Railway firewall or network issue`
            );
          } else if (error.message.includes("ENOTFOUND")) {
            console.log(`   🔍 DNS resolution failed - check hostname`);
          } else if (error.message.includes("authentication")) {
            console.log(`   🔍 Authentication failed - check credentials`);
          }
        }
      }
    }

    // 4. Railway-specific recommendations
    console.log("\n4️⃣ Railway Email Solutions...");
    console.log("❌ All SMTP configurations failed on Railway");
    console.log("\n🔧 Recommended solutions:");

    console.log("\n📧 Option 1: Switch to SendGrid (Most Railway-compatible)");
    console.log("1. Sign up for SendGrid (free tier available)");
    console.log("2. Get your API key");
    console.log("3. Update Railway environment variables:");
    console.log("   SMTP_HOST=smtp.sendgrid.net");
    console.log("   SMTP_PORT=587");
    console.log("   SMTP_USER=apikey");
    console.log("   SMTP_PASSWORD=your_sendgrid_api_key");

    console.log("\n📧 Option 2: Use Mailgun");
    console.log("1. Sign up for Mailgun");
    console.log("2. Get your SMTP credentials");
    console.log("3. Update Railway environment variables:");
    console.log("   SMTP_HOST=smtp.mailgun.org");
    console.log("   SMTP_PORT=587");
    console.log("   SMTP_USER=your_mailgun_username");
    console.log("   SMTP_PASSWORD=your_mailgun_password");

    console.log("\n📧 Option 3: Use Gmail SMTP (for testing)");
    console.log("1. Enable 2FA on Gmail");
    console.log("2. Generate an App Password");
    console.log("3. Update Railway environment variables:");
    console.log("   SMTP_HOST=smtp.gmail.com");
    console.log("   SMTP_PORT=587");
    console.log("   SMTP_USER=your_gmail@gmail.com");
    console.log("   SMTP_PASSWORD=your_app_password");

    console.log("\n📧 Option 4: Use Email API instead of SMTP");
    console.log("Consider switching to email service APIs like:");
    console.log("- SendGrid API");
    console.log("- Mailgun API");
    console.log("- AWS SES API");
    console.log("- Resend API");

    console.log("\n🔍 Next Steps:");
    console.log("1. Try SendGrid first (most Railway-compatible)");
    console.log("2. Update your Railway environment variables");
    console.log("3. Redeploy your Railway service");
    console.log("4. Test with a booking to confirm emails work");
  } catch (error) {
    console.error("\n❌ Diagnosis failed:", error);
  }
}

// Load environment variables
require("dotenv").config();

diagnoseRailwayEmailIssue()
  .then(() => {
    console.log("\n✅ Railway email diagnosis completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Diagnosis failed:", error);
    process.exit(1);
  });
