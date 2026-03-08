import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import {
  Product,
  ProductInput,
  Project,
  ProjectInput,
  Order,
  OrderInput,
  Quote,
  QuoteInput,
  ServiceImage,
  ServiceImageInput,
  FirestoreResponse,
} from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyD6CoiozFrzftUyBn5UaQU2fwzPFRE9NyU",
  authDomain: "mskweb-1db5c.firebaseapp.com",
  projectId: "mskweb-1db5c",
  storageBucket: "mskweb-1db5c.firebasestorage.app",
  messagingSenderId: "953778688896",
  appId: "1:953778688896:web:8c6b1df9b10fcc0a632765",
  measurementId: "G-MG37FPPD16",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Get all products from Firestore
 */
export async function getProducts(): Promise<Product[]> {
  try {
    console.log("Fetching products...");
    const snap = await getDocs(collection(db, "products"));
    const products = snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Product,
    );
    console.log(`Retrieved ${products.length} products`);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Add a new product to Firestore
 * Validates input and handles all error cases
 */
export async function addProduct(
  input: ProductInput,
): Promise<FirestoreResponse<string>> {
  try {
    // Validate required fields
    if (!input.name?.trim()) {
      return { success: false, error: "Product name is required" };
    }

    if (!input.image?.trim()) {
      return { success: false, error: "Product image is required" };
    }

    if (input.price === undefined || input.price === null || input.price < 0) {
      return { success: false, error: "Valid price is required" };
    }

    // Prepare product data
    const now = Timestamp.now().toMillis();
    const productData = {
      name: input.name.trim(),
      description: input.description?.trim() || "",
      price: Number(input.price),
      image: input.image,
      images: input.images && input.images.length > 0 ? input.images : [],
      category: input.category?.trim() || "",
      popular: input.popular || false,
      inStock: input.inStock !== false, // default true
      createdAt: now,
      updatedAt: now,
    };

    console.log("Adding product:", productData);

    // Add to Firestore - will auto-generate document ID
    const ref = await addDoc(collection(db, "products"), productData);

    console.log(`Product added successfully with ID: ${ref.id}`);
    return { success: true, data: ref.id };
  } catch (error) {
    console.error("Error adding product:", error);

    if (error instanceof Error) {
      if (error.message.includes("permission-denied")) {
        return {
          success: false,
          error: "Permission denied. Check Firebase rules.",
        };
      }
      if (error.message.includes("not-found")) {
        return {
          success: false,
          error: "Database not found. Check Firestore setup.",
        };
      }
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Upload image - tries imgbb first, falls back to base64 for small images
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    console.log("Starting image upload:", file.name, "Size:", file.size);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image (JPEG, PNG, GIF, WebP, etc.)");
    }

    // For small images (< 500KB), use base64 (no external service needed)
    const SMALL_IMAGE_LIMIT = 500 * 1024; // 500KB
    if (file.size <= SMALL_IMAGE_LIMIT) {
      console.log("Using base64 for small image...");
      return await uploadImageBase64(file);
    }

    // For larger images, try imgbb
    console.log("Using imgbb for larger image...");
    try {
      return await uploadImageToImgbb(file);
    } catch (imgbbError) {
      console.warn("imgbb failed, falling back to base64:", imgbbError);
      // Fallback to base64 if imgbb fails
      return await uploadImageBase64(file);
    }
  } catch (error) {
    console.error("Image upload error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Image upload failed: ${String(error)}`);
  }
}

/**
 * Upload image to imgbb (free image hosting service)
 */
async function uploadImageToImgbb(file: File): Promise<string> {
  // Get your own free API key at https://api.imgbb.com/
  const IMGBB_API_KEY = "6d207e02198a847aa98d0a2a901485a5";

  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", IMGBB_API_KEY);
  formData.append("name", file.name);

  console.log("Sending to imgbb API...");

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("imgbb API error response:", errorText);
    throw new Error(
      `imgbb API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  console.log("imgbb response data:", data);

  if (!data.success) {
    console.error("imgbb upload failed:", data);
    throw new Error(data.error?.message || "Failed to upload image to imgbb");
  }

  const imageUrl = data.data.url;
  console.log("Image uploaded to imgbb:", imageUrl);

  return imageUrl;
}

/**
 * Convert image to base64 (for small images or as fallback)
 */
async function uploadImageBase64(file: File): Promise<string> {
  console.log("Converting image to base64:", file.name, "Size:", file.size);

  // Validate file size (max 1MB for base64 in Firestore)
  const maxSizeInBytes = 1024 * 1024; // 1MB
  if (file.size > maxSizeInBytes) {
    throw new Error(
      `File too large for base64 (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum is 1MB.`,
    );
  }

  // Convert file to base64
  const base64String = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });

  console.log("Image converted to base64, length:", base64String.length);
  return base64String;
}

/**
 * Get all projects from Firestore
 */
export async function getProjects(): Promise<Project[]> {
  try {
    console.log("Fetching projects...");
    const snap = await getDocs(collection(db, "projects"));
    const projects = snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Project,
    );
    // Sort by createdAt descending (newest first)
    projects.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    console.log(`Retrieved ${projects.length} projects`);
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

/**
 * Add a new project to Firestore
 */
export async function addProject(
  input: ProjectInput,
): Promise<FirestoreResponse<string>> {
  try {
    // Validate required fields
    if (!input.title?.trim()) {
      return { success: false, error: "Project title is required" };
    }

    if (!input.image?.trim()) {
      return { success: false, error: "Project image is required" };
    }

    if (!input.service?.trim()) {
      return { success: false, error: "Service category is required" };
    }

    if (!input.location?.trim()) {
      return { success: false, error: "Project location is required" };
    }

    // Prepare project data
    const now = Timestamp.now().toMillis();
    const projectData = {
      title: input.title.trim(),
      image: input.image,
      service: input.service.trim(),
      location: input.location.trim(),
      description: input.description?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };

    console.log("Adding project:", projectData);

    // Add to Firestore
    const ref = await addDoc(collection(db, "projects"), projectData);

    console.log(`Project added successfully with ID: ${ref.id}`);
    return { success: true, data: ref.id };
  } catch (error) {
    console.error("Error adding project:", error);

    if (error instanceof Error) {
      if (error.message.includes("permission-denied")) {
        return {
          success: false,
          error: "Permission denied. Check Firebase rules.",
        };
      }
      if (error.message.includes("not-found")) {
        return {
          success: false,
          error: "Database not found. Check Firestore setup.",
        };
      }
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Get all orders from Firestore
 */
export async function getOrders(): Promise<Order[]> {
  try {
    console.log("Fetching orders...");
    const snap = await getDocs(collection(db, "orders"));
    const orders = snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Order,
    );
    // Sort by createdAt descending (newest first)
    orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    console.log(`Retrieved ${orders.length} orders`);
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

/**
 * Add a new order to Firestore (called after successful payment)
 */
export async function addOrder(
  input: OrderInput,
): Promise<FirestoreResponse<string>> {
  try {
    // Validate required fields
    if (!input.customerName?.trim()) {
      return { success: false, error: "Customer name is required" };
    }

    if (!input.customerEmail?.trim()) {
      return { success: false, error: "Customer email is required" };
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Order must have items" };
    }

    if (input.total <= 0) {
      return { success: false, error: "Order total must be greater than 0" };
    }

    // Prepare order data
    const now = Timestamp.now().toMillis();
    const orderData = {
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      customerPhone: input.customerPhone?.trim() || "",
      customerAddress: input.customerAddress?.trim() || "",
      items: input.items,
      total: Number(input.total),
      paymentStatus: input.paymentStatus || "completed",
      paymentMethod: input.paymentMethod?.trim() || "Yoco",
      createdAt: now,
      updatedAt: now,
    };

    console.log("Adding order:", orderData);

    // Add to Firestore
    const ref = await addDoc(collection(db, "orders"), orderData);

    console.log(`Order added successfully with ID: ${ref.id}`);
    return { success: true, data: ref.id };
  } catch (error) {
    console.error("Error adding order:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Get all quotes from Firestore
 */
export async function getQuotes(): Promise<Quote[]> {
  try {
    console.log("Fetching quotes...");
    const snap = await getDocs(collection(db, "quotes"));
    const quotes = snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Quote,
    );
    // Sort by createdAt descending (newest first)
    quotes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    console.log(`Retrieved ${quotes.length} quotes`);
    return quotes;
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

/**
 * Add a new quote request to Firestore
 */
export async function addQuote(
  input: QuoteInput,
): Promise<FirestoreResponse<string>> {
  try {
    // Validate required fields
    if (!input.customerName?.trim()) {
      return { success: false, error: "Customer name is required" };
    }

    if (!input.customerEmail?.trim()) {
      return { success: false, error: "Customer email is required" };
    }

    if (!input.requestedItems?.trim()) {
      return { success: false, error: "Please describe what you need" };
    }

    // Prepare quote data
    const now = Timestamp.now().toMillis();
    const quoteData = {
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      customerPhone: input.customerPhone?.trim() || "",
      requestedItems: input.requestedItems.trim(),
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    };

    console.log("Adding quote:", quoteData);

    // Add to Firestore
    const ref = await addDoc(collection(db, "quotes"), quoteData);

    console.log(`Quote added successfully with ID: ${ref.id}`);
    return { success: true, data: ref.id };
  } catch (error) {
    console.error("Error adding quote:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Get all service images from Firestore
 */
export async function getServiceImages(): Promise<ServiceImage[]> {
  try {
    console.log("Fetching service images...");
    const snap = await getDocs(collection(db, "serviceImages"));
    const images = snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ServiceImage,
    );
    // Sort by service name and date
    images.sort((a, b) => {
      if (a.service !== b.service) {
        return a.service.localeCompare(b.service);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    console.log(`Retrieved ${images.length} service images`);
    return images;
  } catch (error) {
    console.error("Error fetching service images:", error);
    return [];
  }
}

/**
 * Add a new service image to Firestore
 */
export async function addServiceImage(
  input: ServiceImageInput,
): Promise<FirestoreResponse<string>> {
  try {
    // Validate required fields
    if (!input.service?.trim()) {
      return { success: false, error: "Service name is required" };
    }

    if (!input.image?.trim()) {
      return { success: false, error: "Image is required" };
    }

    // Prepare service image data
    const now = Timestamp.now().toMillis();
    const imageData = {
      service: input.service.trim(),
      image: input.image,
      title: input.title?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };

    console.log("Adding service image:", imageData);

    // Add to Firestore
    const ref = await addDoc(collection(db, "serviceImages"), imageData);

    console.log(`Service image added successfully with ID: ${ref.id}`);
    return { success: true, data: ref.id };
  } catch (error) {
    console.error("Error adding service image:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Delete a service image from Firestore
 */
export async function deleteServiceImage(
  imageId: string,
): Promise<FirestoreResponse<void>> {
  try {
    if (!imageId?.trim()) {
      return { success: false, error: "Image ID is required" };
    }

    await deleteDoc(doc(db, "serviceImages", imageId));

    console.log(`Service image ${imageId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting service image:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(productId: string): Promise<FirestoreResponse<void>> {
  try {
    if (!productId?.trim()) {
      return { success: false, error: "Product ID is required" };
    }

    await deleteDoc(doc(db, "products", productId));

    console.log(`Product ${productId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Delete a project by ID
 */
export async function deleteProject(projectId: string): Promise<FirestoreResponse<void>> {
  try {
    if (!projectId?.trim()) {
      return { success: false, error: "Project ID is required" };
    }

    await deleteDoc(doc(db, "projects", projectId));

    console.log(`Project ${projectId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error occurred" };
  }
}

export { db };
