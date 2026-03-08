import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Shop = () => {
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading)
    return (
      <>
        <Navbar />
        <div className="py-24 text-center mt-16">Loading products...</div>
        <Footer />
      </>
    );
  if (error)
    return (
      <>
        <Navbar />
        <div className="py-24 text-center mt-16">
          <div className="text-red-500 mb-4">Failed to load products.</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <section className="py-16 bg-background min-h-screen mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <Link to="/" className="text-primary hover:underline">
              Home
            </Link>
            <ChevronRight size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Shop</span>
          </div>

          {/* Page Header */}
          <div className="mb-12">
            <h1
              className="text-4xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: "Bebas Neue" }}
            >
              SHOP
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse our collection of quality furniture and custom projects
            </p>
          </div>

          {products && products.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-6">
                Showing {products.length} product
                {products.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="bg-card rounded-lg p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name || "product"}
                        className="h-40 w-full object-cover rounded-md mb-3 group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="h-40 w-full bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        {product.popular && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      {product.description ? (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <div className="text-lg font-bold">
                          {product.price ? `R${product.price}` : ""}
                        </div>
                        {product.inStock === false && (
                          <span className="text-xs text-red-600 font-semibold">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <Button
                        asChild
                        size="sm"
                        disabled={product.inStock === false}
                      >
                        <span>View Details</span>
                      </Button>
                    </div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-12 bg-muted/20 rounded-lg">
              No products found.
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Shop;
