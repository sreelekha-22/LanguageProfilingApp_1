import whisper

model = whisper.load_model("base")  # CPU-safe

def transcribe_audio(video_path: str) -> str:
    result = model.transcribe(video_path)
    return result["text"]
