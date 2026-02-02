def build_final_response(transcript, audio, nlp, video):
    # ---------- Safe defaults ----------
    audio = audio or {}
    nlp = nlp or {}
    video = video or {}

    speech_rate = audio.get("speech_rate", 40)
    filler_count = audio.get("filler_count", 0)

    vocab_score = nlp.get("vocab_score", 0.6)
    grammar_errors = nlp.get("grammar_errors", 0)

    eye_contact_ratio = video.get("eye_contact_ratio", 0.5)
    frames = video.get("frames", 0)

    return {
        "transcription": transcript,
        "analysis": {
            "fluency": {
                "score": min(100, 60 + speech_rate),
                "comments": "Smooth with moderate pacing"
            },
            "vocabulary": {
                "score": int(vocab_score * 100),
                "comments": "Adequate vocabulary range",
                "sophisticatedWords": []
            },
            "grammar": {
                "score": max(0, 100 - grammar_errors * 5),
                "comments": "Minor grammatical issues",
                "errors": []
            },
            "fillers": {
                "count": filler_count,
                "pauseFrequency": "moderate",
                "list": ["um", "uh"]
            },
            "sentiment": {
                "tone": "neutral",
                "confidence": "medium",
                "comments": "Professional tone",
                "facialEmotion": "engaged",
                "facialConfidence": "medium"
            },
            "facialExpressions": {
                "dominantEmotion": "neutral",
                "confidence": {
                    "score": int(eye_contact_ratio * 100),
                    "level": "medium",
                    "comments": "Consistent eye contact"
                },
                "expressions": {
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0,
                    "framesAnalyzed": frames
                },
                "observations": [
                    "Maintained eye contact",
                    "Stable posture"
                ]
            },
            "structure": {
                "score": 70,
                "comments": "Clear structure",
                "hasIntroduction": True,
                "hasBody": True,
                "hasConclusion": False
            },
            "confidenceMarkers": {
                "positive": ["steady pace"],
                "negative": ["pauses"]
            },
            "complexity": {
                "cefrLevel": "B2",
                "comments": "Upper intermediate proficiency"
            }
        },
        "warning": None
    }
