# SendGrid Setup for Railway Email

## 🚀 Quick SendGrid Setup (Recommended for Railway)

SendGrid is the most Railway-compatible email service. Here's how to set it up:

### 1. Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### 2. Get API Key

1. Login to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access**
5. Give it a name like "Railway Production"
6. Under **Mail Send**, select **Full Access**
7. Click **Create & View**
8. **Copy the API key** (you won't see it again!)

### 3. Update Railway Environment Variables

In your Railway project, update these variables:

```bash
# Replace Hostinger SMTP with SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key_here

# Keep these the same
FROM_EMAIL=your_email@yourdomain.com
FROM_NAME=Your Company Name
ADMIN_EMAIL=admin@yourdomain.com
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=2000
```

### 4. Verify Sender Identity (Important!)

SendGrid requires sender verification:

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification**
3. Add `your_email@yourdomain.com` as a verified sender
4. Check your email and click the verification link

### 5. Deploy and Test

1. **Redeploy** your Railway service (to pick up new environment variables)
2. **Test** by making a booking through your frontend
3. **Check Railway logs** for any email errors

## 🔧 Alternative: Gmail SMTP (Quick Test)

If you want to test quickly with Gmail:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

**Note**: You need to enable 2FA and create an App Password in Gmail settings.

## 🎯 Why SendGrid Works Better on Railway

1. **Railway-friendly**: SendGrid's SMTP servers work well with Railway's infrastructure
2. **Reliable**: Better deliverability than shared hosting SMTP
3. **Monitoring**: Built-in email analytics and bounce handling
4. **Scalable**: Free tier gives you 100 emails/day, paid plans scale up
5. **Support**: Better support for cloud deployments

## 🔍 Testing Your Setup

After updating the variables and redeploying:

1. Make a test booking through your frontend
2. Check Railway deployment logs for email success/failure
3. Check your email inbox (and spam folder)
4. Look for SendGrid delivery confirmations in their dashboard

## 📞 Quick Verification

You can run this test script locally (with SendGrid credentials) to verify it works:

```bash
npx tsx scripts/test-email-system.ts
```

## 🆘 If Still Having Issues

1. **Check SendGrid dashboard** for delivery status
2. **Verify sender email** is authenticated in SendGrid
3. **Check Railway logs** for detailed error messages
4. **Try Gmail SMTP** as a backup test
5. **Contact SendGrid support** if API key issues persist

The key is that Railway's infrastructure works much better with dedicated email services like SendGrid than with shared hosting SMTP servers like Hostinger.
