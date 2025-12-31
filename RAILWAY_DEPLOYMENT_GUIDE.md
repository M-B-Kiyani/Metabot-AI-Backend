# Railway Deployment Fix Guide

## Issues Identified:

1. **401 Unauthorized**: CORS and authentication issues
2. **CalendarClient not initialized**: Google Service Account not properly configured on Railway
3. **Missing environment variables**: Some variables need Railway-specific values

## Solutions:

### 1. Update Railway Environment Variables

Add/Update these variables in your Railway dashboard:

#### Google Service Account (CRITICAL)

```bash
# Set the entire JSON content as a string (remove line breaks and escape quotes)
GOOGLE_SERVICE_ACCOUNT_JSON=""

# Remove the file path variable since we're using JSON content
# GOOGLE_SERVICE_ACCOUNT_KEY_PATH=  # Remove this or leave empty
```

#### CORS Configuration (CRITICAL)

```bash
# Add your local frontend to allowed origins
ALLOWED_ORIGINS=http://localhost:5173,https://metabot-ai-backend-production.up.railway.app

# Ensure proper headers are allowed
ALLOWED_HEADERS=Content-Type,Authorization,x-api-key
```

#### Other Important Variables

```bash
NODE_ENV=production
PORT=3000
API_BASE_URL=https://metabot-ai-backend-production.up.railway.app
```

### 2. Frontend Configuration

Update your frontend's API configuration to point to the Railway backend:

```javascript
// In your frontend config
const API_BASE_URL = "https://metabot-ai-backend-production.up.railway.app/api";

// Make sure your frontend sends requests with proper headers
const headers = {
  "Content-Type": "application/json",
  // Note: Available slots endpoint doesn't require API key
  // Only booking creation/modification requires API key
};
```

### 3. Test the Fix

After updating the environment variables on Railway:

1. **Redeploy** your Railway service (it should restart automatically)
2. **Check the logs** for successful Google Calendar initialization
3. **Test the available slots endpoint** from your frontend

### 4. Verification Steps

1. **Check Railway logs** for:

   ```
   ✅ Google Calendar initialized successfully
   ```

2. **Test the endpoint** directly:

   ```bash
   curl "https://metabot-ai-backend-production.up.railway.app/api/bookings/available-slots?startDate=2025-12-31T00:00:00Z&endDate=2026-01-07T00:00:00Z&duration=30"
   ```

3. **Verify CORS** is working by checking browser network tab for successful OPTIONS requests

### 5. Common Issues

- **JSON Parsing Error**: Make sure the JSON is properly escaped and on a single line
- **CORS Issues**: Ensure `http://localhost:5173` is in `ALLOWED_ORIGINS`
- **Still getting file path error**: Make sure to remove or clear `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`

The backend code has been updated to handle both JSON environment variables and file paths, prioritizing the JSON approach for cloud deployments.
