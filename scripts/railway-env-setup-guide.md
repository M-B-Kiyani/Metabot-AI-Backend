# Railway Environment Variables Setup Guide

## 📋 Required Environment Variables for Email

Copy these environment variables to your Railway project:

### 1. Go to Railway Dashboard

1. Open your Railway project
2. Click on your backend service
3. Go to the **Variables** tab
4. Add each variable below

### 2. Email Configuration Variables

```bash
# SMTP Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASSWORD=your_smtp_password

# Email Settings
FROM_EMAIL=your_email@yourdomain.com
FROM_NAME=Your Company Name
ADMIN_EMAIL=admin@yourdomain.com

# Email Retry Settings
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=2000
```

### 3. Other Required Variables

Make sure these are also set on Railway:

```bash
# Database (already set)
DATABASE_URL=your_railway_database_url_here

# API Configuration
API_KEY=your_secure_api_key_here
API_KEY_HEADER=Authorization

# Node Environment
NODE_ENV=production
PORT=3000

# CORS Settings
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-app.up.railway.app
ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
ALLOWED_HEADERS=Content-Type,Authorization,x-api-key
CORS_CREDENTIALS=true

# Business Rules
BUSINESS_DAYS=1,2,3,4,5
BUSINESS_START_HOUR=9
BUSINESS_END_HOUR=17
BUSINESS_TIMEZONE=Europe/London
BUFFER_MINUTES=15
MIN_ADVANCE_HOURS=1
MAX_ADVANCE_HOURS=24

# Google Calendar (if enabled)
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CALENDAR_ID=your_google_calendar_id_here
GOOGLE_CALENDAR_TIMEZONE=Europe/London
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com

# HubSpot (if enabled)
HUBSPOT_ENABLED=true
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token_here

# Retell AI (if enabled)
RETELL_ENABLED=true
RETELL_API_KEY=your_retell_api_key_here
RETELL_AGENT_ID=your_retell_agent_id_here

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🔧 Alternative Email Solutions for Railway

If Hostinger SMTP doesn't work on Railway, try these alternatives:

### Option 1: SendGrid (Recommended)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Option 2: Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASSWORD=your_mailgun_password
```

### Option 3: Gmail SMTP (for testing)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASSWORD=your_app_password
```

## 🚀 Testing on Railway

After setting up the variables:

1. **Redeploy your service** (Railway will pick up new environment variables)
2. **Check the logs** for any email-related errors
3. **Test with a booking** to see if emails are sent
4. **Monitor Railway logs** for SMTP connection issues

## 🔍 Common Railway Email Issues

1. **Port Blocking**: Railway might block certain SMTP ports
2. **IP Restrictions**: Some SMTP providers block Railway IPs
3. **Environment Variables**: Variables not properly set or loaded
4. **SSL/TLS Issues**: Connection encryption problems

## 📞 Quick Test Command

Once deployed, you can test email by making a booking through your API or frontend.

## 🆘 If Still Not Working

1. Check Railway deployment logs
2. Try a different SMTP provider (SendGrid recommended)
3. Consider using email service APIs instead of SMTP
4. Contact Railway support about SMTP restrictions
