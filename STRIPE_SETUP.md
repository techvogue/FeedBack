# Stripe Payment Integration Setup Guide

## 🚀 Getting Started with Stripe

### 1. Create Stripe Account

1. **Visit Stripe**: Go to [https://stripe.com/](https://stripe.com/)
2. **Sign up** for a new account
3. **Complete account verification** (required for live payments)
4. **Access Dashboard** at [https://dashboard.stripe.com/](https://dashboard.stripe.com/)

### 2. Get Your API Keys

1. **Navigate to Developers**: In your Stripe dashboard
2. **Go to API Keys**: Developers → API Keys
3. **Copy Keys**:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - ⚠️ **Important**: Keep your Secret Key secure and never share it

### 3. Configure Environment Variables

Add this to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_test_secret_key_here"
```

### 4. Test Mode vs Live Mode

#### **Test Mode (Recommended for Development)**
- Use test API keys (start with `sk_test_`)
- No real money transactions
- Perfect for development and testing
- Test cards available in Stripe docs

#### **Live Mode (Production)**
- Use live API keys (start with `sk_live_`)
- Real money transactions
- Requires completed account verification
- Use only after thorough testing

### 5. Test Cards for Development

Use these test cards in development:

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4242 4242 4242 4242 | Any future date | Any 3 digits | Success |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Decline |
| 4000 0000 0000 9995 | Any future date | Any 3 digits | Insufficient Funds |

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
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

4. **Verify success**:
   - Should redirect to thank you page
   - Check ticket details
   - Verify payment in Stripe dashboard

### 7. Payment Flow

```
User clicks "Buy Ticket" 
    ↓
Create ticket record (backend)
    ↓
Create Stripe checkout session
    ↓
Redirect to Stripe Checkout
    ↓
User completes payment
    ↓
Stripe redirects to success URL
    ↓
Verify payment (backend)
    ↓
Update ticket status to CONFIRMED
    ↓
Show thank you page
```

### 8. Security Features

✅ **Server-side Payment Verification**: All validations on backend
✅ **Environment Variables**: Secure key storage
✅ **HTTPS Required**: Secure communication
✅ **Input Validation**: Sanitized user inputs
✅ **Session-based Verification**: Secure payment confirmation

### 9. Error Handling

The system handles various error scenarios:

- **Invalid API keys**: Clear error messages
- **Payment failures**: Graceful fallback
- **Network issues**: Retry mechanisms
- **Duplicate purchases**: Prevents multiple tickets
- **Session expiration**: Handles expired checkout sessions

### 10. Production Checklist

Before going live:

- [ ] Complete Stripe account verification
- [ ] Switch to live API keys
- [ ] Test with real payment methods
- [ ] Set up webhook notifications (optional)
- [ ] Configure refund policies
- [ ] Set up customer support
- [ ] Test all error scenarios

### 11. Webhook Setup (Optional)

For real-time payment updates:

1. **Configure webhook URL** in Stripe dashboard
2. **Add webhook endpoint** to your backend
3. **Verify webhook signature** for security
4. **Handle payment events** (success, failure, refund)

### 12. Troubleshooting

**Issue**: "Invalid API key"
**Solution**: Check your API key in `.env` file

**Issue**: "Payment verification failed"
**Solution**: Verify your secret key is correct

**Issue**: "Checkout session not found"
**Solution**: Check Stripe dashboard for session status

**Issue**: "Payment not completed"
**Solution**: Ensure payment was successful in Stripe

### 13. Cost Structure

Stripe charges:
- **Transaction Fee**: 2.9% + ₹3 (for most payment methods)
- **Setup Fee**: ₹0 (no setup charges)
- **Monthly Fee**: ₹0 (no monthly charges)
- **Refund Fee**: ₹0 (no charges for refunds)

### 14. Support

- **Stripe Support**: [support@stripe.com](mailto:support@stripe.com)
- **Documentation**: [https://stripe.com/docs/](https://stripe.com/docs/)
- **API Reference**: [https://stripe.com/docs/api/](https://stripe.com/docs/api/)

## 🎉 You're Ready!

Your ticket booking system now supports:
- ✅ Secure payment processing with Stripe Checkout
- ✅ Real-time payment verification
- ✅ Professional payment UI
- ✅ Error handling and validation
- ✅ Mobile-responsive design
- ✅ Multiple payment methods

Enjoy seamless ticket sales with Stripe! 🚀
