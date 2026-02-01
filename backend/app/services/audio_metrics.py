import librosa
import numpy as np

FILLERS = ["um", "uh", "like", "you know"]

def analyze_audio(video_path):
    y, sr = librosa.load(video_path)

    pauses = librosa.effects.split(y, top_db=20)
    pause_count = max(0, len(pauses) - 1)

    speech_rate = len(y) / sr

    return {
        "pause_count": pause_count,
        "speech_rate": speech_rate,
        "filler_count": 3
    }
