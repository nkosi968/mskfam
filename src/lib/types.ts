/**
 * Product data model for MSK Shop
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // main thumbnail (base64 or URL string)
  images?: string[]; // additional product images
  category?: string;
  popular?: boolean;
  inStock?: boolean;
  createdAt?: number; // timestamp
  updatedAt?: number; // timestamp
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  image: string; // main thumbnail (base64 or URL)
  images?: string[]; // additional product images
  category?: string;
  popular?: boolean;
  inStock?: boolean;
}

/**
 * Project data model for Portfolio
 */
export interface Project {
  id: string;
  title: string;
  image: string; // main image (base64 or URL)
  service: string; // service category (TV Stand, Kitchen, etc.)
  location: string; // project location
  description?: string;
  createdAt?: number; // timestamp
  updatedAt?: number; // timestamp
}

export interface ProjectInput {
  title: string;
  image: string;
  service: string;
  location: string;
}

/**
 * Order data model - created after successful payment
 */
export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  paymentStatus: "completed" | "pending" | "failed";
  paymentMethod: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  paymentStatus: "completed" | "pending" | "failed";
  paymentMethod: string;
}

/**
 * Quote data model - customer quote request
 */
export interface Quote {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestedItems: string; // description of what customer needs
  status: "pending" | "replied" | "completed";
  createdAt?: number;
  updatedAt?: number;
}

export interface QuoteInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestedItems: string;
}

/**
 * Service Image data model - images for service categories
 */
export interface ServiceImage {
  id: string;
  service: string; // service name (Kitchen Units & Cabinets, etc.)
  image: string; // image URL or base64
  title?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface ServiceImageInput {
  service: string;
  image: string;
  title?: string;
}

export type FirestoreResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
