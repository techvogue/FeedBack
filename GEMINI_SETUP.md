# Gemini Flash API Setup Guide

## 🚀 Getting Started with Google Gemini Flash API

### 1. Get Your API Key

1. **Visit Google AI Studio**: Go to [https://aistudio.google.com/](https://aistudio.google.com/)
2. **Sign in** with your Google account
3. **Create a new API key**:
   - Click on "Get API key" in the top right
   - Select "Create API key"
   - Copy your API key

### 2. Configure Environment Variables

Add your Gemini API key to your `backend/.env` file:

```env
# Google Gemini AI (Free Tier)
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Free Tier Limits

Gemini Flash API offers generous free tier limits:
- **Input tokens**: 15M tokens/month
- **Output tokens**: 15M tokens/month
- **Requests per minute**: 60 requests
- **Perfect for most feedback analysis needs**

### 4. Test the Setup

1. **Start your backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the AI health endpoint**:
   ```bash
   curl http://localhost:5000/api/ai-health
   ```

3. **Expected response**:
   ```json
   {
     "status": "healthy",
     "geminiAvailable": true,
     "model": "gemini-1.5-flash",
     "testResponse": "Hello! How can I help you today?"
   }
   ```

### 5. Usage in Your App

The AI analysis will now automatically:
- ✅ Use Gemini Flash for feedback analysis
- ✅ Provide structured insights
- ✅ Fall back to basic summary if AI is unavailable
- ✅ Show real-time analysis status

### 6. Features

- **Fast Analysis**: 1-3 second response times
- **Structured Output**: Organized insights with clear sections
- **Error Handling**: Graceful fallbacks when AI is unavailable
- **Status Tracking**: Real-time feedback on AI availability
- **Cost Effective**: Free tier covers most use cases

### 7. Troubleshooting

**Issue**: "GEMINI_API_KEY not configured"
**Solution**: Add your API key to the `.env` file

**Issue**: "API key invalid"
**Solution**: Check your API key at Google AI Studio

**Issue**: "Rate limit exceeded"
**Solution**: Wait a minute and try again (60 requests/minute limit)

**Issue**: "Model not available"
**Solution**: The free tier should work automatically

### 8. Cost Monitoring

Monitor your usage at: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 9. Security Notes

- ✅ Never commit your API key to version control
- ✅ Use environment variables for configuration
- ✅ Monitor usage to stay within free tier limits
- ✅ API keys are tied to your Google account

## 🎉 You're Ready!

Your feedback app now uses Google's powerful Gemini Flash AI for intelligent feedback analysis. The AI will provide:

- **Sentiment Analysis**: Overall mood and satisfaction
- **Key Insights**: Most important feedback points
- **Actionable Recommendations**: Specific improvements
- **Trend Analysis**: Patterns in responses

Enjoy faster, more reliable AI-powered feedback analysis! 🚀
