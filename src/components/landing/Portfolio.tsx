import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/firebase";
import { Project } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wrench,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PROJECTS_PER_PAGE = 5;

const Portfolio = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const {
    data: allProjects = [],
    isLoading,
    error,
  } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // Calculate pagination
  const startIndex = currentPage * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const currentProjects = allProjects.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allProjects.length / PROJECTS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <section id="portfolio" className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading projects...</div>
        </div>
      </section>
    );
  }

  if (error || allProjects.length === 0) {
    return (
      <section id="portfolio" className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">
              Our Work
            </span>
            <h2
              className="text-4xl sm:text-5xl font-bold text-foreground mt-2"
              style={{ fontFamily: "Bebas Neue" }}
            >
              RECENT PROJECTS
            </h2>
          </motion.div>
          <div className="text-center text-muted-foreground py-12">
            No projects found yet. Check back soon!
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">
            Our Work
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground mt-2"
            style={{ fontFamily: "Bebas Neue" }}
          >
            RECENT PROJECTS
          </h2>
          <p className="text-muted-foreground mt-4">
            Showing {startIndex + 1}-{Math.min(endIndex, allProjects.length)} of{" "}
            {allProjects.length} projects
          </p>
        </motion.div>

        {/* Creative Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
          {currentProjects.map((project, i) => {
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-80 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-muted"
              >
                {/* Background Image */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500" />

                {/* Floating Service Badge */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -5 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/95 rounded-full shadow-lg">
                    <Wrench size={14} className="text-primary-foreground" />
                    <span className="text-xs font-bold text-primary-foreground uppercase">
                      {project.service}
                    </span>
                  </div>
                </motion.div>

                {/* Content Area - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {/* Title */}
                  <h3
                    className="text-lg font-bold text-white mb-2 leading-tight"
                    style={{ fontFamily: "Bebas Neue" }}
                  >
                    {project.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <MapPin size={16} className="text-primary flex-shrink-0" />
                    <span>{project.location}</span>
                  </div>
                </div>

                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
              </motion.div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              variant="outline"
              size="icon"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-8 h-8 rounded transition-colors ${
                    currentPage === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              variant="outline"
              size="icon"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
