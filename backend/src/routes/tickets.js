const express = require('express');
const passport = require('passport');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

// Test Stripe configuration
router.get('/test-stripe', (req, res) => {
  try {
    console.log('🧪 Testing Stripe configuration...');
    console.log('🔑 STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🔑 STRIPE_SECRET_KEY prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('❌ Stripe secret key not configured');
      return res.json({
        success: false,
        message: "Stripe secret key not configured",
        debug: {
          hasStripeKey: false,
          envVars: Object.keys(process.env).filter(key => key.includes('STRIPE'))
        }
      });
    }

    // Test Stripe connection
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    res.json({
      success: true,
      message: "Stripe is configured",
      debug: {
        hasKey: !!process.env.STRIPE_SECRET_KEY,
        keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) + "...",
        keyLength: process.env.STRIPE_SECRET_KEY?.length,
        isTestKey: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),
        envVars: Object.keys(process.env).filter(key => key.includes('STRIPE'))
      }
    });
  } catch (error) {
    console.error('❌ Stripe test error:', error);
    res.json({
      success: false,
      message: "Stripe configuration error",
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message
      }
    });
  }
});

// Create Stripe checkout session
router.post(
  '/create-checkout-session',
  passport.authenticate('jwt', { session: false }),
  ticketController.createCheckoutSession
);

// Verify payment (called after successful checkout) - NO AUTH REQUIRED
router.get('/verify-payment', ticketController.verifyPayment);

// Get user's tickets
router.get(
  '/my-tickets',
  passport.authenticate('jwt', { session: false }),
  ticketController.getUserTickets
);

// Get specific ticket
router.get(
  '/:ticketId',
  passport.authenticate('jwt', { session: false }),
  ticketController.getTicketById
);

module.exports = router;
