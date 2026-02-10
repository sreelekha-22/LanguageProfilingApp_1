# Language Profiling Application

A full-stack application that records user video and analyzes spoken language to create comprehensive language profiles.

## Features

- **Video Recording**: Records user video for language analysis
- **Two Rounds of Speaking**:
  - Round 1: 2-4 minutes on an impromptu topic
  - Round 2: 2-4 minutes on a user-chosen topic
- **Comprehensive Analysis**:
  - **Facial Expressions & Confidence**: Analyzes facial expressions from video frames to assess confidence levels and emotional state
  - Fluency & coherence
  - Vocabulary richness
  - Grammar patterns
  - Fillers & pauses
  - Sentiment / tone (enhanced with facial expression data)
  - Structure (intro → body → conclusion)
  - Confidence markers
  - Complexity level (CEFR-ish)

## Tech Stack

- **Frontend**: React
- **Backend**: Python/FastAPI
- **Speech-to-Text**: OpenAI Whisper (local)

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Create a `.env` file in the `backend` directory:
```
PORT=5000
```

**Note:**
- The application uses local models (Whisper, spaCy, MediaPipe) - no API keys required
- All processing happens locally on your machine

3. Start the application:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

**Note**: 
- The application records video and analyzes both audio (for transcription) and video frames (for facial expressions)
- Make sure you grant camera and microphone permissions when prompted
- For optimal facial expression analysis, FFmpeg is recommended (optional - the app will work without it using fallback methods)

## Usage

1. Start recording when prompted
2. Complete Round 1 (impromptu topic)
3. Choose and speak on a topic for Round 2
4. View your comprehensive language profile

