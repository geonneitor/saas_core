import { Link } from "react-router-dom";
import { Facebook } from "lucide-react";

const Cart = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Minimal header */}
      <header className="flex items-center justify-between h-16 px-4 md:px-8">
        <Link
          to="/"
          className="font-bold text-lg md:text-xl text-foreground hover:no-underline"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Evergreen Community Gardens
        </Link>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit us on Facebook"
          className="text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <Facebook className="w-5 h-5" />
        </a>
      </header>

      {/* Empty space */}
      <main className="flex-1" />

      {/* Floating bottom-right badge */}
      <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2.5 rounded-sm flex items-center gap-2.5 shadow-lg">
        <span className="text-xs font-medium">Create A Site Like This</span>
      </div>
    </div>
  );
};

export default Cart;
