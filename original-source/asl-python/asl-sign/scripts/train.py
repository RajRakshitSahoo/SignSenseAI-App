"""
train.py
--------
Train a small MLP classifier on the landmark CSV produced by `preprocess.py`.

Run:
    python scripts/train.py --csv data/landmarks.csv \\
                            --out_model model/asl_model.h5
"""

import argparse
import json
import os

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--csv", required=True, help="Landmarks CSV from preprocess.py")
    p.add_argument("--out_model", default="model/asl_model.h5")
    p.add_argument("--out_labels", default="model/labels.json")
    p.add_argument("--epochs", type=int, default=40)
    p.add_argument("--batch_size", type=int, default=64)
    return p.parse_args()


def build_model(input_dim: int, n_classes: int) -> tf.keras.Model:
    """Tiny MLP — landmark vectors are already a clean feature space."""
    model = models.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(64, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(n_classes, activation="softmax"),
    ])
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main():
    args = parse_args()

    print(f"Loading {args.csv} ...")
    df = pd.read_csv(args.csv)
    if "label" not in df.columns:
        raise SystemExit("CSV is missing a 'label' column.")

    X = df.drop(columns=["label"]).values.astype(np.float32)
    y_raw = df["label"].values

    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    classes = le.classes_.tolist()
    print(f"Classes ({len(classes)}): {classes}")
    print(f"Samples: {len(X)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )

    model = build_model(X.shape[1], len(classes))
    model.summary()

    cbs = [
        callbacks.EarlyStopping(patience=6, restore_best_weights=True,
                                monitor="val_accuracy"),
        callbacks.ReduceLROnPlateau(patience=3, factor=0.5, monitor="val_loss"),
    ]

    model.fit(
        X_train, y_train,
        validation_split=0.15,
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=cbs,
        verbose=2,
    )

    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\n✅ Test accuracy: {test_acc * 100:.2f}%")

    os.makedirs(os.path.dirname(args.out_model) or ".", exist_ok=True)
    model.save(args.out_model)
    with open(args.out_labels, "w") as f:
        json.dump({"classes": classes}, f, indent=2)

    print(f"Saved model  → {args.out_model}")
    print(f"Saved labels → {args.out_labels}")


if __name__ == "__main__":
    main()
