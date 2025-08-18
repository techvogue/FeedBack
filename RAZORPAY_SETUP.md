# Razorpay Payment Integration Setup Guide

## 🚀 Getting Started with Razorpay

### 1. Create Razorpay Account

1. **Visit Razorpay**: Go to [https://razorpay.com/](https://razorpay.com/)
2. **Sign up** for a new account
3. **Complete KYC** verification (required for live payments)
4. **Access Dashboard** at [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)

### 2. Get Your API Keys

1. **Navigate to Settings**: In your Razorpay dashboard
2. **Go to API Keys**: Settings → API Keys
3. **Generate Keys**:
   - Click "Generate Key Pair"
   - Save both **Key ID** and **Key Secret**
   - ⚠️ **Important**: Keep your Key Secret secure and never share it

### 3. Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID="rzp_test_your_test_key_id_here"
RAZORPAY_KEY_SECRET="your_test_key_secret_here"
```

### 4. Test Mode vs Live Mode

#### **Test Mode (Recommended for Development)**
- Use test API keys (start with `rzp_test_`)
- No real money transactions
- Perfect for development and testing
- Test cards available in Razorpay docs

#### **Live Mode (Production)**
- Use live API keys (start with `rzp_live_`)
- Real money transactions
- Requires completed KYC
- Use only after thorough testing

### 5. Test Cards for Development

Use these test cards in development:

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future date | Any 3 digits | Success |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Failure |
| 4000 0000 0000 9995 | Any future date | Any 3 digits | Network Error |

### 6. Testing the Integration

1. **Start your backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Create an event with ticket price**:
   - Go to your app
   - Create a new event
   - Set a ticket price (e.g., ₹500)

3. **Test ticket purchase**:
   - Click "Buy Ticket" on the event
   - Fill in attendee details
   - Use test card: `4111 1111 1111 1111`
   - Complete payment

4. **Verify success**:
   - Should redirect to thank you page
   - Check ticket details
   - Verify payment in Razorpay dashboard

### 7. Payment Flow

```
User clicks "Buy Ticket" 
    ↓
Create ticket order (backend)
    ↓
Generate Razorpay order
    ↓
Open Razorpay payment modal
    ↓
User completes payment
    ↓
Verify payment signature (backend)
    ↓
Update ticket status to CONFIRMED
    ↓
Redirect to thank you page
```

### 8. Security Features

✅ **Payment Signature Verification**: Prevents tampering
✅ **Server-side Validation**: All validations on backend
✅ **Environment Variables**: Secure key storage
✅ **HTTPS Required**: Secure communication
✅ **Input Validation**: Sanitized user inputs

### 9. Error Handling

The system handles various error scenarios:

- **Invalid API keys**: Clear error messages
- **Payment failures**: Graceful fallback
- **Network issues**: Retry mechanisms
- **Duplicate purchases**: Prevents multiple tickets
- **Invalid signatures**: Security validation

### 10. Production Checklist

Before going live:

- [ ] Complete Razorpay KYC
- [ ] Switch to live API keys
- [ ] Test with real payment methods
- [ ] Set up webhook notifications (optional)
- [ ] Configure refund policies
- [ ] Set up customer support
- [ ] Test all error scenarios

### 11. Webhook Setup (Optional)

For real-time payment updates:

1. **Configure webhook URL** in Razorpay dashboard
2. **Add webhook endpoint** to your backend
3. **Verify webhook signature** for security
4. **Handle payment events** (success, failure, refund)

### 12. Troubleshooting

**Issue**: "Invalid API key"
**Solution**: Check your API keys in `.env` file

**Issue**: "Payment verification failed"
**Solution**: Verify your key secret is correct

**Issue**: "Order creation failed"
**Solution**: Check Razorpay dashboard for errors

**Issue**: "Signature verification failed"
**Solution**: Ensure key secret matches the key ID

### 13. Cost Structure

Razorpay charges:
- **Transaction Fee**: 2% + GST (for most payment methods)
- **Setup Fee**: ₹0 (no setup charges)
- **Monthly Fee**: ₹0 (no monthly charges)
- **Refund Fee**: ₹0 (no charges for refunds)

### 14. Support

- **Razorpay Support**: [support@razorpay.com](mailto:support@razorpay.com)
- **Documentation**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **API Reference**: [https://razorpay.com/docs/api/](https://razorpay.com/docs/api/)

## 🎉 You're Ready!

Your ticket booking system now supports:
- ✅ Secure payment processing
- ✅ Real-time payment verification
- ✅ Professional payment UI
- ✅ Error handling and validation
- ✅ Mobile-responsive design
- ✅ Multiple payment methods

Enjoy seamless ticket sales with Razorpay! 🚀
