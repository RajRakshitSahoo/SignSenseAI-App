"""
preprocess.py
-------------
Walk an ASL alphabet image dataset and convert each image into a 63-D
landmark vector using MediaPipe Hands. The result is saved as a CSV that the
training script can read directly.

Expected dataset layout:

    data/asl_alphabet_train/
        A/ A1.jpg A2.jpg ...
        B/ ...
        ...

Run:
    python scripts/preprocess.py --data_dir data/asl_alphabet_train \\
                                 --out_csv data/landmarks.csv
"""

import argparse
import os
import sys
import csv
import cv2
from tqdm import tqdm

# Allow running this file directly: add project root to sys.path.
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)

from utils.hand_utils import create_hands, landmarks_to_vector  # noqa: E402


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--data_dir", required=True,
                   help="Folder containing one subfolder per class (A, B, ...).")
    p.add_argument("--out_csv", default="data/landmarks.csv",
                   help="Where to write the resulting CSV.")
    p.add_argument("--max_per_class", type=int, default=0,
                   help="Optional cap on samples per class (0 = no cap).")
    return p.parse_args()


def main():
    args = parse_args()

    classes = sorted(
        d for d in os.listdir(args.data_dir)
        if os.path.isdir(os.path.join(args.data_dir, d))
    )
    if not classes:
        raise SystemExit(f"No class folders found in {args.data_dir}")

    print(f"Found {len(classes)} classes: {classes}")

    os.makedirs(os.path.dirname(args.out_csv) or ".", exist_ok=True)

    # MediaPipe in static-image mode is more accurate per-frame.
    hands = create_hands(static_image_mode=True, min_detection_confidence=0.5)

    header = [f"{axis}{i}" for i in range(21) for axis in ("x", "y", "z")] + ["label"]

    n_written, n_skipped = 0, 0
    with open(args.out_csv, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)

        for cls in classes:
            cls_dir = os.path.join(args.data_dir, cls)
            files = [x for x in os.listdir(cls_dir)
                     if x.lower().endswith((".jpg", ".jpeg", ".png"))]
            if args.max_per_class > 0:
                files = files[: args.max_per_class]

            for fname in tqdm(files, desc=f"[{cls}]", leave=False):
                fpath = os.path.join(cls_dir, fname)
                image = cv2.imread(fpath)
                if image is None:
                    n_skipped += 1
                    continue

                # MediaPipe expects RGB.
                rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                result = hands.process(rgb)

                if not result.multi_hand_landmarks:
                    n_skipped += 1
                    continue

                vec = landmarks_to_vector(result.multi_hand_landmarks[0])
                writer.writerow(list(vec) + [cls])
                n_written += 1

    hands.close()
    print(f"\nDone. Wrote {n_written} rows, skipped {n_skipped} (no hand detected).")
    print(f"CSV: {args.out_csv}")


if __name__ == "__main__":
    main()
