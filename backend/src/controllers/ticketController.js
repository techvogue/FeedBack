const { PrismaClient } = require("../../generated/prisma");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

// Generate unique ticket number
const generateTicketNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TKT-${timestamp}-${random}`.toUpperCase();
};

// Create Stripe checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { eventId, attendeeName, attendeeEmail } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!eventId || !attendeeName || !attendeeEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: eventId, attendeeName, attendeeEmail",
      });
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        ticketPrice: true,
        date: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.ticketPrice || event.ticketPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "This event is free. No ticket purchase required.",
      });
    }

    // Create ticket record first
    const ticket = await prisma.ticket.create({
      data: {
        eventId,
        userId,
        ticketNumber: generateTicketNumber(),
        attendeeName,
        attendeeEmail,
        ticketPrice: event.ticketPrice,
        status: "PENDING",
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
          },
        },
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Ticket for ${event.title}`,
              description: `Event: ${event.title}\nDate: ${new Date(event.date).toLocaleDateString()}\nAttendee: ${attendeeName}`,
            },
            unit_amount: Math.round(event.ticketPrice * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/thank-you?session_id={CHECKOUT_SESSION_ID}&ticket_id=${ticket.id}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${eventId}`,
      metadata: {
        ticketId: ticket.id,
        eventId: event.id,
        attendeeName: attendeeName,
        attendeeEmail: attendeeEmail,
      },
      customer_email: attendeeEmail,
    });

    // Update ticket with session ID
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { stripeSessionId: session.id },
    });

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        ticketPrice: ticket.ticketPrice,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.date,
      },
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

// Verify payment and confirm ticket
exports.verifyPayment = async (req, res) => {
  try {
    console.log('🔍 === PAYMENT VERIFICATION START ===');
    console.log('📋 Request Query:', req.query);
    console.log('📋 Request Headers:', req.headers);
    console.log('📋 Request Method:', req.method);
    console.log('📋 Request URL:', req.url);

    const { sessionId, ticketId } = req.query;

    console.log("🎫 Verify payment called with:", { sessionId, ticketId });

    if (!sessionId || !ticketId) {
      console.log("❌ Missing parameters:", { sessionId, ticketId });
      return res.status(400).json({
        success: false,
        message: "Missing session ID or ticket ID",
        debug: { sessionId, ticketId }
      });
    }

    // Check if Stripe is configured
    console.log("🔑 Checking Stripe configuration...");
    console.log("🔑 STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
    console.log("🔑 STRIPE_SECRET_KEY prefix:", process.env.STRIPE_SECRET_KEY?.substring(0, 7));

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("❌ Stripe secret key not configured");
      return res.status(500).json({
        success: false,
        message: "Stripe not configured",
        debug: { hasStripeKey: false }
      });
    }

    // Retrieve the checkout session from Stripe
    console.log("🔄 Retrieving Stripe session:", sessionId);
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log("✅ Stripe session retrieved successfully");
    } catch (stripeError) {
      console.log("❌ Stripe session retrieval failed:", stripeError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve Stripe session",
        error: stripeError.message,
        debug: { sessionId, stripeError: stripeError.message }
      });
    }

    if (!session) {
      console.log("❌ Stripe session not found:", sessionId);
      return res.status(404).json({
        success: false,
        message: "Checkout session not found",
        debug: { sessionId }
      });
    }

    console.log("📊 Stripe session found:", {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_email,
      metadata: session.metadata
    });

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      console.log("❌ Payment not completed:", session.payment_status);
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
        debug: {
          payment_status: session.payment_status,
          session_status: session.status,
          session_id: session.id
        }
      });
    }

    // Check if ticket exists
    console.log("🎫 Checking if ticket exists:", ticketId);
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket) {
      console.log("❌ Ticket not found:", ticketId);
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
        debug: { ticketId }
      });
    }

    console.log("✅ Ticket found:", {
      id: existingTicket.id,
      status: existingTicket.status,
      ticketNumber: existingTicket.ticketNumber,
      attendeeName: existingTicket.attendeeName
    });

    // Update ticket status
    console.log("🔄 Updating ticket status to CONFIRMED:", ticketId);
    let ticket;
    try {
      ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          stripePaymentIntentId: session.payment_intent,
          status: "CONFIRMED",
        },
        include: {
          event: {
            select: {
              title: true,
              date: true,
              bannerUrl: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      console.log("✅ Ticket updated successfully:", ticket.id);
    } catch (dbError) {
      console.log("❌ Database update failed:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to update ticket",
        error: dbError.message,
        debug: { ticketId, dbError: dbError.message }
      });
    }

    console.log("🎉 Payment verification completed successfully!");
    console.log("📋 Final ticket data:", {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      eventTitle: ticket.event.title
    });
    console.log('🔍 === PAYMENT VERIFICATION END ===');

    res.json({
      success: true,
      message: "Payment verified successfully",
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        ticketPrice: ticket.ticketPrice,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.date,
        eventBanner: ticket.event.bannerUrl,
        purchasedAt: ticket.purchasedAt,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error("💥 Verify payment error:", error);
    console.error("💥 Error stack:", error.stack);
    console.log('🔍 === PAYMENT VERIFICATION ERROR ===');

    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorStack: error.stack
      }
    });
  }
};

// Get user's tickets
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;

    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            bannerUrl: true,
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    });

    res.json({
      success: true,
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        ticketPrice: ticket.ticketPrice,
        status: ticket.status,
        purchasedAt: ticket.purchasedAt,
        event: {
          title: ticket.event.title,
          date: ticket.event.date,
          bannerUrl: ticket.event.bannerUrl,
        },
      })),
    });
  } catch (error) {
    console.error("Get user tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        userId,
      },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            bannerUrl: true,
            description: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        ticketPrice: ticket.ticketPrice,
        status: ticket.status,
        purchasedAt: ticket.purchasedAt,
        event: {
          title: ticket.event.title,
          date: ticket.event.date,
          bannerUrl: ticket.event.bannerUrl,
          description: ticket.event.description,
        },
      },
    });
  } catch (error) {
    console.error("Get ticket by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};
