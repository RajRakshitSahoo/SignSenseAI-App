"""
hand_utils.py
-------------
Helper functions for working with MediaPipe Hands.

The 21 hand landmarks each have (x, y, z) coordinates normalized to the image,
giving us a 63-dimensional feature vector per hand. We further normalize each
sample so it does not depend on the hand position in the frame.
"""

import numpy as np
import mediapipe as mp

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_styles = mp.solutions.drawing_styles


def create_hands(static_image_mode: bool = False, max_num_hands: int = 1,
                 min_detection_confidence: float = 0.6,
                 min_tracking_confidence: float = 0.5):
    """Create a configured MediaPipe Hands solution."""
    return mp_hands.Hands(
        static_image_mode=static_image_mode,
        max_num_hands=max_num_hands,
        min_detection_confidence=min_detection_confidence,
        min_tracking_confidence=min_tracking_confidence,
    )


def landmarks_to_vector(hand_landmarks) -> np.ndarray:
    """
    Convert a MediaPipe `hand_landmarks` object into a 63-D normalized vector.

    Normalization steps (translation- and scale-invariant):
      1. Subtract the wrist (landmark 0) from every point  → translation invariant
      2. Divide by the max absolute coordinate             → scale invariant
    """
    pts = np.array(
        [[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark],
        dtype=np.float32,
    )  # shape (21, 3)

    # Translate so wrist is at origin.
    pts -= pts[0]

    # Scale so largest coordinate magnitude is 1.
    max_val = np.max(np.abs(pts))
    if max_val > 0:
        pts /= max_val

    return pts.flatten()  # shape (63,)


def draw_landmarks(image, hand_landmarks):
    """Draw the standard MediaPipe hand skeleton on `image` (in-place)."""
    mp_drawing.draw_landmarks(
        image,
        hand_landmarks,
        mp_hands.HAND_CONNECTIONS,
        mp_styles.get_default_hand_landmarks_style(),
        mp_styles.get_default_hand_connections_style(),
    )
