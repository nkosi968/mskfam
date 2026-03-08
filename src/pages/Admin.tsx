import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addProduct,
  uploadImage,
  addProject,
  getOrders,
  getQuotes,
  addServiceImage,
  getServiceImages,
  deleteServiceImage,
  deleteProduct,
  deleteProject,
  getProducts,
  getProjects,
} from "@/lib/firebase";
import {
  ProductInput,
  ProjectInput,
  Order,
  Quote,
  ServiceImageInput,
  ServiceImage,
  Product,
  Project,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  FileText,
  Package,
  Briefcase,
  X,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Menu,
  Image,
  Trash2,
} from "lucide-react";

type AdminTab = "orders" | "quotes" | "products" | "projects" | "services";

const SERVICES = [
  "Modern TV Stands",
  "Kitchen Units & Cabinets",
  "Bathroom Vanities",
  "Custom Reception Desks",
  "Furniture Repair",
  "Built-in Storage",
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState<ProductInput>({
    name: "",
    description: "",
    price: 0,
    image: "",
    images: [],
    category: "",
    popular: false,
    inStock: true,
  });
  const [priceInput, setPriceInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [productMessage, setProductMessage] = useState("");
  const [productLoading, setProductLoading] = useState(false);

  // Project form state
  const [projectForm, setProjectForm] = useState<ProjectInput>({
    title: "",
    image: "",
    service: "",
    location: "",
  });
  const [projectSelectedFile, setProjectSelectedFile] = useState<File | null>(
    null,
  );
  const [projectMessage, setProjectMessage] = useState("");
  const [projectLoading, setProjectLoading] = useState(false);

  // Service Image form state
  const [serviceForm, setServiceForm] = useState<ServiceImageInput>({
    service: "",
    image: "",
    title: "",
  });
  const [serviceSelectedFile, setServiceSelectedFile] = useState<File | null>(
    null,
  );
  const [serviceMessage, setServiceMessage] = useState("");
  const [serviceLoading, setServiceLoading] = useState(false);

  // Fetch orders and quotes
  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery<Order[], Error>({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: activeTab === "orders",
  });

  const {
    data: quotes = [],
    isLoading: quotesLoading,
    refetch: refetchQuotes,
  } = useQuery<Quote[], Error>({
    queryKey: ["quotes"],
    queryFn: getQuotes,
    enabled: activeTab === "quotes",
  });

  const {
    data: serviceImages = [],
    isLoading: serviceImagesLoading,
    refetch: refetchServiceImages,
  } = useQuery<ServiceImage[], Error>({
    queryKey: ["serviceImages"],
    queryFn: getServiceImages,
    enabled: activeTab === "services",
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: activeTab === "products",
  });

  const {
    data: projects = [],
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: getProjects,
    enabled: activeTab === "projects",
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFilesRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);

  // Product handlers
  function handleProductChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target as Record<string, any>;

    if (type === "checkbox") {
      setProductForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "price") {
      setPriceInput(value);
      setProductForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleProductFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  }

  function handleAdditionalFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setAdditionalFiles(files);
  }

  function removeAdditionalFile(index: number) {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Project handlers
  function handleProjectChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleProjectFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setProjectSelectedFile(file);
  }

  // Service Image handlers
  function handleServiceChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleServiceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setServiceSelectedFile(file);
  }

  // Service Image submit
  async function handleServiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServiceLoading(true);
    setServiceMessage("");

    try {
      if (!serviceForm.service?.trim()) {
        setServiceMessage("⚠️ Please select a service");
        setServiceLoading(false);
        return;
      }

      let imageData = serviceForm.image;

      if (serviceSelectedFile) {
        const maxSizeInBytes = 32 * 1024 * 1024;
        if (serviceSelectedFile.size > maxSizeInBytes) {
          setServiceMessage("Image file is too large. Maximum size is 32MB.");
          setServiceLoading(false);
          return;
        }

        setServiceMessage("📸 Uploading image...");
        try {
          imageData = await uploadImage(serviceSelectedFile);
          setServiceMessage("✅ Image uploaded! Adding to service...");
        } catch (uploadError) {
          const errorMsg =
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError);
          console.error("Image upload failed:", errorMsg);
          setServiceMessage(`❌ Image upload failed: ${errorMsg}`);
          setServiceLoading(false);
          return;
        }
      } else if (!serviceForm.image?.trim()) {
        setServiceMessage(
          "⚠️ Please provide either an image file or image URL.",
        );
        setServiceLoading(false);
        return;
      }

      if (!imageData?.trim()) {
        setServiceMessage("⚠️ No valid image data.");
        setServiceLoading(false);
        return;
      }

      const imagePayload: ServiceImageInput = {
        service: serviceForm.service.trim(),
        image: imageData,
        title: serviceForm.title?.trim() || "",
      };

      setServiceMessage("💾 Saving service image...");
      const result = await addServiceImage(imagePayload);

      if (result.success) {
        setServiceMessage(
          `✅ Service image added successfully! ID: ${result.data || "unknown"}`,
        );
        setServiceForm({
          service: "",
          image: "",
          title: "",
        });
        setServiceSelectedFile(null);
        if (serviceFileInputRef.current) serviceFileInputRef.current.value = "";
        refetchServiceImages();
      } else {
        setServiceMessage(
          `❌ Error: ${result.error || "Failed to add service image"}`,
        );
      }
    } catch (err) {
      console.error(err);
      setServiceMessage(
        `❌ Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setServiceLoading(false);
    }
  }

  // Service Image delete
  async function handleServiceDelete(imageId: string) {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const result = await deleteServiceImage(imageId);

      if (result.success) {
        setServiceMessage("✅ Image deleted successfully!");
        refetchServiceImages();
        setTimeout(() => setServiceMessage(""), 3000);
      } else {
        setServiceMessage(`❌ ${result.error || "Failed to delete image"}`);
      }
    } catch (error) {
      setServiceMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async function handleProductDelete(productId: string) {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const result = await deleteProduct(productId);

      if (result.success) {
        setProductMessage("✅ Product deleted successfully!");
        refetchProducts();
        setTimeout(() => setProductMessage(""), 3000);
      } else {
        setProductMessage(`❌ ${result.error || "Failed to delete product"}`);
      }
    } catch (error) {
      setProductMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async function handleProjectDelete(projectId: string) {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const result = await deleteProject(projectId);

      if (result.success) {
        setProjectMessage("✅ Project deleted successfully!");
        refetchProjects();
        setTimeout(() => setProjectMessage(""), 3000);
      } else {
        setProjectMessage(`❌ ${result.error || "Failed to delete project"}`);
      }
    } catch (error) {
      setProjectMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Product submit
  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProductLoading(true);
    setProductMessage("");

    try {
      if (!productForm.name?.trim()) {
        setProductMessage("⚠️ Product name is required.");
        setProductLoading(false);
        return;
      }

      if (selectedFile) {
        const maxSizeInBytes = 32 * 1024 * 1024;
        if (selectedFile.size > maxSizeInBytes) {
          setProductMessage("Image file is too large. Maximum size is 32MB.");
          setProductLoading(false);
          return;
        }
      }

      let imageData = productForm.image;

      if (selectedFile) {
        setProductMessage("📸 Uploading image...");
        try {
          imageData = await uploadImage(selectedFile);
          setProductMessage("✅ Image uploaded! Adding product...");
        } catch (uploadError) {
          const errorMsg =
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError);
          console.error("Image upload failed:", errorMsg);
          setProductMessage(`❌ Image upload failed: ${errorMsg}`);
          setProductLoading(false);
          return;
        }
      } else if (!productForm.image?.trim()) {
        setProductMessage(
          "⚠️ Please provide either an image file or image URL.",
        );
        setProductLoading(false);
        return;
      }

      if (!imageData?.trim()) {
        setProductMessage("⚠️ No valid image data.");
        setProductLoading(false);
        return;
      }

      let additionalImages: string[] = [];
      if (additionalFiles.length > 0) {
        setProductMessage(
          `📸 Uploading ${additionalFiles.length} additional images...`,
        );
        try {
          additionalImages = await Promise.all(
            additionalFiles.map((file) => uploadImage(file)),
          );
          setProductMessage(`✅ All images uploaded! Adding product...`);
        } catch (uploadError) {
          const errorMsg =
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError);
          console.error("Additional images upload failed:", errorMsg);
          setProductMessage(
            `⚠️ Failed to upload some additional images: ${errorMsg}. Continuing...`,
          );
          additionalImages = [];
        }
      }

      const productPayload: ProductInput = {
        name: productForm.name.trim(),
        description: productForm.description?.trim() || "",
        price: Number(productForm.price) || 0,
        image: imageData,
        images: additionalImages.length > 0 ? additionalImages : undefined,
        category: productForm.category?.trim() || undefined,
        popular: productForm.popular || false,
        inStock: productForm.inStock !== false,
      };

      setProductMessage("💾 Saving product...");
      const result = await addProduct(productPayload);

      if (result.success) {
        setProductMessage(
          `✅ Product added successfully! ID: ${result.data || "unknown"}`,
        );
        setProductForm({
          name: "",
          description: "",
          price: 0,
          image: "",
          images: [],
          category: "",
          popular: false,
          inStock: true,
        });
        setPriceInput("");
        setSelectedFile(null);
        setAdditionalFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (additionalFilesRef.current) additionalFilesRef.current.value = "";
      } else {
        setProductMessage(
          `❌ Error: ${result.error || "Failed to add product"}`,
        );
      }
    } catch (err) {
      console.error(err);
      setProductMessage(
        `❌ Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setProductLoading(false);
    }
  }

  // Project submit
  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProjectLoading(true);
    setProjectMessage("");

    try {
      if (!projectForm.title?.trim()) {
        setProjectMessage("⚠️ Project title is required.");
        setProjectLoading(false);
        return;
      }

      if (!projectForm.service?.trim()) {
        setProjectMessage("⚠️ Service category is required.");
        setProjectLoading(false);
        return;
      }

      if (!projectForm.location?.trim()) {
        setProjectMessage("⚠️ Project location is required.");
        setProjectLoading(false);
        return;
      }

      if (projectSelectedFile) {
        const maxSizeInBytes = 32 * 1024 * 1024;
        if (projectSelectedFile.size > maxSizeInBytes) {
          setProjectMessage("Image file is too large. Maximum size is 32MB.");
          setProjectLoading(false);
          return;
        }
      }

      let imageData = projectForm.image;

      if (projectSelectedFile) {
        setProjectMessage("📸 Uploading image...");
        try {
          imageData = await uploadImage(projectSelectedFile);
          setProjectMessage("✅ Image uploaded! Adding project...");
        } catch (uploadError) {
          const errorMsg =
            uploadError instanceof Error
              ? uploadError.message
              : String(uploadError);
          console.error("Image upload failed:", errorMsg);
          setProjectMessage(`❌ Image upload failed: ${errorMsg}`);
          setProjectLoading(false);
          return;
        }
      } else if (!projectForm.image?.trim()) {
        setProjectMessage(
          "⚠️ Please provide either an image file or image URL.",
        );
        setProjectLoading(false);
        return;
      }

      if (!imageData?.trim()) {
        setProjectMessage("⚠️ No valid image data.");
        setProjectLoading(false);
        return;
      }

      const projectPayload: ProjectInput = {
        title: projectForm.title.trim(),
        image: imageData,
        service: projectForm.service.trim(),
        location: projectForm.location.trim(),
      };

      setProjectMessage("💾 Saving project...");
      const result = await addProject(projectPayload);

      if (result.success) {
        setProjectMessage(
          `✅ Project added successfully! ID: ${result.data || "unknown"}`,
        );
        setProjectForm({
          title: "",
          image: "",
          service: "",
          location: "",
        });
        setProjectSelectedFile(null);
        if (projectFileInputRef.current) projectFileInputRef.current.value = "";
      } else {
        setProjectMessage(
          `❌ Error: ${result.error || "Failed to add project"}`,
        );
      }
    } catch (err) {
      console.error(err);
      setProjectMessage(
        `❌ Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setProjectLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header & Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Admin</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Tabs */}
        {sidebarOpen && (
          <div className="border-t border-border p-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab("orders");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                activeTab === "orders"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <ShoppingCart size={16} />
              Orders
            </button>

            <button
              onClick={() => {
                setActiveTab("quotes");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                activeTab === "quotes"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <FileText size={16} />
              Quotes
            </button>

            <button
              onClick={() => {
                setActiveTab("products");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                activeTab === "products"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Package size={16} />
              Products
            </button>

            <button
              onClick={() => {
                setActiveTab("projects");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                activeTab === "projects"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Briefcase size={16} />
              Projects
            </button>

            <button
              onClick={() => {
                setActiveTab("services");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                activeTab === "services"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Image size={16} />
              Services
            </button>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-card border-r border-border p-6 fixed h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Admin Panel</h1>

        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "orders"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <ShoppingCart size={20} />
            Orders
          </button>

          <button
            onClick={() => setActiveTab("quotes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "quotes"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <FileText size={20} />
            Quotes
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "products"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Package size={20} />
            Products
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "projects"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Briefcase size={20} />
            Projects
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "services"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Image size={20} />
            Services
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-20 lg:pt-8 p-4 lg:p-8">
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">Orders</h2>

            {ordersLoading && (
              <p className="text-muted-foreground">Loading orders...</p>
            )}

            {!ordersLoading && orders.length === 0 && (
              <div className="text-center py-12 bg-muted rounded-lg">
                <ShoppingCart
                  size={48}
                  className="mx-auto text-muted-foreground mb-4"
                />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}

            <div className="grid gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {order.customerName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Order ID: {order.id}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.paymentStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-foreground">
                      <Mail size={16} className="text-primary" />
                      {order.customerEmail}
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Phone size={16} className="text-primary" />
                      {order.customerPhone}
                    </div>
                    <div className="flex items-center gap-2 text-foreground col-span-2">
                      <MapPin size={16} className="text-primary" />
                      {order.customerAddress}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Items:
                    </h4>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm text-foreground"
                      >
                        <span>
                          {item.productName} x {item.quantity}
                        </span>
                        <span>R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      R{order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-4">
                    Ordered on{" "}
                    {new Date(order.createdAt || 0).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === "quotes" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Quote Requests
            </h2>

            {quotesLoading && (
              <p className="text-muted-foreground">Loading quotes...</p>
            )}

            {!quotesLoading && quotes.length === 0 && (
              <div className="text-center py-12 bg-muted rounded-lg">
                <FileText
                  size={48}
                  className="mx-auto text-muted-foreground mb-4"
                />
                <p className="text-muted-foreground">No quote requests yet</p>
              </div>
            )}

            <div className="grid gap-4">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-foreground">
                        {quote.customerName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {quote.customerEmail}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        quote.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : quote.status === "replied"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>

                  {quote.customerPhone && (
                    <p className="text-sm text-foreground mb-2">
                      📞 {quote.customerPhone}
                    </p>
                  )}

                  <p className="text-sm text-foreground mb-2">
                    {quote.requestedItems}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Requested on{" "}
                    {new Date(quote.createdAt || 0).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Add Product
            </h2>

            <div className="max-w-2xl bg-card border border-border rounded-lg p-6">
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    value={productForm.name}
                    onChange={handleProductChange}
                    placeholder="e.g., Walnut Coffee Table"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductChange}
                    placeholder="Product description"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Price (ZAR) *
                    </label>
                    <input
                      name="price"
                      type="number"
                      value={priceInput}
                      onChange={handleProductChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Category
                    </label>
                    <input
                      name="category"
                      value={productForm.category}
                      onChange={handleProductChange}
                      placeholder="e.g., Furniture"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Main Product Image *
                  </label>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProductFileChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Additional Images
                  </label>
                  <input
                    ref={additionalFilesRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAdditionalFilesChange}
                    multiple
                    className="w-full px-3 py-2 border border-border rounded-md bg-background file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
                  />
                  {additionalFiles.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {additionalFiles.length} files selected
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      name="popular"
                      type="checkbox"
                      checked={productForm.popular}
                      onChange={handleProductChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Popular Item
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      name="inStock"
                      type="checkbox"
                      checked={productForm.inStock}
                      onChange={handleProductChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-foreground">
                      In Stock
                    </span>
                  </label>
                </div>

                {productMessage && (
                  <p
                    className={`text-sm ${
                      productMessage.includes("✅")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {productMessage}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={productLoading}
                  className="w-full"
                >
                  {productLoading ? "Adding..." : "Add Product"}
                </Button>
              </form>
            </div>

            {/* Products List */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Products ({products.length})
              </h3>
              {productsLoading ? (
                <p className="text-muted-foreground">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-muted-foreground">No products yet</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product: Product) => (
                    <div
                      key={product.id}
                      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all"
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h4 className="font-semibold text-foreground mb-1">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.category}
                      </p>
                      <p className="text-lg font-bold text-primary mb-2">
                        R{product.price}
                      </p>
                      <div className="flex gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.inStock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                        {product.popular && (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                            Popular
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          product.id && handleProductDelete(product.id)
                        }
                        className="w-full mt-3 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Add Project
            </h2>

            <div className="max-w-2xl bg-card border border-border rounded-lg p-6">
              <form onSubmit={handleProjectSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Project Title *
                  </label>
                  <input
                    name="title"
                    value={projectForm.title}
                    onChange={handleProjectChange}
                    placeholder="e.g., Modern Kitchen Renovation"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Service Type *
                  </label>
                  <select
                    name="service"
                    value={projectForm.service}
                    onChange={handleProjectChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    required
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Project Location *
                  </label>
                  <input
                    name="location"
                    value={projectForm.location}
                    onChange={handleProjectChange}
                    placeholder="e.g., Cape Town, Johannesburg"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Project Image *
                  </label>
                  <div className="space-y-2">
                    <input
                      ref={projectFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProjectFileChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
                    />
                    {projectSelectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {projectSelectedFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {projectMessage && (
                  <p
                    className={`text-sm ${
                      projectMessage.includes("✅")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {projectMessage}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={projectLoading}
                  className="w-full"
                >
                  {projectLoading ? "Adding..." : "Add Project"}
                </Button>
              </form>
            </div>

            {/* Projects List */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Projects ({projects.length})
              </h3>
              {projectsLoading ? (
                <p className="text-muted-foreground">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="text-muted-foreground">No projects yet</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {projects.map((project: Project) => (
                    <div
                      key={project.id}
                      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all"
                    >
                      {project.image && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h4 className="font-semibold text-foreground mb-1">
                        {project.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {project.service}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                        <MapPin size={14} />
                        {project.location}
                      </p>
                      <button
                        onClick={() =>
                          project.id && handleProjectDelete(project.id)
                        }
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Service Images
            </h2>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Upload Form */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    Upload Service Image
                  </h3>

                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        Service *
                      </label>
                      <select
                        name="service"
                        value={serviceForm.service}
                        onChange={handleServiceChange}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        required
                      >
                        <option value="">Select a service</option>
                        {SERVICES.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        Image Title (optional)
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={serviceForm.title}
                        onChange={handleServiceChange}
                        placeholder="e.g., Kitchen Project #1"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        Image File *
                      </label>
                      <input
                        ref={serviceFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleServiceFileChange}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
                        required
                      />
                      {serviceSelectedFile && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {serviceSelectedFile.name}
                        </p>
                      )}
                    </div>

                    {serviceMessage && (
                      <p
                        className={`text-sm ${
                          serviceMessage.includes("✅")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {serviceMessage}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={serviceLoading}
                      className="w-full"
                    >
                      {serviceLoading ? "Uploading..." : "Upload Image"}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Images List */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  Service Images Gallery
                </h3>

                {serviceImagesLoading && (
                  <p className="text-muted-foreground">Loading images...</p>
                )}

                {!serviceImagesLoading && serviceImages.length === 0 && (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <Image
                      size={48}
                      className="mx-auto text-muted-foreground mb-4"
                    />
                    <p className="text-muted-foreground">
                      No images uploaded yet
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serviceImages.map((img) => (
                    <div
                      key={img.id}
                      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={img.image}
                        alt={img.title || img.service}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-bold text-foreground">
                          {img.title || img.service}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Service: {img.service}
                        </p>
                        {img.createdAt && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Added:{" "}
                            {new Date(img.createdAt).toLocaleDateString()}
                          </p>
                        )}
                        <button
                          onClick={() => handleServiceDelete(img.id)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
