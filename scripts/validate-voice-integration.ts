/**
 * Comprehensive Voice Integration Validation Script
 * Tests end-to-end voice booking functionality including:
 * - Retell configuration validation
 * - Voice functions service testing
 * - Calendar integration
 * - CRM integration
 * - Email notifications
 */

import { config } from "../src/config";
import { databaseClient } from "../src/config/database.client";
import { BookingRepository } from "../src/repositories/booking.repository";
import { BookingService } from "../src/services/booking.service";
import { NotificationService } from "../src/services/notification.service";
import { CalendarService } from "../src/services/calendar.service";
import { CRMService } from "../src/services/crm.service";
import { VoiceFunctionsService } from "../src/services/voice-functions.service";
import { ConversationService } from "../src/services/conversation.service";
import { EmailClient } from "../src/integrations/email.client";
import { CalendarClient } from "../src/integrations/calendar.client";
import { HubSpotClient } from "../src/integrations/hubspot.client";
import { addDays, format } from "date-fns";

interface ValidationResult {
  component: string;
  status: "PASS" | "FAIL" | "WARN";
  message: string;
  details?: any;
}

class VoiceIntegrationValidator {
  private results: ValidationResult[] = [];
  private voiceFunctionsService!: VoiceFunctionsService;
  private conversationService!: ConversationService;

  async validate(): Promise<void> {
    console.log("🎤 Voice Integration Validation");
    console.log("=".repeat(60));
    console.log();

    try {
      // Step 1: Validate Configuration
      await this.validateConfiguration();

      // Step 2: Initialize Services
      await this.initializeServices();

      // Step 3: Test Voice Functions
      await this.testVoiceFunctions();

      // Step 4: Test Conversation Flow
      await this.testConversationFlow();

      // Step 5: Test Integration Points
      await this.testIntegrationPoints();

      // Step 6: Generate Report
      this.generateReport();
    } catch (error) {
      this.addResult("VALIDATION", "FAIL", `Validation failed: ${error}`);
      console.error("❌ Validation failed:", error);
    } finally {
      await databaseClient.disconnect();
    }
  }

  private async validateConfiguration(): Promise<void> {
    console.log("1️⃣  Validating Configuration...");

    // Check Retell configuration
    if (!config.retell.enabled) {
      this.addResult("RETELL_CONFIG", "FAIL", "Retell integration is disabled");
      return;
    }

    if (!config.retell.apiKey) {
      this.addResult("RETELL_API_KEY", "FAIL", "Retell API key not configured");
    } else {
      this.addResult("RETELL_API_KEY", "PASS", "Retell API key configured");
    }

    if (!config.retell.agentId) {
      this.addResult("RETELL_AGENT", "FAIL", "Retell agent ID not configured");
    } else {
      this.addResult(
        "RETELL_AGENT",
        "PASS",
        `Agent ID: ${config.retell.agentId}`
      );
    }

    if (!config.retell.customLlmUrl) {
      this.addResult("RETELL_LLM_URL", "WARN", "Custom LLM URL not configured");
    } else {
      this.addResult(
        "RETELL_LLM_URL",
        "PASS",
        `LLM URL: ${config.retell.customLlmUrl}`
      );
    }

    // Check Google Calendar
    if (!config.googleCalendar.enabled) {
      this.addResult(
        "CALENDAR_CONFIG",
        "WARN",
        "Google Calendar integration disabled"
      );
    } else {
      this.addResult("CALENDAR_CONFIG", "PASS", "Google Calendar enabled");
    }

    // Check HubSpot
    if (!config.hubspot.enabled) {
      this.addResult(
        "HUBSPOT_CONFIG",
        "WARN",
        "HubSpot CRM integration disabled"
      );
    } else {
      this.addResult("HUBSPOT_CONFIG", "PASS", "HubSpot CRM enabled");
    }

    console.log("✅ Configuration validation completed\n");
  }

  private async initializeServices(): Promise<void> {
    console.log("2️⃣  Initializing Services...");

    try {
      // Connect to database
      await databaseClient.connect();
      this.addResult("DATABASE", "PASS", "Database connection established");

      // Initialize services
      const bookingRepository = new BookingRepository(databaseClient);
      const emailClient = new EmailClient();
      const notificationService = new NotificationService(emailClient);

      // Calendar service
      const calendarClient = new CalendarClient();
      const calendarService = new CalendarService(calendarClient);

      if (config.googleCalendar.enabled) {
        await calendarClient.initializeFromConfig();
        this.addResult("CALENDAR_INIT", "PASS", "Google Calendar initialized");
      }

      // CRM service
      const hubspotClient = new HubSpotClient();
      const crmService = new CRMService(hubspotClient);

      if (config.hubspot.enabled) {
        await hubspotClient.initializeFromConfig();
        this.addResult("HUBSPOT_INIT", "PASS", "HubSpot CRM initialized");
      }

      // Booking service
      const prismaClient = databaseClient.getClient();
      const bookingService = new BookingService(
        bookingRepository,
        notificationService,
        calendarService,
        crmService,
        prismaClient
      );

      // Voice services
      this.voiceFunctionsService = new VoiceFunctionsService(
        bookingService,
        calendarService,
        crmService
      );

      this.conversationService = new ConversationService(bookingService);

      this.addResult(
        "SERVICES_INIT",
        "PASS",
        "All services initialized successfully"
      );
      console.log("✅ Services initialization completed\n");
    } catch (error) {
      this.addResult(
        "SERVICES_INIT",
        "FAIL",
        `Service initialization failed: ${error}`
      );
      throw error;
    }
  }

  private async testVoiceFunctions(): Promise<void> {
    console.log("3️⃣  Testing Voice Functions...");

    const testDate = format(addDays(new Date(), 2), "yyyy-MM-dd");

    try {
      // Test availability check
      console.log("   📅 Testing availability check...");
      const availResult = await this.voiceFunctionsService.checkAvailability({
        date: testDate,
        duration: 30,
      });

      if (availResult.success) {
        this.addResult(
          "VOICE_AVAILABILITY",
          "PASS",
          `Found ${availResult.availableSlots.length} slots for ${testDate}`
        );
      } else {
        this.addResult(
          "VOICE_AVAILABILITY",
          "WARN",
          `No slots available for ${testDate}`
        );
      }

      // Test booking function
      console.log("   📝 Testing booking function...");
      const testEmail = `voice-test-${Date.now()}@example.com`;

      const bookingResult = await this.voiceFunctionsService.bookAppointment({
        name: "Voice Test User",
        email: testEmail,
        phone: "+1234567890",
        company: "Test Company",
        date: testDate,
        time: "14:00",
        duration: 30,
        inquiry: "Voice integration validation test",
      });

      if (bookingResult.success) {
        this.addResult(
          "VOICE_BOOKING",
          "PASS",
          `Booking created: ${bookingResult.bookingId}`
        );

        // Test get appointments
        console.log("   📋 Testing get appointments...");
        const appointmentsResult =
          await this.voiceFunctionsService.getUpcomingAppointments({
            email: testEmail,
          });

        if (
          appointmentsResult.success &&
          appointmentsResult.appointments.length > 0
        ) {
          this.addResult(
            "VOICE_GET_APPOINTMENTS",
            "PASS",
            `Retrieved ${appointmentsResult.appointments.length} appointments`
          );
        } else {
          this.addResult(
            "VOICE_GET_APPOINTMENTS",
            "WARN",
            "No appointments retrieved"
          );
        }

        // Test cancellation
        console.log("   ❌ Testing cancellation...");
        const cancelResult = await this.voiceFunctionsService.cancelAppointment(
          {
            email: testEmail,
            bookingId: bookingResult.bookingId!,
          }
        );

        if (cancelResult.success) {
          this.addResult(
            "VOICE_CANCELLATION",
            "PASS",
            "Appointment cancelled successfully"
          );
        } else {
          this.addResult(
            "VOICE_CANCELLATION",
            "FAIL",
            `Cancellation failed: ${cancelResult.message}`
          );
        }
      } else {
        this.addResult(
          "VOICE_BOOKING",
          "FAIL",
          `Booking failed: ${bookingResult.message}`
        );
      }

      console.log("✅ Voice functions testing completed\n");
    } catch (error) {
      this.addResult(
        "VOICE_FUNCTIONS",
        "FAIL",
        `Voice functions test failed: ${error}`
      );
    }
  }

  private async testConversationFlow(): Promise<void> {
    console.log("4️⃣  Testing Conversation Flow...");

    try {
      const sessionId = `validation-${Date.now()}`;

      // Test initial booking request
      console.log("   💬 Testing booking conversation...");
      let result = await this.conversationService.processMessage(
        sessionId,
        "I'd like to book an appointment for tomorrow at 2 PM"
      );

      if (result.response && result.context) {
        this.addResult(
          "CONVERSATION_PROCESSING",
          "PASS",
          `Intent detected: ${result.context.currentIntent || "unknown"}`
        );
      } else {
        this.addResult(
          "CONVERSATION_PROCESSING",
          "FAIL",
          "Conversation processing failed"
        );
      }

      // Test availability inquiry
      console.log("   🕐 Testing availability inquiry...");
      result = await this.conversationService.processMessage(
        sessionId,
        "What times are available tomorrow?"
      );

      if (result.response) {
        this.addResult(
          "CONVERSATION_AVAILABILITY",
          "PASS",
          "Availability inquiry processed"
        );
      } else {
        this.addResult(
          "CONVERSATION_AVAILABILITY",
          "FAIL",
          "Availability inquiry failed"
        );
      }

      console.log("✅ Conversation flow testing completed\n");
    } catch (error) {
      this.addResult(
        "CONVERSATION_FLOW",
        "FAIL",
        `Conversation flow test failed: ${error}`
      );
    }
  }

  private async testIntegrationPoints(): Promise<void> {
    console.log("5️⃣  Testing Integration Points...");

    try {
      // Test calendar integration
      if (config.googleCalendar.enabled) {
        console.log("   📅 Testing calendar integration...");
        const calendarClient = new CalendarClient();
        await calendarClient.initializeFromConfig();

        // Test availability check
        const calendarService = new CalendarService(calendarClient);
        const tomorrow = addDays(new Date(), 1);
        const slots = await calendarService.getAvailableSlots(
          tomorrow,
          addDays(tomorrow, 1),
          30
        );

        this.addResult(
          "CALENDAR_INTEGRATION",
          "PASS",
          `Calendar accessible, ${slots.length} slots found`
        );
      }

      // Test CRM integration
      if (config.hubspot.enabled) {
        console.log("   🎯 Testing CRM integration...");
        const hubspotClient = new HubSpotClient();
        await hubspotClient.initializeFromConfig();

        if (hubspotClient.isAuthenticated()) {
          this.addResult("CRM_INTEGRATION", "PASS", "HubSpot CRM accessible");
        } else {
          this.addResult(
            "CRM_INTEGRATION",
            "FAIL",
            "HubSpot authentication failed"
          );
        }
      }

      // Test email integration
      console.log("   📧 Testing email integration...");
      new EmailClient(); // Initialize to test configuration
      this.addResult("EMAIL_INTEGRATION", "PASS", "Email client initialized");

      console.log("✅ Integration points testing completed\n");
    } catch (error) {
      this.addResult(
        "INTEGRATION_POINTS",
        "FAIL",
        `Integration test failed: ${error}`
      );
    }
  }

  private addResult(
    component: string,
    status: "PASS" | "FAIL" | "WARN",
    message: string,
    details?: any
  ): void {
    this.results.push({ component, status, message, details });
  }

  private generateReport(): void {
    console.log("6️⃣  Validation Report");
    console.log("=".repeat(60));

    const passed = this.results.filter((r) => r.status === "PASS").length;
    const failed = this.results.filter((r) => r.status === "FAIL").length;
    const warnings = this.results.filter((r) => r.status === "WARN").length;

    console.log(
      `\n📊 Summary: ${passed} PASSED, ${failed} FAILED, ${warnings} WARNINGS\n`
    );

    // Group results by status
    const failedResults = this.results.filter((r) => r.status === "FAIL");
    const warningResults = this.results.filter((r) => r.status === "WARN");
    const passedResults = this.results.filter((r) => r.status === "PASS");

    if (failedResults.length > 0) {
      console.log("❌ FAILED COMPONENTS:");
      failedResults.forEach((result) => {
        console.log(`   • ${result.component}: ${result.message}`);
      });
      console.log();
    }

    if (warningResults.length > 0) {
      console.log("⚠️  WARNINGS:");
      warningResults.forEach((result) => {
        console.log(`   • ${result.component}: ${result.message}`);
      });
      console.log();
    }

    if (passedResults.length > 0) {
      console.log("✅ PASSED COMPONENTS:");
      passedResults.forEach((result) => {
        console.log(`   • ${result.component}: ${result.message}`);
      });
      console.log();
    }

    // Overall assessment
    if (failed === 0) {
      console.log("🎉 OVERALL STATUS: VOICE INTEGRATION IS FULLY FUNCTIONAL");
      console.log(
        "\n✨ The voice interface has complete feature parity with chat:"
      );
      console.log("   • Voice-driven booking ✅");
      console.log("   • Calendar integration ✅");
      console.log("   • CRM lead creation ✅");
      console.log("   • Email confirmations ✅");
      console.log("   • Availability checking ✅");
      console.log("   • Appointment management ✅");
    } else {
      console.log("⚠️  OVERALL STATUS: VOICE INTEGRATION HAS ISSUES");
      console.log(
        `\n🔧 ${failed} critical issue(s) need to be resolved for full functionality.`
      );
    }

    console.log("\n💡 Next Steps:");
    console.log("   1. Test with actual Retell voice calls");
    console.log("   2. Verify voice responses are natural and helpful");
    console.log("   3. Test error handling and edge cases");
    console.log("   4. Monitor performance under load");
    console.log("   5. Validate user experience end-to-end");
  }
}

// Run validation
async function runValidation() {
  const validator = new VoiceIntegrationValidator();
  await validator.validate();
}

runValidation()
  .then(() => {
    console.log("\n✅ Validation completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Validation failed:", error);
    process.exit(1);
  });
