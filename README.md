# 🤟 SignSense AI — Real-Time Sign Language Detection System

> **Convert hand gestures into text, speech, and translations — entirely in your browser, no installation required.**

---

## 📌 What Is SignSense AI?

**SignSense AI** is an advanced, AI-powered web application that uses your device's camera to detect **American Sign Language (ASL)** hand gestures in real time and converts them into:

- 📝 **Text** — builds sentences letter by letter as you sign
- 🔊 **Speech** — reads your sentence aloud using text-to-speech
- 🌍 **Translations** — translates your signed sentence into 8+ languages
- ✨ **AI Completions** — suggests how to complete your sentence automatically

It is designed to **bridge the communication gap** between the deaf/hard-of-hearing community and those who do not know sign language.

---

## 🎯 Purpose & Who It Helps

| Who | How it helps |
|-----|-------------|
| 🧏 Deaf / Hard-of-Hearing individuals | Communicate faster with non-signers using any webcam |
| 👩‍⚕️ Healthcare workers | Understand patients who use sign language without an interpreter |
| 🏫 Teachers & students | Learn and practice ASL interactively with instant feedback |
| 👨‍💻 Researchers & developers | Use as a base for building custom gesture recognition systems |
| 🌍 Travelers | Communicate across language barriers using gestures + translation |

---

## ✨ Features

### 🖐️ Real-Time Hand Detection
- Uses **Google MediaPipe** (21-point hand landmark model) running at up to 60 FPS
- Detects 1 or 2 hands simultaneously (Multi-hand mode toggle)
- Works in varied lighting conditions
- Draws a live skeleton overlay showing all 21 joint positions

### 🔤 Full ASL Alphabet Recognition (A–Z + Special)
- Recognises all **26 letters** of the ASL alphabet
- Special signs: **space** (open palm), **del** (delete last letter), **nothing** (neutral)
- Stability bar — a sign must be held steady for ~0.8 seconds before it commits (prevents accidental letters)
- Confidence threshold slider — adjust sensitivity from 50% to 99%

### 📝 Sentence Builder
- Letters accumulate into a sentence in real time
- Manual keyboard input bar for quick corrections
- Backspace, Space, and Clear controls
- Visual flash feedback when a new letter is added

### 🧠 AI-Powered Features (Claude API)
- **Auto-completion** — suggests 3 sentence completions as you sign
- **Grammar correction** — fixes spelling and grammar with one click
- **Offline fallback** — local dictionary of common completions when AI is unavailable

### 🌍 Real-Time Translation
Translate your signed sentence into:
🇺🇸 English · 🇪🇸 Spanish · 🇫🇷 French · 🇩🇪 German · 🇮🇳 Hindi · 🇯🇵 Japanese · 🇧🇷 Portuguese · 🇸🇦 Arabic

### 🔊 Text-to-Speech
- Speaks detected letters, words, or full sentences
- Speed control (0.5× to 1.8×)
- Matches the selected translation language

### 🎙️ Voice Commands (Hands-Free Control)
Say these commands while the mic is active:
| Command | Action |
|---------|--------|
| "clear" | Clear the sentence |
| "speak" | Read sentence aloud |
| "translate" | Translate current sentence |
| "save" | Save the session |
| "start camera" | Start detection |
| "stop camera" | Stop detection |
| "space" | Add a space |
| "delete" | Remove last character |
| "download" | Download transcript |

### 📊 Analytics Dashboard
- Total signs detected across all sessions
- Average confidence score
- Session count and total usage time
- Confidence timeline chart
- Sign frequency bar chart (top 10 most used signs)
- Weekly activity heatmap

### 🧠 Model Training Dashboard
- Select which ASL classes to train on (A–Z + space/del/nothing)
- Configure: epochs, batch size, learning rate, dropout, architecture
- Live training progress with epoch-by-epoch loss and accuracy
- Training log with colour-coded output
- Model registry showing all trained versions with accuracy scores

### 👤 User Authentication
- Sign up / Sign in with persistent accounts
- Profile page with personal stats (total signs, sessions, best accuracy)
- Saved session history with sentence preview, sign count, and duration
- Quick Demo mode — no account needed

### 📴 Offline Mode
- Core hand detection works fully offline (after first model download)
- Offline banner alerts when internet is unavailable
- Local completion dictionary serves suggestions without Claude API

---

## 📁 Project Structure

```
signsense-package/
│
├── 📄 README.md                     ← This file
│
├── 🌐 web-app/
│   └── signsense-ai.html            ← Main application (single file, open in browser)
│
├── 🐍 python-backend/
│   ├── app.py                       ← Flask REST API (optional)
│   └── requirements.txt             ← Python dependencies
│
├── 🖼️ dataset/
│   ├── test-samples/                ← 28 sample JPG images (one per sign)
│   │   ├── A_test.jpg
│   │   ├── B_test.jpg
│   │   └── ... (A–Z, space, nothing)
│   │
│   └── letter-zips/                 ← Full training dataset (zipped by class)
│       ├── A.zip                    ← ~300 images of ASL "A"
│       ├── B.zip
│       ├── C.zip
│       └── ... (29 classes total)
│
├── 📦 original-source/
│   ├── asl-python/                  ← Original Python ML pipeline
│   │   └── asl-sign/
│   │       ├── scripts/
│   │       │   ├── train.py         ← MLP training with TensorFlow
│   │       │   ├── predict.py       ← Real-time prediction script
│   │       │   └── preprocess.py    ← Image → landmark CSV
│   │       ├── utils/
│   │       │   └── hand_utils.py    ← MediaPipe landmark utilities
│   │       ├── requirements.txt
│   │       └── README.md
│   │
│   └── signsense-ai/                ← Original React/TypeScript frontend
│       └── .workspace/              ← Original UI source
│
└── 📚 docs/
    └── asl-reference.md             ← ASL hand shape descriptions
```

---

## 🚀 Quick Start (Web App)

### Option 1 — Open directly (easiest)
1. Download `signsense-ai.html` from the `web-app/` folder
2. Open it in **Google Chrome** or **Microsoft Edge** (Firefox may have issues with WebAssembly)
3. Create an account or click **"Skip & try demo"**
4. Go to **Detect** → click **"▶ Start Camera"**
5. Allow camera access when prompted
6. Wait ~15–30 seconds for the AI model to load (first time only, cached after)
7. Show your hand to the camera and hold an ASL sign steady — the stability bar fills and the letter commits!

### Option 2 — Run locally with Python backend (optional)
```bash
cd python-backend
pip install -r requirements.txt
python app.py
# Server runs at http://localhost:5000
```

---

## 🧠 How the Detection Works

```
Camera Frame
    ↓
MediaPipe Hand Landmarker
    ↓ (detects 21 3D points on the hand)
ASL Classifier (rule-based geometry)
    ↓ (checks finger angles, distances, extension)
Confidence Score
    ↓ (must exceed threshold, held stable for ~15 frames)
Letter committed to sentence
    ↓
AI Auto-completion → Grammar fix → Translation → Speech
```

### The Classifier uses these geometric rules:
- **Finger extension** — is the fingertip above its base knuckle?
- **Tip-to-tip distance** — thumb touching index = F, O, etc.
- **Normalized distances** — all measurements scaled by hand size so it works at any distance
- **Finger count** — how many fingers are extended (0–5)

---

## 📊 Dataset Information

| Class | Sign | Samples (approx) |
|-------|------|-------------------|
| A–Z   | 26 ASL letters | ~300 per class |
| space | Open flat palm | ~300 |
| del   | Delete gesture | ~300 |
| nothing | No hand / neutral | ~300 |
| **Total** | **29 classes** | **~8,700 images** |

Images were captured from webcam with varied hand positions and skin tones.

---

## 🐍 Python Training Pipeline (Original Source)

The `original-source/asl-python/` folder contains the full ML pipeline:

```bash
cd original-source/asl-python/asl-sign

# 1. Install dependencies
pip install -r requirements.txt

# 2. Preprocess: extract landmarks from images → CSV
python scripts/preprocess.py --data_dir /path/to/dataset --out data/landmarks.csv

# 3. Train the MLP model
python scripts/train.py --csv data/landmarks.csv --out_model model/asl_model.h5

# 4. Run live prediction
python scripts/predict.py --model model/asl_model.h5 --labels model/labels.json
```

The model architecture is a **3-layer MLP**:
```
Input (63 features = 21 landmarks × 3 coordinates)
  → Dense(128, ReLU) → Dropout(0.3)
  → Dense(64, ReLU)  → Dropout(0.3)
  → Dense(N_classes, Softmax)
```

---

## 🔧 Browser Requirements

| Feature | Requirement |
|---------|-------------|
| Camera access | HTTPS or localhost |
| Hand detection | Chrome 88+, Edge 88+, Safari 15+ |
| Voice commands | Chrome/Edge only (Web Speech API) |
| Text-to-speech | All modern browsers |
| AI features | Internet connection (Claude API) |

---

## 🛡️ Privacy

- **No video is ever uploaded** — all hand detection runs 100% locally in your browser
- Camera frames are processed by WebAssembly (MediaPipe) on your device
- Only text sentences are sent to Claude API for completions/grammar/translation
- User accounts are stored in your browser's localStorage (not a remote server)

---

## 📜 License & Credits

| Component | Source |
|-----------|--------|
| MediaPipe Hand Landmarker | Google LLC — Apache 2.0 |
| AI completions / grammar / translation | Anthropic Claude API |
| ASL dataset images | Original capture by project author |
| Python ML pipeline | Original code — asl-sign project |
| Web application | Built with SignSense AI (enhanced) |

---

## 💡 Future Improvements

- [ ] Full word/phrase recognition (beyond individual letters)
- [ ] Support for BSL (British Sign Language)
- [ ] Mobile app (React Native / PWA)
- [ ] Export model as TensorFlow.js for browser-native ML inference
- [ ] Multi-person detection
- [ ] Sign language learning mode with tutorials

---

*Made with ❤️ to make communication more accessible for everyone.*
