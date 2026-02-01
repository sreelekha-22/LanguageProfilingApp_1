def build_final_response(transcript, audio, nlp, video):
    return {
        "transcription": transcript,
        "analysis": {
            "fluency": {
                "score": min(100, 60 + audio["speech_rate"]),
                "comments": "Smooth with moderate pacing"
            },
            "vocabulary": {
                "score": int(nlp["vocab_score"] * 100),
                "comments": "Adequate vocabulary range",
                "sophisticatedWords": []
            },
            "grammar": {
                "score": max(0, 100 - nlp["grammar_errors"] * 5),
                "comments": "Minor grammatical issues",
                "errors": []
            },
            "fillers": {
                "count": audio["filler_count"],
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
                    "score": int(video["eye_contact_ratio"] * 100),
                    "level": "medium",
                    "comments": "Consistent eye contact"
                },
                "expressions": {
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0,
                    "framesAnalyzed": video["frames"]
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
