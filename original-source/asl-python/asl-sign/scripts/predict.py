"""
predict.py
----------
Real-time ASL alphabet recognition from your webcam.

- Detects hand landmarks with MediaPipe
- Feeds the 63-D landmark vector to the trained Keras model
- Shows predicted letter + confidence
- Builds a sentence from stable predictions
- Speaks the sentence out loud (pyttsx3)

Hotkeys:
  Q     quit
  C     clear current sentence
  SPACE add a space
  S     speak the current sentence
  BKSP  delete last character

Run:
    python scripts/predict.py
"""

import argparse
import json
import os
import sys
import time
from collections import deque

import cv2
import numpy as np
import tensorflow as tf

# Allow running this file directly.
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)

from utils.hand_utils import create_hands, landmarks_to_vector, draw_landmarks  # noqa: E402

# Optional offline TTS — degrade gracefully if not installed.
try:
    import pyttsx3
    _tts = pyttsx3.init()
    _tts.setProperty("rate", 170)
except Exception as e:  # pragma: no cover
    print(f"[warn] pyttsx3 unavailable ({e}); voice output disabled.")
    _tts = None


def speak(text: str):
    if not text or _tts is None:
        return
    _tts.say(text)
    _tts.runAndWait()


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--model", default="model/asl_model.h5")
    p.add_argument("--labels", default="model/labels.json")
    p.add_argument("--cam", type=int, default=0, help="Webcam index")
    p.add_argument("--conf", type=float, default=0.85,
                   help="Minimum confidence to accept a letter")
    p.add_argument("--stable_frames", type=int, default=10,
                   help="How many consecutive identical predictions before commit")
    return p.parse_args()


def main():
    args = parse_args()

    if not os.path.exists(args.model):
        raise SystemExit(f"Model not found: {args.model} — train first.")

    print("Loading model ...")
    model = tf.keras.models.load_model(args.model)
    with open(args.labels) as f:
        classes = json.load(f)["classes"]

    hands = create_hands(static_image_mode=False, max_num_hands=1)
    cap = cv2.VideoCapture(args.cam)
    if not cap.isOpened():
        raise SystemExit("Could not open webcam.")

    sentence = ""
    history = deque(maxlen=args.stable_frames)
    last_commit_time = 0.0
    cooldown = 0.8  # seconds between committing the same letter

    print("Press Q to quit. C clear, SPACE add space, S speak, BKSP delete.")

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frame = cv2.flip(frame, 1)  # mirror for natural UX
        h, w = frame.shape[:2]

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        label = "—"
        conf = 0.0

        if result.multi_hand_landmarks:
            hl = result.multi_hand_landmarks[0]
            draw_landmarks(frame, hl)

            vec = landmarks_to_vector(hl)
            probs = model.predict(vec[None, :], verbose=0)[0]
            idx = int(np.argmax(probs))
            conf = float(probs[idx])
            label = classes[idx]

            history.append(label if conf >= args.conf else None)

            # Commit a stable, confident prediction into the sentence.
            if (len(history) == history.maxlen
                    and all(x == label for x in history)
                    and conf >= args.conf
                    and time.time() - last_commit_time > cooldown):
                if label.lower() == "space":
                    sentence += " "
                elif label.lower() == "del":
                    sentence = sentence[:-1]
                elif label.lower() == "nothing":
                    pass
                else:
                    sentence += label
                last_commit_time = time.time()
                history.clear()
        else:
            history.clear()

        # ---------- HUD ----------
        cv2.rectangle(frame, (0, 0), (w, 70), (20, 20, 20), -1)
        cv2.putText(frame, f"{label}  ({conf * 100:5.1f}%)",
                    (15, 45), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0, 255, 180), 2)

        cv2.rectangle(frame, (0, h - 60), (w, h), (20, 20, 20), -1)
        cv2.putText(frame, f"> {sentence}",
                    (15, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

        cv2.imshow("ASL Sign Detection", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break
        elif key == ord("c"):
            sentence = ""
        elif key == ord(" "):
            sentence += " "
        elif key == ord("s"):
            speak(sentence)
        elif key == 8:  # backspace
            sentence = sentence[:-1]

    cap.release()
    hands.close()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
