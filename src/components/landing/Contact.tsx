import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addQuote } from "@/lib/firebase";
import type { QuoteInput } from "@/lib/types";

const SERVICES = [
  "Modern TV Stands",
  "Kitchen Units & Cabinets",
  "Bathroom Vanities",
  "Custom Reception Desks",
  "Furniture Repair",
  "Built-in Storage",
];

const Contact = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    service: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Combine booking details into requestedItems
      const requestedItems = `Service: ${formData.service}`;

      const quoteData: QuoteInput = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        requestedItems,
      };

      const result = await addQuote(quoteData);

      if (result.success) {
        setMessage(
          "✅ Consultation & Measurement booked successfully! We'll confirm your appointment shortly.",
        );
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          service: "",
        });
        // Clear message after 5 seconds
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(`❌ ${result.error || "Failed to book appointment"}`);
      }
    } catch (error) {
      setMessage("❌ Something went wrong. Please try again.");
      console.error("Error booking appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-red-600"
            style={{ fontFamily: "Bebas Neue" }}
          >
            BOOK NOW
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Schedule a consultation with our team to discuss your project and
            get accurate measurements for your custom furniture.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                required
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <select
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select Service</option>
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {message && (
              <p
                className={`text-sm font-medium ${
                  message.includes("✅") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground red-glow"
            >
              {loading ? "Booking..." : "Schedule Appointment"}
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4
                  className="text-foreground font-bold text-lg"
                  style={{ fontFamily: "Bebas Neue" }}
                >
                  Call Us
                </h4>
                <p className="text-muted-foreground">081 583 0927</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4
                  className="text-foreground font-bold text-lg"
                  style={{ fontFamily: "Bebas Neue" }}
                >
                  Email Us
                </h4>
                <p className="text-muted-foreground">info@mskfam.co.za</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4
                  className="text-foreground font-bold text-lg"
                  style={{ fontFamily: "Bebas Neue" }}
                >
                  Visit Us
                </h4>
                <p className="text-muted-foreground">South Africa</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
