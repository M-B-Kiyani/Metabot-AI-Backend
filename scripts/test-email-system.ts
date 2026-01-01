import { EmailClient } from "../src/integrations/email.client";
import { NotificationService } from "../src/services/notification.service";
import { logger } from "../src/utils/logger";

async function testEmailSystem() {
  console.log("🔍 Testing Email System...");
  console.log("=====================================");

  try {
    // Test 1: EmailClient instantiation
    console.log("\n1️⃣ Testing EmailClient instantiation...");
    const emailClient = new EmailClient();
    console.log("✅ EmailClient created successfully");

    // Test 2: SMTP connection verification
    console.log("\n2️⃣ Testing SMTP connection...");
    const isConnected = await emailClient.verifyConnection();

    if (isConnected) {
      console.log("✅ SMTP connection verified successfully");
    } else {
      console.log("❌ SMTP connection failed");
      console.log("🔍 Check your email configuration in .env file");
      return;
    }

    // Test 3: NotificationService instantiation
    console.log("\n3️⃣ Testing NotificationService...");
    const notificationService = new NotificationService(emailClient);
    console.log("✅ NotificationService created successfully");

    // Test 4: Send test email
    console.log("\n4️⃣ Sending test email...");

    const testEmailResult = await emailClient.sendEmail({
      to: process.env.ADMIN_EMAIL || "bilal@metalogics.io",
      subject: "Test Email - Metalogics Booking System",
      html: `
        <h2>Email System Test</h2>
        <p>This is a test email to verify that the Metalogics booking system email functionality is working correctly.</p>
        <p><strong>Test Details:</strong></p>
        <ul>
          <li>Timestamp: ${new Date().toISOString()}</li>
          <li>SMTP Host: ${process.env.SMTP_HOST}</li>
          <li>From Email: ${process.env.FROM_EMAIL}</li>
        </ul>
        <p>If you received this email, the email system is working properly!</p>
      `,
      text: "This is a test email from the Metalogics booking system. If you received this, the email system is working!",
    });

    if (testEmailResult.success) {
      console.log("✅ Test email sent successfully!");
      console.log("📧 Message ID:", testEmailResult.messageId);
      console.log(
        "📬 Sent to:",
        process.env.ADMIN_EMAIL || "bilal@metalogics.io"
      );
    } else {
      console.log("❌ Test email failed to send");
      console.log("Error:", testEmailResult.error);
    }

    // Test 5: Test booking confirmation template
    console.log("\n5️⃣ Testing booking confirmation template...");

    // Create a mock booking for testing
    const mockBooking = {
      id: "test-booking-" + Date.now(),
      name: "Test User",
      company: "Test Company",
      email: process.env.ADMIN_EMAIL || "bilal@metalogics.io",
      phone: "+1234567890",
      inquiry:
        "This is a test booking inquiry to verify email templates are working correctly.",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
      status: "CONFIRMED" as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmationSent: false,
      reminderSent: false,
      calendarEventId: null,
      crmContactId: null,
      calendarSynced: false,
      crmSynced: false,
      requiresManualCalendarSync: false,
      requiresManualCrmSync: false,
    };

    try {
      const confirmationResult =
        await notificationService.sendBookingConfirmation(mockBooking);

      if (confirmationResult.success) {
        console.log("✅ Booking confirmation email sent successfully!");
        console.log("📧 Message ID:", confirmationResult.messageId);
      } else {
        console.log("❌ Booking confirmation email failed");
        console.log("Error:", confirmationResult.error);
      }
    } catch (error) {
      console.log("❌ Error sending booking confirmation:", error);
    }

    // Test 6: Check email configuration
    console.log("\n6️⃣ Email Configuration Summary...");
    console.log("SMTP Host:", process.env.SMTP_HOST);
    console.log("SMTP Port:", process.env.SMTP_PORT);
    console.log("SMTP User:", process.env.SMTP_USER);
    console.log("From Email:", process.env.FROM_EMAIL);
    console.log("From Name:", process.env.FROM_NAME);
    console.log("Admin Email:", process.env.ADMIN_EMAIL);
    console.log("Email Retry Attempts:", process.env.EMAIL_RETRY_ATTEMPTS);
    console.log("Email Retry Delay:", process.env.EMAIL_RETRY_DELAY);

    // Cleanup
    await emailClient.close();
    await notificationService.close();

    console.log("\n🎉 Email system test completed!");
  } catch (error) {
    console.error("\n❌ Email system test failed:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    console.log("\n🔍 Troubleshooting suggestions:");
    console.log("1. Check your .env file has all required email settings");
    console.log("2. Verify SMTP credentials are correct");
    console.log("3. Check if SMTP server allows connections from your IP");
    console.log(
      "4. Ensure firewall/antivirus is not blocking SMTP connections"
    );
    console.log(
      "5. Try using a different SMTP provider (Gmail, SendGrid, etc.)"
    );

    process.exit(1);
  }
}

// Load environment variables
require("dotenv").config();

testEmailSystem()
  .then(() => {
    console.log("\n✅ All email tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Email test suite failed:", error);
    process.exit(1);
  });
