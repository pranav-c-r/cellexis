import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const logoUrl =
  "https://cdn.builder.io/api/v1/image/assets%2F2c7b56b85f304d7c977ff7daf41b0b6b%2F26e7d7bed7e64e34a762ec067e93d1e7?format=webp&width=200";

export default function Navbar() {
  const location = useLocation();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "problem", label: "Challenge" },
    { id: "solution", label: "Solution" },
    { id: "impact", label: "Impact & Benefits" },
    { id: "feasibility", label: "Feasibility" },
    { id: "scalability", label: "Scalability " },
    { id: "features", label: "Features" },
    { id: "statistics", label: "Statistics" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/60 backdrop-blur border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-[82px] items-center justify-between gap-4">
          {/* Left: logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src={logoUrl}
              alt="Cellexis"
              className="h-8 md:h-[126px] w-auto md:w-[116px] md:pb-[15px] object-contain"
            />
            <span className="sr-only">Cellexis</span>
          </Link>

          {/* Center: nav */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3 text-xs xl:text-sm leading-5 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="transition-colors font-semibold text-foreground hover:text-foreground whitespace-nowrap px-2 py-1 rounded hover:bg-background/20"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Login */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              asChild
              className="inline-flex h-8 md:h-11 px-4 md:px-8 rounded-[10px] font-semibold text-xs md:text-sm leading-5 bg-gradient-to-r from-primary via-accent to-secondary text-black glow"
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
