import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/PaymentModal";
import { addOrder } from "@/lib/firebase";
import { OrderItem, OrderInput } from "@/lib/types";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Delivery details form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    city: "",
    postalCode: "",
    province: "",
    deliveryNotes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState("");

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    }
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingCost = subtotal > 0 ? 100 : 0; // Example: R100 shipping
  const total = subtotal + shippingCost;

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customerName.trim()) errors.customerName = "Name is required";
    if (!formData.customerEmail.trim())
      errors.customerEmail = "Email is required";
    if (!formData.customerPhone.trim())
      errors.customerPhone = "Phone number is required";
    if (!formData.customerAddress.trim())
      errors.customerAddress = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.postalCode.trim())
      errors.postalCode = "Postal code is required";
    if (!formData.province.trim()) errors.province = "Province is required";

    // Email validation
    if (formData.customerEmail && !formData.customerEmail.includes("@")) {
      errors.customerEmail = "Please enter a valid email";
    }

    // Phone validation (basic)
    if (
      formData.customerPhone &&
      formData.customerPhone.replace(/\D/g, "").length < 10
    ) {
      errors.customerPhone = "Please enter a valid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!validateForm()) {
      return;
    }

    setPaymentError("");
    setIsPaymentOpen(true);
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      // Prepare order data
      const orderItems: OrderItem[] = cartItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderInput: OrderInput = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerAddress: `${formData.customerAddress}, ${formData.city}, ${formData.province} ${formData.postalCode}`,
        items: orderItems,
        total: total,
        paymentStatus: "completed",
        paymentMethod: "Yoco",
      };

      // Save order to Firebase
      const result = await addOrder(orderInput);

      if (result.success) {
        // Clear cart
        localStorage.removeItem("cart");
        // Redirect to success page
        setTimeout(() => {
          navigate("/order-success", { state: { orderId: result.data } });
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to save order");
      }
    } catch (error: any) {
      console.error("Order save error:", error);
      setPaymentError(
        error.message || "Failed to complete order. Please try again.",
      );
      setIsPaymentOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background mt-16 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Link
              to="/shop"
              className="flex items-center gap-2 text-primary hover:underline mb-8"
            >
              <ChevronLeft size={20} />
              Back to Shop
            </Link>

            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground mb-6">
                Add some products to your cart before proceeding to checkout.
              </p>
              <Button asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background mt-16 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <Link
            to="/shop"
            className="flex items-center gap-2 text-primary hover:underline mb-8"
          >
            <ChevronLeft size={20} />
            Back to Shop
          </Link>

          <h1
            className="text-4xl font-bold text-foreground mb-8"
            style={{ fontFamily: "Bebas Neue" }}
          >
            CHECKOUT
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Delivery Details Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2
                  className="text-2xl font-bold text-foreground mb-6"
                  style={{ fontFamily: "Bebas Neue" }}
                >
                  Delivery Details
                </h2>

                <form className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
                          formErrors.customerName
                            ? "border-red-500 focus:ring-red-500"
                            : "border-border focus:ring-primary"
                        } focus:outline-none focus:ring-2`}
                      />
                      {formErrors.customerName && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
                          formErrors.customerEmail
                            ? "border-red-500 focus:ring-red-500"
                            : "border-border focus:ring-primary"
                        } focus:outline-none focus:ring-2`}
                      />
                      {formErrors.customerEmail && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.customerEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="+27 XX XXX XXXX"
                        className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
                          formErrors.customerPhone
                            ? "border-red-500 focus:ring-red-500"
                            : "border-border focus:ring-primary"
                        } focus:outline-none focus:ring-2`}
                      />
                      {formErrors.customerPhone && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.customerPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Province *
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
                          formErrors.province
                            ? "border-red-500 focus:ring-red-500"
                            : "border-border focus:ring-primary"
                        } focus:outline-none focus:ring-2`}
                      >
                        <option value="">Select Province</option>
                        <option value="Eastern Cape">Eastern Cape</option>
                        <option value="Free State">Free State</option>
                        <option value="Gauteng">Gauteng</option>
                        <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                        <option value="Limpopo">Limpopo</option>
                        <option value="Mpumalanga">Mpumalanga</option>
                        <option value="Northern Cape">Northern Cape</option>
                        <option value="North West">North West</option>
                        <option value="Western Cape">Western Cape</option>
                      </select>
                      {formErrors.province && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.province}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apartment 4B"
                      className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
                        formErrors.customerAddress
                          ? "border-red-500 focus:ring-red-500"
                          : "border-border focus:ring-primary"
                      } focus:outline-none focus:ring-2`}
                    />
                    {formErrors.customerAddress && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.customerAddress}
                      </p>
                    )}
                  </div>

                  {/* City and Postal Code */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g., Cape Town, Johannesburg"
                        className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
                          formErrors.city
                            ? "border-red-500 focus:ring-red-500"
                            : "border-border focus:ring-primary"
                        } focus:outline-none focus:ring-2`}
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g., 8000"
                        className={`w-full px-4 py-2 border rounded-lg bg-background transition-colors ${
                          formErrors.postalCode
                            ? "border-red-500 focus:ring-red-500"
                            : "border-border focus:ring-primary"
                        } focus:outline-none focus:ring-2`}
                      />
                      {formErrors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      placeholder="e.g., Please leave at gate, ring bell loudly, etc."
                      rows={3}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2
                  className="text-xl font-bold text-foreground mb-4"
                  style={{ fontFamily: "Bebas Neue" }}
                >
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-foreground"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal:</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Shipping:</span>
                    <span>R{shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary pt-3 border-t border-border">
                    <span>Total:</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Error Message */}
                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {paymentError}
                  </div>
                )}

                {/* Proceed Button */}
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>

                {/* Back to Cart */}
                <Link
                  to="/shop"
                  className="block text-center mt-4 text-primary hover:underline text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={total}
        customerName={formData.customerName}
        customerEmail={formData.customerEmail}
        customerPhone={formData.customerPhone}
        orderDescription={`Order for ${formData.customerName} - ${cartItems.length} item(s)`}
        orderId={`order_${Date.now()}`}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={setPaymentError}
      />

      <Footer />
    </>
  );
};

export default Checkout;
