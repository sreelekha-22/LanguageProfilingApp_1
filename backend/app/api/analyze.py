from fastapi import APIRouter, UploadFile, File, Form
import tempfile

from app.services.asr import transcribe_audio
from app.services.audio_metrics import analyze_audio
from app.services.nlp_metrics import analyze_text
from app.services.video_metrics import analyze_video
from app.services.scoring import build_final_response

router = APIRouter()

@router.post("/analyze")
async def analyze(
    recording: UploadFile = File(...),
    round: str = Form(...),
    userTopic: str = Form(None)
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await recording.read())
        video_path = tmp.name

    transcript = transcribe_audio(video_path)
    audio_data = analyze_audio(video_path)
    nlp_data = analyze_text(transcript)
    video_data = analyze_video(video_path)

    return build_final_response(
        transcript,
        audio_data,
        nlp_data,
        video_data
    )
