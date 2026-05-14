// Lightweight rule-based sign classifier on top of MediaPipe Hands landmarks.
// Recognizes a small but useful vocabulary of common one-hand signs:
// "Hello", "Thumbs Up", "Thumbs Down", "Peace", "OK", "Fist", "Open Palm",
// "I Love You", "Point", "Call Me".
//
// Each landmark is a {x,y,z} normalized [0,1] relative to the image.
// Index reference: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker

export type Landmark = { x: number; y: number; z: number };

const TIPS = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 } as const;
const PIPS = { thumb: 3, index: 6, middle: 10, ring: 14, pinky: 18 } as const;

function dist(a: Landmark, b: Landmark) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

// A finger is "extended" when its tip is farther from the wrist than its PIP joint.
function extended(lm: Landmark[], tip: number, pip: number) {
  const wrist = lm[0];
  return dist(lm[tip], wrist) > dist(lm[pip], wrist) * 1.05;
}

export interface SignResult {
  label: string;
  confidence: number; // 0..1
}

export function classifySign(lm: Landmark[], handedness: "Left" | "Right" = "Right"): SignResult {
  if (!lm || lm.length < 21) return { label: "—", confidence: 0 };

  const thumb = extended(lm, TIPS.thumb, PIPS.thumb);
  const index = extended(lm, TIPS.index, PIPS.index);
  const middle = extended(lm, TIPS.middle, PIPS.middle);
  const ring = extended(lm, TIPS.ring, PIPS.ring);
  const pinky = extended(lm, TIPS.pinky, PIPS.pinky);

  const fingers = [thumb, index, middle, ring, pinky];
  const upCount = fingers.filter(Boolean).length;

  // Thumb direction (y axis): smaller y = higher in image (thumb up)
  const thumbUp = lm[TIPS.thumb].y < lm[PIPS.thumb].y - 0.04;
  const thumbDown = lm[TIPS.thumb].y > lm[PIPS.thumb].y + 0.04;

  // OK: thumb tip touches index tip, others extended
  const okTouch = dist(lm[TIPS.thumb], lm[TIPS.index]) < 0.06;

  let label = "Unknown";
  let confidence = 0.5;

  if (upCount === 5) { label = "Open Palm / Hello"; confidence = 0.92; }
  else if (upCount === 0) { label = "Fist"; confidence = 0.9; }
  else if (thumb && !index && !middle && !ring && !pinky && thumbUp) { label = "Thumbs Up"; confidence = 0.94; }
  else if (thumb && !index && !middle && !ring && !pinky && thumbDown) { label = "Thumbs Down"; confidence = 0.92; }
  else if (!thumb && index && middle && !ring && !pinky) { label = "Peace ✌"; confidence = 0.93; }
  else if (okTouch && middle && ring && pinky) { label = "OK 👌"; confidence = 0.9; }
  else if (thumb && index && !middle && !ring && pinky) { label = "I Love You 🤟"; confidence = 0.95; }
  else if (!thumb && index && !middle && !ring && !pinky) { label = "Point ☝"; confidence = 0.88; }
  else if (thumb && !index && !middle && !ring && pinky) { label = "Call Me 🤙"; confidence = 0.9; }
  else { label = `Sign (${upCount} fingers)`; confidence = 0.55; }

  // Slight handedness factor — ignored visually but kept to avoid unused warning
  void handedness;
  return { label, confidence };
}
