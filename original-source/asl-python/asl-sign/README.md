# ASL Sign Language Detection (Python + MediaPipe + TensorFlow)

Real-time American Sign Language (ASL) alphabet recognition using a webcam.
Hands are detected with **MediaPipe**, the 21 landmark coordinates are fed
into a small **TensorFlow / Keras** classifier, and predictions are spoken
out loud with **pyttsx3**.

---

## ✨ Features
- 🖐️ Hand landmark detection (MediaPipe Hands)
- 🧠 TensorFlow MLP classifier on landmark vectors (fast, works on CPU)
- 🎥 Real-time webcam prediction with confidence score
- 🔤 Builds words / sentences from stable predictions
- 🗣️ Text-to-speech output (offline, pyttsx3)
- 💾 Saves trained model to `model/asl_model.h5`
- 🧹 Dataset preprocessing pipeline (image folders → landmark CSV)
- 📝 Beginner-friendly comments throughout

---

## 📁 Folder Structure

```
asl-sign/
├── data/                    # Place dataset & generated CSV here
│   └── (asl_alphabet_train/A, B, C, ...)
├── model/
│   └── asl_model.h5         # Saved Keras model (after training)
│   └── labels.json          # Index → letter mapping
├── scripts/
│   ├── preprocess.py        # Images → landmarks.csv
│   ├── train.py             # Train TensorFlow model
│   └── predict.py           # Real-time webcam + TTS
├── utils/
│   └── hand_utils.py        # MediaPipe helper functions
├── requirements.txt
└── README.md
```

---

## 🗂️ Dataset

Use the **ASL Alphabet** dataset from Kaggle:
https://www.kaggle.com/datasets/grassknoted/asl-alphabet

After download, extract so the structure is:

```
data/asl_alphabet_train/
  A/  A1.jpg A2.jpg ...
  B/  ...
  ...
  Z/
  space/
  del/
  nothing/
```

---

## 🚀 Setup

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🏗️ Pipeline

### 1. Preprocess images → landmark vectors

```bash
python scripts/preprocess.py \
  --data_dir data/asl_alphabet_train \
  --out_csv data/landmarks.csv
```

This walks each class folder, runs MediaPipe on every image, and writes a
CSV with 63 features (21 landmarks × x,y,z) plus a `label` column. Images
where no hand is detected are skipped.

### 2. Train the model

```bash
python scripts/train.py \
  --csv data/landmarks.csv \
  --out_model model/asl_model.h5
```

Outputs:
- `model/asl_model.h5` — trained Keras model
- `model/labels.json` — class index ↔ letter mapping
- prints test accuracy

### 3. Real-time prediction + voice

```bash
python scripts/predict.py
```

Press **Q** to quit, **C** to clear the sentence, **SPACE** to add a space,
**S** to speak the current sentence.

---

## 🧠 Model

A tiny MLP — perfect for landmark inputs:

```
Input (63) → Dense(128, relu) → Dropout(0.3)
           → Dense(64, relu)  → Dropout(0.3)
           → Dense(N_CLASSES, softmax)
```

Trains in a couple of minutes on CPU and easily reaches > 95 % accuracy on
the Kaggle ASL alphabet dataset.

---

## 📦 Output
- Predicted letter on screen
- Confidence score (%)
- Sentence built from stable predictions
- Voice output via pyttsx3

---

## 📝 License
MIT — free for learning, demos, and portfolio use.
