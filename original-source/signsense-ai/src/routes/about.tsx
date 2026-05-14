import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cpu, Eye, Brain, Zap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SignSenseAI" },
      { name: "description", content: "How SignSenseAI uses MediaPipe and TensorFlow for in-browser sign language detection." },
      { property: "og:title", content: "About — SignSenseAI" },
      { property: "og:description", content: "Learn how the model and pipeline work." },
    ],
  }),
  component: About,
});

const steps = [
  { icon: Eye, title: "Capture", desc: "Your webcam streams locally to the browser. No frames are uploaded." },
  { icon: Cpu, title: "Track", desc: "MediaPipe Hand Landmarker identifies 21 keypoints per hand at video rate." },
  { icon: Brain, title: "Classify", desc: "A geometric classifier maps landmark relationships to a sign label with confidence." },
  { icon: Zap, title: "Speak", desc: "The Web Speech API turns labels into multilingual voice output." },
];

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-semibold tracking-tight">
        About <span className="text-gradient">SignSenseAI</span>
      </motion.h1>
      <p className="mt-4 text-muted-foreground max-w-2xl">
        SignSenseAI is a privacy-first, in-browser sign language detector. It demonstrates a modern computer-vision pipeline
        — capture, track, classify, speak — without sending a single frame to a server.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero shadow-glow">
              <s.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="mt-3 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 glass rounded-2xl p-6">
        <h2 className="font-semibold">Tech stack</h2>
        <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>• React 19 + TanStack Start</li>
          <li>• Tailwind CSS v4 design system</li>
          <li>• Framer Motion animations</li>
          <li>• MediaPipe Tasks Vision (Hand Landmarker)</li>
          <li>• Web Speech API for TTS</li>
          <li>• Optional Python (Flask/FastAPI) backend for custom models</li>
        </ul>
      </div>

      <div className="mt-6 glass rounded-2xl p-6">
        <h2 className="font-semibold">Vocabulary</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open Palm / Hello, Fist, Thumbs Up, Thumbs Down, Peace, OK, I Love You, Point, Call Me.
          Extend the classifier in <code className="px-1 rounded bg-secondary">src/lib/signs.ts</code>.
        </p>
      </div>
    </div>
  );
}
