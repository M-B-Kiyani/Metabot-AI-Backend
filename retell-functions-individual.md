# Retell Functions - Individual Setup Guide

Copy and paste each function below into your Retell dashboard one by one.

## Function 1: check_availability

**Name:** `check_availability`

**Description:** `Check available appointment slots for a given date and time range`

**Parameters (JSON):**

```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "description": "Date in YYYY-MM-DD format"
    },
    "time": {
      "type": "string",
      "description": "Preferred time in HH:MM format (24-hour)"
    },
    "duration": {
      "type": "integer",
      "description": "Duration in minutes (15, 30, 45, or 60)"
    },
    "timezone": {
      "type": "string",
      "description": "Timezone (default: Europe/London)",
      "default": "Europe/London"
    }
  },
  "required": ["date", "time", "duration"]
}
```

---

## Function 2: create_booking

**Name:** `create_booking`

**Description:** `Create a new appointment booking with all integrations`

**Parameters (JSON):**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Full name of the person booking"
    },
    "email": {
      "type": "string",
      "description": "Email address for confirmation"
    },
    "date": {
      "type": "string",
      "description": "Date in YYYY-MM-DD format"
    },
    "time": {
      "type": "string",
      "description": "Time in HH:MM format (24-hour)"
    },
    "duration": {
      "type": "integer",
      "description": "Duration in minutes (15, 30, 45, or 60)"
    },
    "phone": {
      "type": "string",
      "description": "Phone number (optional)"
    },
    "company": {
      "type": "string",
      "description": "Company name (optional)"
    },
    "timezone": {
      "type": "string",
      "description": "Timezone (default: Europe/London)",
      "default": "Europe/London"
    }
  },
  "required": ["name", "email", "date", "time", "duration"]
}
```

---

## Function 3: get_upcoming_appointments

**Name:** `get_upcoming_appointments`

**Description:** `Get upcoming appointments for a user by email`

**Parameters (JSON):**

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "description": "Email address to look up appointments"
    }
  },
  "required": ["email"]
}
```

---

## Function 4: reschedule_appointment

**Name:** `reschedule_appointment`

**Description:** `Reschedule an existing appointment`

**Parameters (JSON):**

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "description": "Email address of the booking"
    },
    "appointment_id": {
      "type": "string",
      "description": "ID of the appointment to reschedule"
    },
    "new_date": {
      "type": "string",
      "description": "New date in YYYY-MM-DD format"
    },
    "new_time": {
      "type": "string",
      "description": "New time in HH:MM format (24-hour)"
    },
    "new_duration": {
      "type": "integer",
      "description": "New duration in minutes (optional, keeps original if not provided)"
    }
  },
  "required": ["email", "appointment_id", "new_date", "new_time"]
}
```

---

## Function 5: cancel_appointment

**Name:** `cancel_appointment`

**Description:** `Cancel an existing appointment`

**Parameters (JSON):**

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "description": "Email address of the booking"
    },
    "appointment_id": {
      "type": "string",
      "description": "ID of the appointment to cancel"
    }
  },
  "required": ["email", "appointment_id"]
}
```

---

## Function 6: update_crm_contact

**Name:** `update_crm_contact`

**Description:** `Update or create a CRM contact with additional information`

**Parameters (JSON):**

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "description": "Email address of the contact"
    },
    "name": {
      "type": "string",
      "description": "Full name"
    },
    "phone": {
      "type": "string",
      "description": "Phone number (optional)"
    },
    "company": {
      "type": "string",
      "description": "Company name (optional)"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes or inquiry details (optional)"
    }
  },
  "required": ["email", "name"]
}
```

---

## Setup Instructions:

1. **Go to Retell Dashboard** → Your Agent → Functions section
2. **Click "Add Function"** for each function above
3. **Copy the Name** exactly as shown
4. **Copy the Description** exactly as shown
5. **Copy the Parameters JSON** exactly as shown
6. **Save each function** before adding the next one
7. **Update your system prompt** with the content from `retell-updated-prompt.md`
8. **Test each function** after setup

## Important Notes:

- Function names are case-sensitive
- JSON parameters must be valid JSON format
- Required fields must match exactly
- Test functions individually after adding them
