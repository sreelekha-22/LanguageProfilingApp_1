import cv2
from mediapipe.tasks.python.vision import FaceLandmarker, FaceLandmarkerOptions
from mediapipe.tasks.python import BaseOptions

# Path to downloaded .task model
# https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task
MODEL_PATH = "backend/models/face_landmarker.task"

# Initialize FaceLandmarker
options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    num_faces=1
)
face_landmarker = FaceLandmarker.create_from_options(options)

def analyze_video(video_path: str):
    cap = cv2.VideoCapture(video_path)

    frames = 0
    eye_contact = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frames += 1
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = face_landmarker.detect(rgb_frame)

        if result.face_landmarks:
            eye_contact += 1

    cap.release()

    return {
        "frames": frames,
        "eye_contact_ratio": eye_contact / max(frames, 1)
    }

if __name__ == "__main__":
    stats = analyze_video("test_video.mp4")
    print(stats)
