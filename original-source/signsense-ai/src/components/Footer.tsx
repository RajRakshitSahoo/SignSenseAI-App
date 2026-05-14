import { Link } from "@tanstack/react-router";
import { Github, Hand } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hand className="h-4 w-4 text-primary" />
          <span>SignSenseAI &copy; {new Date().getFullYear()} — Built with MediaPipe & React.</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
