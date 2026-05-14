"""
SignSense AI — Python Flask Backend
====================================
Optional backend server for:
  - Model training via REST API
  - Cloud session storage
  - Advanced preprocessing

Run:
    pip install -r requirements.txt
    python app.py

API Endpoints:
    GET  /api/health          → Health check
    POST /api/predict         → Predict sign from landmarks JSON
    POST /api/train           → Trigger model training
    GET  /api/sessions        → Get saved sessions
    POST /api/sessions        → Save a session
"""

import os
import json
import time
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL = None
LABELS = []

def load_model():
    global MODEL, LABELS
    model_path = os.path.join("model", "asl_model.h5")
    labels_path = os.path.join("model", "labels.json")
    if os.path.exists(model_path) and os.path.exists(labels_path):
        try:
            import tensorflow as tf
            MODEL = tf.keras.models.load_model(model_path)
            with open(labels_path) as f:
                LABELS = json.load(f)["classes"]
            print(f"✅ Model loaded — {len(LABELS)} classes")
        except Exception as e:
            print(f"⚠️  Model load failed: {e}")

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "model_loaded": MODEL is not None, "classes": len(LABELS)})

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.json
    landmarks = data.get("landmarks", [])
    if not landmarks or len(landmarks) != 63:
        return jsonify({"error": "Expected 63 landmark values (21 x xyz)"}), 400
    if MODEL is None:
        return jsonify({"error": "Model not loaded"}), 503
    x = np.array(landmarks, dtype=np.float32).reshape(1, -1)
    probs = MODEL.predict(x, verbose=0)[0]
    top_idx = int(np.argmax(probs))
    return jsonify({
        "label": LABELS[top_idx],
        "confidence": float(probs[top_idx]),
        "top3": [{"label": LABELS[i], "confidence": float(probs[i])}
                 for i in np.argsort(probs)[::-1][:3]]
    })

# Simple file-based session storage
SESSIONS_FILE = "sessions.json"

@app.route("/api/sessions", methods=["GET", "POST"])
def sessions():
    if request.method == "GET":
        if os.path.exists(SESSIONS_FILE):
            with open(SESSIONS_FILE) as f:
                return jsonify(json.load(f))
        return jsonify([])
    data = request.json
    existing = []
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE) as f:
            existing = json.load(f)
    existing.insert(0, {**data, "savedAt": time.time()})
    with open(SESSIONS_FILE, "w") as f:
        json.dump(existing[:50], f)
    return jsonify({"ok": True})

if __name__ == "__main__":
    load_model()
    print("🚀 SignSense AI backend running at http://localhost:5000")
    app.run(debug=True, port=5000)
