import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hand, Sparkles, Mic, Activity, Languages, Shield, ArrowRight, Play } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SignSenseAI — Real-time Sign Language Detection" },
      { name: "description", content: "Convert hand gestures into real-time text and speech using MediaPipe and AI hand tracking, right in your browser." },
      { property: "og:title", content: "SignSenseAI" },
      { property: "og:description", content: "Real-time sign language detection in your browser." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Hand, title: "Real-time Hand Tracking", desc: "21-point landmark detection at 60 FPS using MediaPipe." },
  { icon: Sparkles, title: "AI Gesture Recognition", desc: "Recognizes a vocabulary of common one-handed signs instantly." },
  { icon: Mic, title: "Voice Output", desc: "Built-in text-to-speech with multilingual voices and speed control." },
  { icon: Activity, title: "Confidence Graph", desc: "Live confidence visualization for every prediction." },
  { icon: Languages, title: "Multi-language", desc: "Speak detected words in 6+ languages out of the box." },
  { icon: Shield, title: "100% Private", desc: "All processing happens on-device. Your camera never leaves your browser." },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Powered by MediaPipe & TensorFlow
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 text-5xl md:text-7xl font-bold tracking-tight"
          >
            See signs.<br />
            <span className="text-gradient">Hear meaning.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground"
          >
            A futuristic, in-browser AI that turns hand gestures into real-time text and speech.
            No installs. No uploads. Just your camera and the magic of computer vision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/detect" className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90">
              <Play className="h-4 w-4" /> Launch Live Detection
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 text-sm font-medium hover:bg-secondary/40">
              How it works <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Floating glass preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }}
            className="relative mx-auto mt-16 max-w-3xl"
          >
            <div className="glass-strong rounded-3xl p-3 shadow-glow animate-float">
              <div className="aspect-video w-full rounded-2xl bg-[radial-gradient(circle_at_30%_30%,oklch(0.72_0.22_280/0.7),transparent_60%),radial-gradient(circle_at_70%_70%,oklch(0.78_0.20_200/0.7),transparent_60%)] grid place-items-center">
                <div className="text-center">
                  <Hand className="mx-auto h-16 w-16 text-primary-foreground drop-shadow-lg" />
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> Live preview
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">A complete experience</h2>
          <p className="mt-2 text-muted-foreground">Designed for accessibility, built for delight.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-2xl p-5 hover:shadow-glow transition-shadow"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 mt-20">
        <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          <h3 className="text-2xl md:text-3xl font-semibold">Ready to try it?</h3>
          <p className="mt-2 text-muted-foreground">Make sure to allow camera access when prompted.</p>
          <Link to="/detect" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow">
            <Play className="h-4 w-4" /> Start detecting
          </Link>
        </div>
      </section>
    </div>
  );
}
