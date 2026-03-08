import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin SDK
const firebaseConfig = {
  apiKey: "AIzaSyD6CoiozFrzftUyBn5UaQU2fwzPFRE9NyU",
  authDomain: "mskweb-1db5c.firebaseapp.com",
  projectId: "mskweb-1db5c",
  storageBucket: "mskweb-1db5c.firebasestorage.app",
  messagingSenderId: "953778688896",
  appId: "1:953778688896:web:8c6b1df9b10fcc0a632765",
  measurementId: "G-MG37FPPD16",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    ...firebaseConfig,
  });
}
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:8080",
      "https://shop-go-main-1.vercel.app",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());

// Yoco Configuration
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
const YOCO_API_BASE = "https://payments.yoco.com/api";

if (!YOCO_SECRET_KEY) {
  console.error("⚠️  WARNING: YOCO_SECRET_KEY not set!");
}

/**
 * Yoco Webhook Handler
 * POST /api/webhooks/yoco
 * This will be called by Yoco when payment events occur
 */
app.post(
  "/api/webhooks/yoco",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      console.log("🔔 Webhook received from Yoco");
      console.log("Headers:", req.headers);

      const event = JSON.parse(req.body.toString());
      console.log("📦 Webhook event:", JSON.stringify(event, null, 2));

      // Acknowledge receipt immediately
      res.status(200).json({ received: true });

      // Process the webhook event
      if (
        event.type === "checkout.succeeded" ||
        event.type === "payment.succeeded"
      ) {
        console.log("✅ Payment succeeded webhook received");
        console.log("Checkout ID:", event.payload?.id);
        console.log("Payment ID:", event.payload?.paymentId);
        console.log("Metadata:", event.payload?.metadata);

        // Save order to Firebase
        const orderId = event.payload?.metadata?.orderId;
        if (orderId) {
          try {
            const orderData = JSON.parse(
              event.payload.metadata.orderData || "{}",
            );
            orderData.payment = {
              paymentId: event.payload.paymentId || event.payload.id,
              status: "completed",
              method: "yoco",
              amountPaid: event.payload.amount / 100, // Convert from cents
            };
            orderData.status = "confirmed";

            await db
              .collection("orders")
              .doc(orderId.replace("#", ""))
              .set(orderData);
            console.log("✅ Order saved to Firebase:", orderId);
          } catch (err) {
            console.error("Failed to save order from webhook:", err);
          }
        }
      } else if (event.type === "checkout.cancelled") {
        console.log("❌ Payment cancelled webhook received");
      } else if (event.type === "checkout.failed") {
        console.log("❌ Payment failed webhook received");
      } else {
        console.log("ℹ️ Unknown webhook event type:", event.type);
      }
    } catch (error) {
      console.error("💥 Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  },
);

/**
 * Root endpoint
 */
app.get("/", (req, res) => {
  res.json({
    service: "Payment Server",
    status: "running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      checkout: "POST /api/payments/checkout",
      webhook: "POST /api/webhooks/yoco",
      refund: "POST /api/payments/refund",
    },
  });
});

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    yocoConfigured: !!YOCO_SECRET_KEY,
  });
});

/**
 * Create a checkout session (Modern Yoco Checkout API)
 * POST /api/payments/checkout
 */
app.post("/api/payments/checkout", async (req, res) => {
  try {
    const { amount, currency, metadata, successUrl, cancelUrl, failureUrl } =
      req.body;

    console.log("📝 Checkout request received:", {
      amount,
      currency,
      metadata,
      successUrl,
      cancelUrl,
    });

    // Validate input
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: amount (in cents)",
      });
    }

    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error: YOCO_SECRET_KEY not set",
      });
    }

    // Create checkout session with Yoco
    const yocoPayload = {
      amount: amount,
      currency: currency || "ZAR",
      metadata: metadata || {},
    };

    // Add redirect URLs if provided
    if (successUrl) yocoPayload.successUrl = successUrl;
    if (cancelUrl) yocoPayload.cancelUrl = cancelUrl;
    if (failureUrl) yocoPayload.failureUrl = failureUrl;

    console.log(
      "📤 Sending to Yoco API:",
      JSON.stringify(yocoPayload, null, 2),
    );

    const yocoResponse = await fetch(`${YOCO_API_BASE}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(yocoPayload),
    });

    const data = await yocoResponse.json();

    if (!yocoResponse.ok) {
      console.error("❌ Yoco API error:", data);
      return res.status(yocoResponse.status).json({
        success: false,
        error: data.errorMessage || data.message || "Checkout creation failed",
        details: data,
      });
    }

    console.log("✅ Checkout created:", data.id);
    console.log("📥 Yoco response:", JSON.stringify(data, null, 2));

    // Return checkout session with redirect URL
    res.json({
      success: true,
      id: data.id,
      status: data.status,
      redirectUrl: data.redirectUrl,
      amount: data.amount,
      currency: data.currency,
      createdDate: data.createdDate,
    });
  } catch (error) {
    console.error("💥 Checkout error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Get checkout status
 * GET /api/payments/checkout/:checkoutId
 */
app.get("/api/payments/checkout/:checkoutId", async (req, res) => {
  try {
    const { checkoutId } = req.params;

    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    const response = await fetch(`${YOCO_API_BASE}/checkouts/${checkoutId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "Failed to get checkout status",
        details: data,
      });
    }

    res.json({
      success: true,
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      createdDate: data.createdDate,
      metadata: data.metadata,
    });
  } catch (error) {
    console.error("Checkout status error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Legacy: Create payment charge (OLD API - keeping for backwards compatibility)
 * POST /api/payments/charge
 */
app.post("/api/payments/charge", async (req, res) => {
  try {
    const { token, amountInCents, currency, metadata } = req.body;

    console.log("📝 Payment request received:", {
      amountInCents,
      currency,
      hasToken: !!token,
    });

    // Validate input
    if (!token || !amountInCents) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: token and amountInCents",
      });
    }

    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error: YOCO_SECRET_KEY not set",
      });
    }

    // Call Yoco Payments API
    const yocoResponse = await fetch(`${YOCO_API_BASE}/v1/charges/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        amountInCents,
        currency: currency || "ZAR",
        metadata: metadata || {},
      }),
    });

    const data = await yocoResponse.json();

    if (!yocoResponse.ok) {
      console.error("❌ Yoco API error:", data);
      return res.status(yocoResponse.status).json({
        success: false,
        error:
          data.message || data.displayMessage || "Payment processing failed",
        details: data,
      });
    }

    console.log("✅ Payment successful:", data.id);

    // Return successful response
    res.json({
      success: true,
      id: data.id,
      status: data.status,
      amountInCents: data.amountInCents,
      currency: data.currency,
      createdDate: data.createdDate,
      metadata: data.metadata,
    });
  } catch (error) {
    console.error("💥 Payment error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Verify payment status
 * GET /api/payments/verify/:paymentId
 */
app.get("/api/payments/verify/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    const response = await fetch(`${YOCO_API_BASE}/v1/charges/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "Verification failed",
        details: data,
      });
    }

    res.json({
      success: true,
      id: data.id,
      status: data.status,
      amountInCents: data.amountInCents,
      currency: data.currency,
      createdDate: data.createdDate,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Refund a payment
 * POST /api/payments/refund
 */
app.post("/api/payments/refund", async (req, res) => {
  try {
    const { chargeId, amountInCents } = req.body;

    if (!chargeId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: chargeId",
      });
    }

    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    const response = await fetch(
      `${YOCO_API_BASE}/v1/charges/${chargeId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${YOCO_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountInCents: amountInCents || undefined, // Full refund if not specified
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "Refund failed",
        details: data,
      });
    }

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Register webhook with Yoco
 * POST /api/webhooks/register
 */
app.post("/api/webhooks/register", async (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name and url",
      });
    }

    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error: YOCO_SECRET_KEY not set",
      });
    }

    console.log("📝 Registering webhook with Yoco:", { name, url });

    const response = await fetch(`${YOCO_API_BASE}/webhooks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        url: url,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Webhook registration error:", data);
      return res.status(response.status).json({
        success: false,
        error:
          data.errorMessage || data.message || "Webhook registration failed",
        details: data,
      });
    }

    console.log("✅ Webhook registered successfully:", data.id);
    console.log("🔑 IMPORTANT: Save this secret:", data.secret);

    res.json({
      success: true,
      id: data.id,
      mode: data.mode,
      name: data.name,
      url: data.url,
      secret: data.secret, // IMPORTANT: Save this! Only provided once
      message:
        "⚠️ IMPORTANT: Save the 'secret' value! It's only provided once and needed for webhook verification.",
    });
  } catch (error) {
    console.error("💥 Webhook registration error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * List registered webhooks
 * GET /api/webhooks/list
 */
app.get("/api/webhooks/list", async (req, res) => {
  try {
    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    const response = await fetch(`${YOCO_API_BASE}/webhooks`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "Failed to list webhooks",
        details: data,
      });
    }

    res.json({
      success: true,
      webhooks: data,
    });
  } catch (error) {
    console.error("List webhooks error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("\n🚀 Payment Server");
  console.log("═══════════════════════════════════════");
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔑 Yoco configured: ${YOCO_SECRET_KEY ? "✅ YES" : "❌ NO"}`);
  console.log("\n📝 Available endpoints:");
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/api/payments/checkout`);
  console.log(`   GET  http://localhost:${PORT}/api/payments/checkout/:id`);
  console.log(`   POST http://localhost:${PORT}/api/payments/refund`);
  console.log(`   POST http://localhost:${PORT}/api/webhooks/register`);
  console.log(`   GET  http://localhost:${PORT}/api/webhooks/list`);
  console.log("═══════════════════════════════════════\n");
});

export default app;
