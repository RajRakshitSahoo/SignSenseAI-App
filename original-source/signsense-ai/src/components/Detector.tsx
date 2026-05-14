import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, CameraOff, Volume2, Download, Save, Trash2, Loader2,
  Languages, Gauge,
} from "lucide-react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { classifySign, type Landmark } from "@/lib/signs";

interface HistoryItem {
  id: string;
  label: string;
  confidence: number;
  time: string;
}

const LANGS = [
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "de-DE", label: "Deutsch" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "ja-JP", label: "日本語" },
];

const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],[0,17],
];

export default function Detector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(-1);
  const lastLabelRef = useRef<{ label: string; t: number }>({ label: "", t: 0 });

  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<{ label: string; confidence: number }>({ label: "—", confidence: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [confSeries, setConfSeries] = useState<number[]>([]);
  const [lang, setLang] = useState("en-US");
  const [speechRate, setSpeechRate] = useState(1);

  // Load model lazily
  async function ensureModel() {
    if (landmarkerRef.current) return landmarkerRef.current;
    setLoading(true);
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
    );
    const lm = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      numHands: 1,
      runningMode: "VIDEO",
    });
    landmarkerRef.current = lm;
    setLoading(false);
    return lm;
  }

  function speak(text: string) {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = speechRate;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function pushHistory(label: string, confidence: number) {
    const now = Date.now();
    // Debounce same label within 1.5s
    if (lastLabelRef.current.label === label && now - lastLabelRef.current.t < 1500) return;
    lastLabelRef.current = { label, t: now };
    setHistory((h) => [
      { id: String(now), label, confidence, time: new Date().toLocaleTimeString() },
      ...h,
    ].slice(0, 30));
    speak(label);
  }

  async function start() {
    setError(null);
    try {
      await ensureModel();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 960, height: 720 },
        audio: false,
      });
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      setRunning(true);
      loop();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start camera";
      setError(msg);
      setRunning(false);
    }
  }

  function stop() {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const v = videoRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }

  function loop() {
    const v = videoRef.current;
    const c = canvasRef.current;
    const lm = landmarkerRef.current;
    if (!v || !c || !lm) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!videoRef.current || !running && !landmarkerRef.current) return;
      if (v.readyState >= 2) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        ctx.save();
        // mirror
        ctx.translate(c.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(v, 0, 0, c.width, c.height);
        ctx.restore();

        const t = performance.now();
        if (t !== lastTimeRef.current) {
          lastTimeRef.current = t;
          const res = lm.detectForVideo(v, t);
          if (res.landmarks && res.landmarks.length > 0) {
            const hand = res.landmarks[0] as Landmark[];
            // Draw mirrored landmarks
            ctx.save();
            ctx.translate(c.width, 0);
            ctx.scale(-1, 1);
            // connections
            ctx.strokeStyle = "rgba(168,120,255,0.9)";
            ctx.lineWidth = 3;
            for (const [a, b] of HAND_CONNECTIONS) {
              ctx.beginPath();
              ctx.moveTo(hand[a].x * c.width, hand[a].y * c.height);
              ctx.lineTo(hand[b].x * c.width, hand[b].y * c.height);
              ctx.stroke();
            }
            // points
            for (const p of hand) {
              ctx.fillStyle = "rgba(120,220,255,0.95)";
              ctx.beginPath();
              ctx.arc(p.x * c.width, p.y * c.height, 4.5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            const result = classifySign(hand);
            setCurrent(result);
            setConfSeries((s) => [...s.slice(-39), result.confidence]);
            if (result.confidence >= 0.85) pushHistory(result.label, result.confidence);
          } else {
            setCurrent({ label: "No hand detected", confidence: 0 });
            setConfSeries((s) => [...s.slice(-39), 0]);
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
  }

  useEffect(() => () => stop(), []);

  function downloadTranscript() {
    const text = history.slice().reverse().map((h) => `[${h.time}] ${h.label} (${Math.round(h.confidence*100)}%)`).join("\n");
    const blob = new Blob([text || "No transcript yet."], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "signsense-transcript.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  function saveSession() {
    try {
      const key = "signsense-saved";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([{ savedAt: Date.now(), history }, ...prev].slice(0, 20)));
    } catch {}
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Video */}
      <div className="lg:col-span-2 glass rounded-3xl p-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/60">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
          <AnimatePresence>
            {!running && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center text-center p-6"
              >
                <div>
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-hero grid place-items-center shadow-glow animate-pulse-ring">
                    <Camera className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Camera is off</h3>
                  <p className="text-sm text-muted-foreground mt-1">Click start to begin real-time sign detection.</p>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                </div>
              </motion.div>
            )}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading hand-tracking model…
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live overlay HUD */}
          {running && (
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
              <div className="glass-strong rounded-xl px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Detected</div>
                <div className="text-lg font-semibold leading-tight">{current.label}</div>
              </div>
              <div className="glass-strong rounded-xl px-3 py-2 text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
                <div className="text-lg font-semibold leading-tight">{Math.round(current.confidence * 100)}%</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!running ? (
            <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90">
              <Camera className="h-4 w-4" /> Start Camera
            </button>
          ) : (
            <button onClick={stop} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/60">
              <CameraOff className="h-4 w-4" /> Stop
            </button>
          )}
          <button onClick={() => speak(current.label)} disabled={!current.label || current.label === "—"} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-secondary/60 disabled:opacity-50">
            <Volume2 className="h-4 w-4" /> Speak
          </button>
          <button onClick={downloadTranscript} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-secondary/60">
            <Download className="h-4 w-4" /> Download
          </button>
          <button onClick={saveSession} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-secondary/60">
            <Save className="h-4 w-4" /> Save
          </button>
          <button onClick={() => setHistory([])} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60">
            <Trash2 className="h-4 w-4" /> Clear
          </button>

          <div className="ml-auto flex items-center gap-2">
            <label className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Languages className="h-4 w-4" /></label>
            <select
              aria-label="Speech language"
              value={lang} onChange={(e) => setLang(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
            >
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <label className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-2"><Gauge className="h-4 w-4" /> {speechRate.toFixed(1)}x</label>
            <input aria-label="Speech speed" type="range" min={0.6} max={1.6} step={0.1} value={speechRate} onChange={(e) => setSpeechRate(Number(e.target.value))} className="w-24" />
          </div>
        </div>

        {/* Confidence sparkline */}
        <div className="mt-4 glass rounded-2xl p-3">
          <div className="text-xs text-muted-foreground mb-1">Confidence over time</div>
          <Sparkline data={confSeries} />
        </div>
      </div>

      {/* History */}
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">History</h3>
          <span className="text-xs text-muted-foreground">{history.length} items</span>
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground">Detected signs will appear here.</p>
            )}
            {history.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{h.label}</div>
                  <div className="text-[11px] text-muted-foreground">{h.time}</div>
                </div>
                <div className="text-xs font-mono text-primary">{Math.round(h.confidence * 100)}%</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 600, h = 60, pad = 4;
  const pts = data.length ? data : [0];
  const step = (w - pad * 2) / Math.max(pts.length - 1, 1);
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${pad + i * step} ${h - pad - v * (h - pad * 2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.22 280)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.72 0.22 280)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#g)" />
      <path d={path} stroke="oklch(0.78 0.20 200)" strokeWidth="2" fill="none" />
    </svg>
  );
}
