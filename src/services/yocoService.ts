/**
 * Yoco Payment Service - Modern Checkout API
 * Uses Yoco's hosted checkout page for secure payments
 */

export interface YocoCheckoutRequest {
  amount: number; // Amount in cents
  currency: string;
  successUrl?: string;
  cancelUrl?: string;
  failureUrl?: string;
  metadata?: Record<string, any>;
}

export interface YocoCheckoutResponse {
  id: string;
  status: string;
  redirectUrl: string;
  amount: number;
  currency: string;
  createdDate: string;
}

export interface YocoPaymentRequest {
  amountInCents: number;
  currency: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface YocoPaymentResponse {
  id: string;
  status: "successful" | "failed" | "pending";
  amountInCents: number;
  currency: string;
  createdDate: string;
  metadata?: Record<string, any>;
}

class YocoService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  }

  /**
   * Create a checkout session and get redirect URL
   * This is the modern Yoco approach - creates a hosted payment page
   */
  async createCheckout(
    request: YocoCheckoutRequest,
  ): Promise<YocoCheckoutResponse> {
    try {
      if (!this.backendUrl) {
        throw new Error(
          "Backend URL not configured. Please set VITE_BACKEND_URL in .env.local",
        );
      }

      // Set redirect URLs with status indicators in the URL
      const currentUrl = window.location.origin + window.location.pathname;
      const checkoutRequest = {
        ...request,
        successUrl: request.successUrl || `${currentUrl}?payment=success`,
        cancelUrl: request.cancelUrl || `${currentUrl}?payment=cancelled`,
        failureUrl: request.failureUrl || `${currentUrl}?payment=failed`,
      };

      const response = await fetch(`${this.backendUrl}/api/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutRequest),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create checkout");
    }
  }

  /**
   * Check checkout status
   */
  async getCheckoutStatus(checkoutId: string): Promise<any> {
    try {
      if (!this.backendUrl) {
        throw new Error("Backend URL not configured");
      }

      const response = await fetch(
        `${this.backendUrl}/api/payments/checkout/${checkoutId}`,
        {
          method: "GET",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get checkout status");
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Format amount to cents (Yoco requires amounts in cents)
   */
  formatAmountToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Format cents to currency
   */
  formatCentsToAmount(cents: number): number {
    return cents / 100;
  }
}

export const yocoService = new YocoService();
