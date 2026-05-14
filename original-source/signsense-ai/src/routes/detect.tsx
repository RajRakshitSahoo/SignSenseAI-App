import { createFileRoute } from "@tanstack/react-router";
import Detector from "@/components/Detector";
import { motion } from "framer-motion";

export const Route = createFileRoute("/detect")({
  head: () => ({
    meta: [
      { title: "Live Detection — SignSenseAI" },
      { name: "description", content: "Real-time sign language detection using your webcam, in the browser." },
      { property: "og:title", content: "Live Detection — SignSenseAI" },
      { property: "og:description", content: "Turn hand gestures into text and speech, live." },
    ],
  }),
  component: DetectPage,
});

function DetectPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Live Sign Detection</h1>
        <p className="text-muted-foreground mt-1">Allow camera access, then sign in front of the lens.</p>
      </motion.div>
      <Detector />
    </div>
  );
}
