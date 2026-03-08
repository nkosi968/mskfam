import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import mskLogo from "@/assets/msk-logo.jpg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Handler for section links
  const handleSectionLink = (sectionId: string) => {
    setIsOpen(false);
    if (!isHome) {
      // If not on home page, navigate to home first
      window.location.href = `/#${sectionId}`;
    } else {
      // If on home page, scroll to section
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    {
      label: "Services",
      href: "#services",
      onClick: () => handleSectionLink("services"),
    },
    {
      label: "Portfolio",
      href: "#portfolio",
      onClick: () => handleSectionLink("portfolio"),
    },
    { label: "Shop", href: "/shop", isRoute: true },
    {
      label: "About",
      href: "#about",
      onClick: () => handleSectionLink("about"),
    },
    {
      label: "Contact",
      href: "#contact",
      onClick: () => handleSectionLink("contact"),
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={mskLogo}
              alt="MSK FAM Logo"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex flex-col leading-none">
              <span
                className="font-bold text-base sm:text-lg tracking-wider text-foreground"
                style={{ fontFamily: "Bebas Neue" }}
              >
                MSK FAM
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Carpentry & Projects
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium text-left cursor-pointer"
                >
                  {link.label}
                </button>
              ),
            )}
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <button onClick={() => handleSectionLink("contact")}>
                Book Now
              </button>
            </Button>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="text-muted-foreground hover:text-primary py-2 font-medium text-left"
                >
                  {link.label}
                </button>
              ),
            )}
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2 w-full"
              onClick={() => handleSectionLink("contact")}
            >
              Book Now
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
