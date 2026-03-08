import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/truck msk.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="MSK FAM Carpentry & Projects"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
      </div>

      <div className="relative w-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-background/80 backdrop-blur-md rounded-2xl p-8 sm:p-12 shadow-xl flex flex-col items-center gap-8"
        >
          <span className="inline-block text-primary text-sm font-semibold tracking-widest uppercase border border-primary/30 rounded-full px-5 py-1.5">
            Carpentry & Projects
          </span>

          <h1
            className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-snug"
            style={{ fontFamily: "Bebas Neue" }}
          >
            QUALITY <span className="text-gradient">CRAFTSMANSHIP</span>
            <br />
            YOU CAN TRUST
          </h1>

          <p className="text-base sm:text-lg text-foreground/90 max-w-lg leading-relaxed">
            Modern TV stands, kitchen units, bathroom vanities, reception desks
            & built-in storage — custom-built to transform your space. Explore
            our services or shop MSK products.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-4"
            >
              <a href="#services">View Services</a>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base px-8 py-4"
            >
              <a href="/shop">Buy Products</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
