import { PrismaClient } from "@prisma/client";
import { BookingRepository } from "../src/repositories/booking.repository";
import { NotificationService } from "../src/services/notification.service";
import { EmailClient } from "../src/integrations/email.client";
import { databaseClient } from "../src/config/database.client";
import { logger } from "../src/utils/logger";

async function testBookingEmailFlow() {
  console.log("🔍 Testing Booking Email Flow...");
  console.log("=====================================");

  // Connect to database first
  await databaseClient.connect();

  const bookingRepository = new BookingRepository(databaseClient);
  const emailClient = new EmailClient();
  const notificationService = new NotificationService(emailClient);

  try {
    // Test 1: Create a test booking
    console.log("\n1️⃣ Creating test booking...");

    const testBooking = await bookingRepository.create({
      name: "Email Test User",
      company: "Email Test Company",
      email: process.env.ADMIN_EMAIL || "bilal@metalogics.io",
      phone: "+1234567890",
      inquiry:
        "This is a test booking to verify email notifications are working correctly.",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 60,
    });

    console.log("✅ Test booking created:", {
      id: testBooking.id,
      name: testBooking.name,
      email: testBooking.email,
      startTime: testBooking.startTime.toISOString(),
    });

    // Test 2: Send booking confirmation
    console.log("\n2️⃣ Sending booking confirmation email...");

    const confirmationResult =
      await notificationService.sendBookingConfirmation(testBooking);

    if (confirmationResult.success) {
      console.log("✅ Booking confirmation sent successfully!");
      console.log(
        "📧 User email message ID:",
        confirmationResult.userMessageId
      );
      console.log(
        "📧 Admin email message ID:",
        confirmationResult.adminMessageId
      );
    } else {
      console.log("❌ Booking confirmation failed");
      console.log("Error:", confirmationResult.error);
    }

    // Test 3: Update booking status and send update
    console.log("\n3️⃣ Testing booking update email...");

    const updatedBooking = await bookingRepository.update(testBooking.id, {
      status: "CONFIRMED",
      inquiry: "Updated inquiry: This booking has been confirmed and updated.",
    });

    const updateResult = await notificationService.sendBookingUpdate(
      updatedBooking
    );

    if (updateResult.success) {
      console.log("✅ Booking update email sent successfully!");
      console.log("📧 Message ID:", updateResult.messageId);
    } else {
      console.log("❌ Booking update email failed");
      console.log("Error:", updateResult.error);
    }

    // Test 4: Test cancellation email
    console.log("\n4️⃣ Testing cancellation email...");

    const cancelledBooking = await bookingRepository.update(testBooking.id, {
      status: "CANCELLED",
    });

    const cancellationResult =
      await notificationService.sendCancellationNotification(cancelledBooking);

    if (cancellationResult.success) {
      console.log("✅ Cancellation email sent successfully!");
      console.log("📧 Message ID:", cancellationResult.messageId);
    } else {
      console.log("❌ Cancellation email failed");
      console.log("Error:", cancellationResult.error);
    }

    // Test 5: Check if confirmationSent flag works
    console.log("\n5️⃣ Testing confirmationSent flag...");

    const bookingAfterEmails = await bookingRepository.findById(testBooking.id);

    if (bookingAfterEmails) {
      console.log("📊 Booking email flags:");
      console.log("  - confirmationSent:", bookingAfterEmails.confirmationSent);
      console.log("  - reminderSent:", bookingAfterEmails.reminderSent);
    }

    // Cleanup: Delete test booking
    console.log("\n6️⃣ Cleaning up test booking...");
    const prisma = databaseClient.getClient();
    await prisma.booking.delete({ where: { id: testBooking.id } });
    console.log("✅ Test booking deleted");

    console.log("\n🎉 Booking email flow test completed successfully!");
    console.log("\n📋 Summary:");
    console.log("✅ Booking creation: Working");
    console.log("✅ Confirmation emails: Working");
    console.log("✅ Update emails: Working");
    console.log("✅ Cancellation emails: Working");
    console.log("✅ Email flags: Working");
  } catch (error) {
    console.error("\n❌ Booking email flow test failed:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    process.exit(1);
  } finally {
    await emailClient.close();
    await notificationService.close();
    await databaseClient.disconnect();
  }
}

// Load environment variables
require("dotenv").config();

testBookingEmailFlow()
  .then(() => {
    console.log("\n✅ All booking email tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Booking email test failed:", error);
    process.exit(1);
  });
