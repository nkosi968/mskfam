import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingCart, Plus, Minus } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [cartMessage, setCartMessage] = useState<string>("");

  const {
    data: allProducts = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // Find the current product
  const product = allProducts.find((p) => p.id === productId);

  // Get similar products (same price range, different product)
  const similarProducts = allProducts
    .filter((p) => {
      if (p.id === productId) return false; // Exclude current product
      const priceDiff = Math.abs(p.price - (product?.price || 0));
      const maxDiff = (product?.price || 0) * 0.5; // Within 50% price range
      return priceDiff <= maxDiff || p.popular;
    })
    .slice(0, 3); // Limit to 3 similar products

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="py-24 text-center mt-16">Loading product...</div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="py-24 text-center mt-16">
          <div className="text-red-500 mb-4">Product not found.</div>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  // Get all images for this product (main image + additional images)
  const productImages = [product.image, ...(product.images || [])].filter(
    Boolean,
  );
  const currentImage = productImages[selectedImageIndex] || product.image;

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    // Payment will redirect to Yoco or you can add custom success handling
  };

  // Add to cart handler
  const handleAddToCart = () => {
    try {
      // Get existing cart from localStorage
      const savedCart = localStorage.getItem("cart");
      let cart: CartItem[] = [];

      if (savedCart) {
        cart = JSON.parse(savedCart);
      }

      // Check if product already in cart
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
        });
      }

      // Save updated cart
      localStorage.setItem("cart", JSON.stringify(cart));

      // Show success message
      setCartMessage(`✅ Added ${quantity} item(s) to cart!`);

      // Clear message after 2 seconds
      setTimeout(() => {
        setCartMessage("");
      }, 2000);

      // Reset quantity
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setCartMessage("❌ Failed to add to cart");
    }
  };

  // Checkout handler
  const handleCheckout = () => {
    try {
      // Add to cart first
      const savedCart = localStorage.getItem("cart");
      let cart: CartItem[] = [];

      if (savedCart) {
        cart = JSON.parse(savedCart);
      }

      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      // Navigate to checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      setCartMessage("❌ Failed to proceed to checkout");
    }
  };

  return (
    <>
      <Navbar />
      <section className="py-8 bg-background min-h-screen mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <Link to="/" className="text-primary hover:underline">
              Home
            </Link>
            <ChevronRight size={16} className="text-muted-foreground" />
            <Link to="/shop" className="text-primary hover:underline">
              Shop
            </Link>
            <ChevronRight size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">{product.name}</span>
          </div>

          {/* Back Button */}
          <Button asChild variant="outline" className="mb-6">
            <Link to="/shop">← Back to Shop</Link>
          </Button>

          {/* Product Detail Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-muted rounded-lg overflow-hidden">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              {/* Title and Status */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  {product.popular && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full whitespace-nowrap">
                      Popular
                    </span>
                  )}
                </div>
                {product.inStock === false && (
                  <p className="text-red-600 font-semibold">Out of Stock</p>
                )}
              </div>

              {/* Price */}
              <div className="border-b border-border pb-4">
                <p className="text-4xl font-bold text-primary">
                  R{product.price?.toLocaleString()}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description available"}
                </p>
              </div>

              {/* Availability */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">
                  <span className="font-semibold">Availability:</span>{" "}
                  {product.inStock === false ? (
                    <span className="text-red-600">Out of Stock</span>
                  ) : (
                    <span className="text-green-600">In Stock</span>
                  )}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus size={20} className="text-foreground" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center py-2 bg-background border-l border-r border-border focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Plus size={20} className="text-foreground" />
                  </button>
                </div>
                <span className="text-muted-foreground">Quantity</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inStock === false}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <ShoppingCart size={20} />
                  {product.inStock === false ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={handleCheckout}
                  disabled={product.inStock === false}
                  className="w-full px-4 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {product.inStock === false
                    ? "Out of Stock"
                    : "Buy Now & Checkout"}
                </button>
              </div>

              {/* Cart Message */}
              {cartMessage && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium text-center ${
                    cartMessage.includes("✅")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {cartMessage}
                </div>
              )}
            </div>
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div className="border-t border-border pt-12">
              <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProducts.map((p) => (
                  <a
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="group bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-40 w-full object-cover rounded-md mb-3 group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="h-40 w-full bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-bold text-lg">R{p.price}</p>
                      {p.popular && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={product?.price || 0}
        orderDescription={product?.name || "Product Purchase"}
        orderId={productId}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={setPaymentError}
      />
      <Footer />
    </>
  );
};

export default ProductDetail;
