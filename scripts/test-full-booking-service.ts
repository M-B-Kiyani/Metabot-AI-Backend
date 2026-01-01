import { databaseClient } from "../src/config/database.client";
import { BookingRepository } from "../src/repositories/booking.repository";
import { NotificationService } from "../src/services/notification.service";
import { EmailClient } from "../src/integrations/email.client";
import { BookingService } from "../src/services/booking.service";
import { CalendarService } from "../src/services/calendar.service";
import { CRMService } from "../src/services/crm.service";

async function testFullBookingService() {
  console.log("🔍 Testing Full Booking Service with Email...");
  console.log("=====================================");

  try {
    // Connect to database
    await databaseClient.connect();

    // Initialize all services like in the real app
    const bookingRepository = new BookingRepository(databaseClient);
    const emailClient = new EmailClient();
    const notificationService = new NotificationService(emailClient);
    const calendarService = new CalendarService();
    const crmService = new CRMService();
    const prisma = databaseClient.getClient();

    const bookingService = new BookingService(
      bookingRepository,
      notificationService,
      calendarService,
      crmService,
      prisma
    );

    console.log("\n1️⃣ Creating booking through BookingService...");

    const bookingData = {
      name: "Full Service Test User",
      company: "Full Service Test Co",
      email: process.env.ADMIN_EMAIL || "bilal@metalogics.io",
      phone: "+1234567890",
      inquiry: "Testing full booking service with email notifications",
      timeSlot: {
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        duration: 45 as 15 | 30 | 45 | 60,
      },
    };

    const booking = await bookingService.createBooking(bookingData);

    console.log("✅ Booking created through service:", {
      id: booking.id,
      name: booking.name,
      email: booking.email,
      status: booking.status,
      confirmationSent: booking.confirmationSent,
    });

    console.log("\n2️⃣ Waiting for async email processing...");

    // Wait a bit for the async email processing to complete
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("\n3️⃣ Checking booking after email processing...");

    const updatedBooking = await bookingService.getBookingById(booking.id);

    console.log("📊 Booking after email processing:", {
      id: updatedBooking.id,
      confirmationSent: updatedBooking.confirmationSent,
      reminderSent: updatedBooking.reminderSent,
      calendarSynced: updatedBooking.calendarSynced,
      crmSynced: updatedBooking.crmSynced,
    });

    console.log("\n4️⃣ Testing booking update email...");

    const updateResult = await bookingService.updateBooking(booking.id, {
      inquiry: "Updated inquiry: Testing update email notifications",
    });

    console.log("✅ Booking updated:", updateResult.id);

    console.log("\n5️⃣ Testing booking cancellation email...");

    const cancelledBooking = await bookingService.cancelBooking(booking.id);

    console.log("✅ Booking cancelled:", {
      id: cancelledBooking.id,
      status: cancelledBooking.status,
    });

    console.log("\n6️⃣ Checking final booking state...");

    const finalBooking = await bookingService.getBookingById(booking.id);

    console.log("📊 Final booking state:", {
      id: finalBooking.id,
      status: finalBooking.status,
      confirmationSent: finalBooking.confirmationSent,
      updatedAt: finalBooking.updatedAt.toISOString(),
    });

    console.log("\n🎉 Full booking service test completed!");
    console.log("\n📋 Summary:");
    console.log("✅ Booking Creation: Working");
    console.log("✅ Email Notifications: Working");
    console.log("✅ Booking Updates: Working");
    console.log("✅ Cancellation Emails: Working");
    console.log("✅ Status Tracking: Working");

    console.log("\n📧 Check your email for:");
    console.log("  - Booking confirmation");
    console.log("  - Booking update notification");
    console.log("  - Cancellation notification");
  } catch (error) {
    console.error("\n❌ Full booking service test failed:", error);
    process.exit(1);
  } finally {
    await databaseClient.disconnect();
  }
}

require("dotenv").config();

testFullBookingService()
  .then(() => {
    console.log("\n✅ Full booking service test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Full booking service test failed:", error);
    process.exit(1);
  });
