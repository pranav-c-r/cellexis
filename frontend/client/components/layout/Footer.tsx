import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter } from "lucide-react";

const logoUrl =
  "https://cdn.builder.io/api/v1/image/assets%2F2c7b56b85f304d7c977ff7daf41b0b6b%2F26e7d7bed7e64e34a762ec067e93d1e7?format=webp&width=160";

export default function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Cellexis" className="h-8 w-auto" />
          </div>
          <div className="flex justify-center gap-6 text-sm text-foreground/70">
            <Link to="#" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
          <div className="flex md:justify-end justify-center gap-4">
            <a
              aria-label="Twitter"
              href="#"
              className="text-foreground/70 hover:text-foreground"
            >
              <Twitter size={18} />
            </a>
            <a
              aria-label="GitHub"
              href="#"
              className="text-foreground/70 hover:text-foreground"
            >
              <Github size={18} />
            </a>
            <a
              aria-label="LinkedIn"
              href="#"
              className="text-foreground/70 hover:text-foreground"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-foreground/50">
          © {new Date().getFullYear()} Cellexis. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
