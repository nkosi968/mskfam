import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getServiceImages } from "@/lib/firebase";
import { ServiceImage } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const serviceDescriptions: Record<string, string> = {
  "Modern TV Stands":
    "Sleek wall-mounted and freestanding entertainment units with LED backlighting and custom finishes.",
  "Kitchen Units & Cabinets":
    "Fully custom kitchen cabinetry designed to maximize space and match your style.",
  "Bathroom Vanities":
    "Elegant vanity units with premium countertops and smart storage solutions.",
  "Custom Reception Desks":
    "Professional reception counters for offices, salons, and commercial spaces.",
  "Furniture Repair":
    "Expert restoration and repair of damaged furniture — we bring it back to life.",
  "Built-in Storage":
    "Wall-to-wall wardrobes, shelving systems, and custom storage that fits perfectly.",
};

// Define custom service order
const serviceOrder = [
  "Kitchen Units & Cabinets",
  "Modern TV Stands",
  "Built-in Storage",
  "Bathroom Vanities",
  "Custom Reception Desks",
  "Furniture Repair",
];

const Services = () => {
  // Fetch service images from Firebase
  const { data: firebaseImages = [] } = useQuery({
    queryKey: ["serviceImages"],
    queryFn: getServiceImages,
  });

  // Group Firebase images by service name
  const imagesByService = firebaseImages.reduce(
    (acc: Record<string, ServiceImage[]>, img: ServiceImage) => {
      if (!acc[img.service]) {
        acc[img.service] = [];
      }
      acc[img.service].push(img);
      return acc;
    },
    {},
  );

  // Build services array with only Firebase images, sorted by custom order
  const services = Object.entries(imagesByService)
    .map(([title, images]) => ({
      title,
      images: images.map((img) => img.image),
      description: serviceDescriptions[title] || "Custom carpentry solution.",
    }))
    .sort(
      (a, b) =>
        serviceOrder.indexOf(a.title) - serviceOrder.indexOf(b.title),
    );
  return (
    <section id="services" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">
            What We Do
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground mt-2"
            style={{ fontFamily: "Bebas Neue" }}
          >
            OUR SERVICES
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Quality craftsmanship across a range of custom carpentry and
            furniture solutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-full h-80 rounded-lg overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                {service.images.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {service.images.map((image, imgIndex) => (
                        <CarouselItem key={imgIndex}>
                          <img
                            src={image}
                            alt={`${service.title} ${imgIndex + 1}`}
                            className="w-full h-80 object-cover rounded-lg"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                ) : (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                )}
              </div>
              <h3
                className="text-xl font-bold text-foreground mb-2"
                style={{ fontFamily: "Bebas Neue", letterSpacing: "0.05em" }}
              >
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
