import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const logoUrl =
  "https://cdn.builder.io/api/v1/image/assets%2F2c7b56b85f304d7c977ff7daf41b0b6b%2F26e7d7bed7e64e34a762ec067e93d1e7?format=webp&width=200";

export default function Navbar() {
  const location = useLocation();
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/publications", label: "Publications" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="container mx-auto">
        <div className="flex h-[82px] items-center justify-between gap-6">
          {/* Left: logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logoUrl}
              alt="Cellexis"
              className="h-[126px] w-[116px] pb-[15px] object-contain"
            />
            <span className="sr-only">Cellexis</span>
          </Link>

          {/* Center: nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm leading-5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "transition-colors font-semibold",
                    isActive
                      ? "text-gradient"
                      : "text-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Login */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="inline-flex h-11 px-8 rounded-[10px] font-semibold text-sm leading-5 bg-gradient-to-r from-primary via-accent to-secondary text-black glow"
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
