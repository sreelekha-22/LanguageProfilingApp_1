import cv2
import mediapipe as mp
from pathlib import Path

from mediapipe.tasks.python import vision
from mediapipe.tasks.python.core.base_options import BaseOptions
from mediapipe.tasks.python.vision.face_landmarker import (
    FaceLandmarker,
    FaceLandmarkerOptions,
)

# ---------------------------
# Paths
# ---------------------------
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "models" / "face_landmarker.task"


# ---------------------------
# Analyze video function
# ---------------------------
def analyze_video(video_path: str):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open video file: {video_path}")

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

    # ✅ Create NEW landmarker per request
    options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(MODEL_PATH)),
        running_mode=vision.RunningMode.VIDEO,
        num_faces=1,
    )
    landmarker = FaceLandmarker.create_from_options(options)

    frames = 0
    eye_contact = 0

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30

    frame_duration_ms = int(1000 / fps)
    timestamp_ms = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frames += 1
        timestamp_ms += frame_duration_ms  # ✅ strictly increasing

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_frame = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        result = landmarker.detect_for_video(
            image=mp_frame,
            timestamp_ms=timestamp_ms
        )

        if result.face_landmarks:
            eye_contact += 1

    cap.release()
    landmarker.close()  # ✅ VERY important

    return {
        "frames": frames,
        "eye_contact_ratio": round(eye_contact / max(frames, 1), 3),
    }


# ---------------------------
# Quick test
# ---------------------------
if __name__ == "__main__":
    test_video = "test_video.mp4"
    print(analyze_video(test_video))
