import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import mskLogo from "@/assets/msk-logo.jpg";

const highlights = [
  "Years of professional carpentry experience",
  "Custom designs tailored to your space",
  "Premium materials and finishes",
  "On-time delivery and installation",
  "Affordable pricing without compromising quality",
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-primary/30">
                <img src={mskLogo} alt="MSK FAM Logo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-64 h-64 sm:w-80 sm:h-80 rounded-2xl border border-primary/20 -z-10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">About Us</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mt-2 mb-6" style={{ fontFamily: 'Bebas Neue' }}>
              CRAFTSMANSHIP YOU CAN TRUST
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              At MSK FAM Carpentry & Projects, we believe every piece of furniture tells a story. Our team of skilled craftsmen brings your vision to life with precision, quality materials, and attention to detail that sets us apart.
            </p>
            <div className="space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
