import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hand, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme";

const navLinks = [
  { to: "/" as const, label: "Home" },
  { to: "/detect" as const, label: "Live Detect" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export default function Header() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="mx-auto mt-3 max-w-6xl px-4">
        <div className="glass rounded-2xl px-4 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-glow">
              <Hand className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-tight">SignSense<span className="text-gradient">AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                activeProps={{ className: "px-3 py-1.5 rounded-lg text-sm text-foreground bg-secondary" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary/60 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/detect"
              className="hidden sm:inline-flex items-center rounded-lg bg-gradient-hero px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90 transition"
            >
              Launch
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-border"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden glass mt-2 rounded-2xl p-2">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/60"
                activeProps={{ className: "block px-3 py-2 rounded-lg text-sm text-foreground bg-secondary" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.header>
  );
}
