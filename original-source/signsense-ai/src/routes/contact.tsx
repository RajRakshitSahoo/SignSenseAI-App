import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Send, Github, Twitter } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SignSenseAI" },
      { name: "description", content: "Get in touch with the SignSenseAI team." },
      { property: "og:title", content: "Contact — SignSenseAI" },
      { property: "og:description", content: "Reach out for questions, feedback, or partnerships." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 grid md:grid-cols-2 gap-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Let&apos;s <span className="text-gradient">talk</span></h1>
        <p className="mt-3 text-muted-foreground">Questions, feedback, partnerships — we read everything.</p>
        <div className="mt-6 space-y-3 text-sm">
          <a href="mailto:hello@signsense.ai" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Mail className="h-4 w-4" /> hello@signsense.ai</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Github className="h-4 w-4" /> github.com/signsense</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Twitter className="h-4 w-4" /> @signsenseai</a>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="glass rounded-3xl p-6 space-y-4"
      >
        <div>
          <label htmlFor="name" className="text-xs text-muted-foreground">Name</label>
          <input id="name" required className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label htmlFor="email" className="text-xs text-muted-foreground">Email</label>
          <input id="email" type="email" required className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label htmlFor="message" className="text-xs text-muted-foreground">Message</label>
          <textarea id="message" rows={5} required className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90">
          <Send className="h-4 w-4" /> Send message
        </button>
        {sent && <p className="text-sm text-primary">Thanks! We&apos;ll get back to you shortly.</p>}
      </motion.form>
    </div>
  );
}
