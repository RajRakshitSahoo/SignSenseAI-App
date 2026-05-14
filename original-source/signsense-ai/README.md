# SignSenseAI — Real-time Sign Language Detection

A modern, privacy-first web app that converts hand gestures into real-time
text and speech using MediaPipe hand tracking and a lightweight gesture
classifier — all running directly in your browser.

![hero](https://img.shields.io/badge/MediaPipe-Hand%20Landmarker-7c3aed) ![react](https://img.shields.io/badge/React-19-61dafb) ![tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## ✨ Features

- 🎥 Real-time webcam access with start/stop controls
- ✋ 21-point hand tracking via **MediaPipe Tasks Vision**
- 🧠 In-browser **sign recognition** (Open Palm/Hello, Fist, Thumbs Up/Down, Peace, OK, I Love You, Point, Call Me)
- 🗣️ Text-to-speech via the Web Speech API with **multi-language** support
- 📊 Live **confidence graph** + per-prediction confidence score
- 🕘 **History** of detected signs with timestamps
- 💾 **Save** sessions and **download transcript** as `.txt`
- 🎚️ Speech speed control
- 🌙 Dark / light mode toggle (persisted)
- 💎 Futuristic **glassmorphism** UI with animated hero
- 📱 Fully **responsive** (mobile, tablet, desktop)
- ♿ Accessible: semantic HTML, ARIA labels, keyboard friendly

## 🧱 Pages

1. **Home** — Animated hero, features, CTA
2. **Live Detection** — Webcam, overlay landmarks, HUD, confidence graph, history
3. **About** — How the pipeline works
4. **Contact** — Reach the team

## 🛠️ Tech Stack

**Frontend**
- React 19 + TanStack Start (SSR-ready)
- Tailwind CSS v4 with semantic design tokens
- Framer Motion animations
- Lucide icons

**AI / CV (in-browser)**
- `@mediapipe/tasks-vision` (Hand Landmarker, GPU delegate)
- Custom geometric classifier in `src/lib/signs.ts`
- Web Speech API for TTS

**Optional Python backend (for custom-trained models)**
- FastAPI / Flask + TensorFlow + OpenCV + MediaPipe

## 🚀 Getting Started

```bash
bun install
bun run dev
```

Open http://localhost:8080, navigate to **Live Detect**, and allow camera access.

> The first run downloads the MediaPipe hand model (~3 MB) from a CDN.

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Detector.tsx     # Webcam + landmarker + HUD + history
│   ├── Header.tsx       # Glassmorphism nav with theme toggle
│   └── Footer.tsx
├── lib/
│   ├── signs.ts         # Rule-based sign classifier
│   └── theme.tsx        # Theme provider (dark/light)
├── routes/
│   ├── __root.tsx       # Root layout, head meta, providers
│   ├── index.tsx        # Home / landing
│   ├── detect.tsx       # Live detection page
│   ├── about.tsx
│   └── contact.tsx
└── styles.css           # Design system (oklch tokens)
```

## 🧪 Extending the Vocabulary

The classifier is intentionally simple and readable. Add a new sign by
editing `src/lib/signs.ts`:

```ts
if (thumb && index && middle && !ring && !pinky) {
  return { label: "Three", confidence: 0.9 };
}
```

For high-accuracy alphabet (ASL A–Z) or word-level recognition, train a small
MLP on landmark vectors using TensorFlow / Keras and load it via
`tfjs` — landmark inputs are already produced in `Detector.tsx`.

## 🐍 Optional Python Backend

If you'd rather run inference server-side:

```bash
# backend/requirements.txt
fastapi
uvicorn[standard]
tensorflow
mediapipe
opencv-python
```

```bash
uvicorn backend.main:app --reload --port 8000
```

Then POST base64 frames to `/predict` and replace the in-browser classifier
call inside `Detector.tsx`.

## 🔒 Privacy

All video processing happens **on-device**. No frames, landmarks, or
predictions are uploaded.

## 📜 License

MIT — built for learning, demos, and accessibility-focused portfolios.
