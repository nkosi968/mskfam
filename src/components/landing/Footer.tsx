import { Link, useLocation } from "react-router-dom";
import mskLogo from "@/assets/msk-logo.jpg";

const Footer = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleSectionLink = (sectionId: string) => {
    if (!isHome) {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
                className="font-bold text-lg tracking-wider text-foreground"
                style={{ fontFamily: "Bebas Neue" }}
              >
                MSK FAM
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Carpentry & Projects
              </span>
            </div>
          </Link>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <button
              onClick={() => handleSectionLink("services")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => handleSectionLink("portfolio")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Portfolio
            </button>
            <button
              onClick={() => handleSectionLink("about")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => handleSectionLink("contact")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MSK FAM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
