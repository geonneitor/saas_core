import { Link } from "react-router-dom";
import { Facebook, Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showCart?: boolean;
  cartCount?: number;
  transparent?: boolean;
}

const navLinks = [
  { to: "/about", label: "About" },
  { to: "/garden", label: "The Garden" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

const Header = ({ showCart = false, cartCount = 0, transparent = false }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "z-50",
        transparent
          ? "absolute top-0 left-0 right-0 bg-transparent"
          : "sticky top-0 bg-background shadow-sm"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <Link
          to="/"
          className={cn(
            "font-bold text-lg md:text-xl hover:no-underline shrink-0",
            transparent ? "text-white" : "text-foreground"
          )}
        >
          Evergreen Community Gardens
        </Link>

        {/* Desktop nav - hidden on transparent/home */}
        {!transparent && (
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {!transparent && (
            <button
              className="md:hidden text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open navigation menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit us on Facebook"
            className={cn(
              "transition-colors duration-200",
              transparent
                ? "text-white/80 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Facebook className="w-5 h-5" />
          </a>

          {showCart && (
            <Link to="/cart" className="relative" aria-label={`View cart with ${cartCount} items`}>
              <ShoppingCart className={cn("w-6 h-6", transparent ? "text-white" : "text-foreground")} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          )}
        </div>
      </div>

      {menuOpen && !transparent && (
        <nav className="md:hidden border-t border-border px-4 py-3 bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-2 text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {showCart && (
            <Link to="/cart" className="block py-2 text-foreground" onClick={() => setMenuOpen(false)}>
              Cart
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
