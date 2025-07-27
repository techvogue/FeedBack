# Google OAuth Setup Guide

## Fix for "redirect_uri_mismatch" Error

To fix the Google OAuth redirect_uri_mismatch error, follow these steps:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project or create a new one

### 2. Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" and enable it

### 3. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth 2.0 Client IDs"
- Choose "Web application"

### 4. Configure Authorized Redirect URIs
**IMPORTANT**: Add these exact URIs to the "Authorized redirect URIs" field:

```
http://localhost:5000/api/auth/google/callback
```

**For production, also add:**
```
https://yourdomain.com/api/auth/google/callback
```

### 5. Update Your Environment Variables
In your `backend/.env` file, add:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:5173"
```

### 6. Restart Your Backend Server
After updating the environment variables, restart your backend server:

```bash
cd backend
npm run dev
```

## Common Issues and Solutions

### Issue: "redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Console exactly matches:
- `http://localhost:5000/api/auth/google/callback` (development)
- `https://yourdomain.com/api/auth/google/callback` (production)

### Issue: "invalid_client"
**Solution**: Check that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct in your `.env` file.

### Issue: "access_denied"
**Solution**: Make sure you've enabled the Google+ API in your Google Cloud Console.

### Issue: "Authentication Successful! You can close this window now."
**Solution**: This means the OAuth is working but the redirect isn't happening. Make sure your `FRONTEND_URL` environment variable is set correctly.

## Testing
1. Start your backend server
2. Start your frontend server
3. Go to http://localhost:5173
4. Click "Login" or "Sign Up"
5. Click "Continue with Google"
6. You should be redirected to Google's OAuth page
7. After authorization, you should be redirected back to your app at `/oauth-success`
8. You should then be automatically logged in and redirected to the dashboard

## Security Notes
- Never commit your `.env` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your OAuth secrets 