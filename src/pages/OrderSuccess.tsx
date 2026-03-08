import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    const state = location.state as { orderId?: string };
    if (state?.orderId) {
      setOrderId(state.orderId);
    } else {
      // Redirect to shop if no order ID
      setTimeout(() => navigate("/shop"), 3000);
    }
  }, [location, navigate]);

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-background mt-16 py-12 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
              <CheckCircle
                size={120}
                className="text-green-500 relative z-10"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Success Message */}
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "Bebas Neue" }}
          >
            ORDER CONFIRMED
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase! Your order has been successfully placed
            and is being processed.
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="text-2xl font-bold text-foreground font-mono break-all">
                {orderId}
              </p>
            </div>
          )}

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Package className="text-primary" size={24} />
                <h3 className="font-semibold text-foreground">What's Next</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>✓ Order confirmation email sent</li>
                <li>✓ Processing your order</li>
                <li>✓ Packing & preparing shipment</li>
                <li>✓ Shipping updates via email</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="text-green-500" size={24} />
                <h3 className="font-semibold text-foreground">Support</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Have questions? Our customer support team is here to help. Check
                your email for order details and tracking information.
              </p>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-sm font-medium text-green-700">
              📦 Estimated Delivery: 3-5 Business Days
            </p>
            <p className="text-xs text-green-600 mt-1">
              Once your order ships, you'll receive a tracking number
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link to="/">
                <Home className="mr-2" size={20} />
                Back to Home
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              A confirmation email has been sent to your email address with all
              order details and tracking information.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default OrderSuccess;
