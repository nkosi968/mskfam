import React, { useState } from "react";
import { CreditCard, Loader2, X, ShieldCheck } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderDescription?: string;
  orderId?: string;
  onPaymentSuccess?: () => void;
  onPaymentError: (error: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  customerName,
  customerPhone,
  customerEmail,
  orderDescription,
  orderId,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const getBackendUrl = () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    if (!url) {
      console.warn("VITE_BACKEND_URL not set, using default");
      return "https://mskmain.vercel.app";
    }
    return url;
  };

  const handlePayment = async () => {
    // Validate amount
    if (amount <= 0) {
      onPaymentError("Invalid payment amount");
      return;
    }

    setIsProcessing(true);

    try {
      const backendUrl = getBackendUrl();
      console.log("Using backend URL:", backendUrl);

      // Prepare metadata
      const metadata = {
        orderId: orderId || "order_" + Date.now(),
        customerName: customerName || "Guest",
        customerPhone: customerPhone || "N/A",
        customerEmail: customerEmail || "N/A",
        orderDescription: orderDescription || "Product Payment",
      };

      console.log("Creating checkout with metadata:", metadata);

      // Create checkout session via backend
      const response = await fetch(
        `${backendUrl}/api/payments/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: "ZAR",
            metadata: metadata,
          }),
        },
      );

      const data = await response.json();

      console.log("Checkout response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create payment session");
      }

      // Redirect to Yoco's hosted checkout page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL provided");
      }

      setIsProcessing(false);
    } catch (error: any) {
      console.error("Payment error:", error);
      setIsProcessing(false);
      onPaymentError(
        error.message || "Payment processing failed. Please try again.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <CreditCard className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Process Payment
              </h3>
              <p className="text-xs text-gray-500">Secure Yoco Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Display */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
            <p className="text-4xl font-bold text-gray-900">
              R{amount.toFixed(2)}
            </p>
          </div>

          {/* Customer Info */}
          {(customerName || customerPhone || customerEmail) && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Customer Details</p>
              {customerName && (
                <p className="text-sm text-gray-900 font-medium">
                  {customerName}
                </p>
              )}
              {customerPhone && (
                <p className="text-sm text-gray-700">{customerPhone}</p>
              )}
              {customerEmail && (
                <p className="text-sm text-gray-700">{customerEmail}</p>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-start gap-3 text-xs text-gray-600">
            <ShieldCheck
              size={16}
              className="text-green-600 mt-0.5 flex-shrink-0"
            />
            <p>
              Your payment is secured by Yoco. We do not store your card
              details. All transactions are encrypted and PCI-DSS compliant.
            </p>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Pay Now
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500">
            By proceeding, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
};
