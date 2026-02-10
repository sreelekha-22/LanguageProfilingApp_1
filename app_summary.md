# Language Profiling Application - Summary

## Overview

A full-stack web application that records user video/audio and analyzes spoken language to create comprehensive language profiles with 9 different metrics.

---

## What It Does

The application guides users through **two rounds of speaking**:

1. **Round 1**: Speak for 2-4 minutes on an impromptu topic (randomly selected)
2. **Round 2**: Speak for 2-4 minutes on a user-chosen topic
3. **Analysis**: Comprehensive analysis of both recordings
4. **Results**: Detailed language profile with scores and insights

### Analysis Metrics

| Metric | Description |
|--------|-------------|
| **Fluency & Coherence** | Speech rate and flow smoothness |
| **Vocabulary Richness** | Unique word ratio and sophistication |
| **Grammar Patterns** | Sentence structure and verb usage |
| **Fillers & Pauses** | Frequency of "um", "uh", "like", etc. |
| **Sentiment & Tone** | Positive, neutral, or negative tone |
| **Facial Expressions** | Confidence scoring via eye contact |
| **Structure** | Introduction, body, conclusion detection |
| **Confidence Markers** | Speaking pace and certainty indicators |
| **Complexity Level** | CEFR rating (A1-C2) |

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ RecordingPage│  │VideoRecorder │  │ ResultsPage  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↓                                        ↑      │
│    Records WebM video                     Displays      │
│    (2-4 minutes)                          analysis      │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP POST /api/analyze
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Python FastAPI)                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │   ASR      │ │   Audio    │ │    NLP     │          │
│  │ (Whisper)  │ │  Metrics   │ │  (spaCy)   │          │
│  │            │ │ (librosa)  │ │            │          │
│  └────────────┘ └────────────┘ └────────────┘          │
│  ┌────────────┐ ┌────────────┐                          │
│  │   Video    │ │  Scoring   │                          │
│  │ (MediaPipe)│ │  Builder   │                          │
│  └────────────┘ └────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 18 + Axios | UI components, video recording, API integration |
| **Backend Framework** | Python FastAPI | REST API endpoints |
| **Speech-to-Text** | OpenAI Whisper (base model) | Local audio transcription (no API required) |
| **NLP Processing** | spaCy + en_core_web_sm | Grammar, vocabulary, structure analysis |
| **Audio Analysis** | librosa | Pause detection, speech rate calculation |
| **Video Analysis** | MediaPipe Face Landmarker | Facial landmark detection, eye contact |
| **Styling** | CSS3 | Responsive UI design |
| **Build Tool** | Create React App | Frontend build system |

---

## Project Structure

```
LanguageProfilingApp/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoRecorder.js    # Browser camera recording
│   │   │   ├── RecordingPage.js    # Two-round speaking flow
│   │   │   ├── ResultsPage.js      # Analysis results display
│   │   │   └── AnalysisCard.js     # Individual metric card
│   │   ├── App.js                  # Main app component
│   │   └── index.js                # Entry point
│   ├── public/
│   └── package.json
│
├── backend/                         # Python Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze.py          # POST /api/analyze endpoint
│   │   │   └── topic.py            # GET /api/topic/impromptu endpoint
│   │   ├── services/
│   │   │   ├── asr.py              # Whisper transcription
│   │   │   ├── audio_metrics.py    # Audio analysis (librosa)
│   │   │   ├── nlp_metrics.py      # Text analysis (spaCy)
│   │   │   ├── video_metrics.py    # Facial analysis (MediaPipe)
│   │   │   └── scoring.py          # Final response builder
│   │   ├── utils/
│   │   ├── schemas/
│   │   └── main.py                 # FastAPI application
│   ├── models/
│   │   └── face_landmarker.task    # MediaPipe model file
│   ├── requirements.txt            # Python dependencies
│   └── run.py                      # Server entry point
│
├── setup.bat                       # Windows automated setup
├── setup.sh                        # macOS/Linux automated setup
├── start-server.bat                # Windows server start
├── start-server.sh                 # macOS/Linux server start
├── package.json                    # Root npm scripts
├── QUICKSTART.md                   # Quick setup guide
├── SETUP.md                        # Detailed setup instructions
└── README.md                       # General documentation
```

---

## Key Components

### Frontend Components

**VideoRecorder.js** (`client/src/components/`)
- Uses browser MediaRecorder API
- Handles camera/microphone permissions
- Records video in WebM format
- Supports retake and preview

**RecordingPage.js**
- Manages two-round speaking flow
- Fetches impromptu topics from API
- Handles user topic input for Round 2
- Sends recordings to backend for analysis

**ResultsPage.js**
- Displays transcription
- Renders 9 analysis metric cards
- Shows CEFR level with descriptions
- Provides "Start New Assessment" button

### Backend Services

**asr.py** (`backend/app/services/`)
```python
import whisper
model = whisper.load_model("base")  # CPU-optimized
def transcribe_audio(video_path: str) -> str:
    result = model.transcribe(video_path)
    return result["text"]
```

**nlp_metrics.py**
- Loads spaCy English model
- Analyzes grammar (verb detection)
- Calculates vocabulary richness (unique word ratio)
- Counts sentences and words

**audio_metrics.py**
- Uses librosa to load audio
- Detects pauses using split function
- Calculates speech rate
- Identifies filler words

**video_metrics.py**
- Uses OpenCV to read video frames
- MediaPipe Face Landmarker for facial landmarks
- Calculates eye contact ratio
- Processes frames sequentially with timestamps

**scoring.py**
- Aggregates all analysis results
- Generates normalized scores (0-100)
- Builds structured JSON response
- Creates human-readable comments

---

## API Endpoints

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/topic/impromptu` | GET | - | `{"topic": "Describe your ideal vacation"}` |
| `/api/analyze` | POST | `recording` (file), `round` (int), `userTopic` (optional) | Full analysis JSON |

### Sample API Response

```json
{
  "transcription": "Your spoken text here...",
  "analysis": {
    "fluency": {
      "score": 75,
      "comments": "Smooth with moderate pacing"
    },
    "vocabulary": {
      "score": 68,
      "comments": "Adequate vocabulary range",
      "sophisticatedWords": ["comprehensive", "analyze"]
    },
    "grammar": {
      "score": 85,
      "comments": "Minor grammatical issues",
      "errors": []
    },
    "fillers": {
      "count": 3,
      "pauseFrequency": "moderate",
      "list": ["um", "uh"]
    },
    "sentiment": {
      "tone": "positive",
      "confidence": "medium",
      "comments": "Professional tone"
    },
    "facialExpressions": {
      "dominantEmotion": "neutral",
      "confidence": {
        "score": 72,
        "level": "medium",
        "comments": "Consistent eye contact"
      }
    },
    "structure": {
      "score": 70,
      "hasIntroduction": true,
      "hasBody": true,
      "hasConclusion": false
    },
    "confidenceMarkers": {
      "positive": ["steady pace"],
      "negative": ["pauses"]
    },
    "complexity": {
      "cefrLevel": "B2",
      "comments": "Upper intermediate proficiency"
    }
  }
}
```

---

## Setup & Installation

### Prerequisites
- Node.js v16+
- Python 3.10
- FFmpeg (for Whisper audio processing)

### Quick Start

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh && ./setup.sh
```

### Manual Setup

```bash
# 1. Install Node dependencies
npm run install-all

# 2. Setup Python backend
cd backend
py -3.10 -m venv myenv                    # Windows
python3.10 -m venv myenv                  # macOS/Linux

myenv\Scripts\activate                    # Windows
source myenv/bin/activate                 # macOS/Linux

pip install --upgrade pip
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# 3. Create .env file
echo "PORT=5000" > backend/.env
```

---

## Running the Application

### Option 1: Both Servers (Recommended)
```bash
npm run dev          # Windows
npm run dev:unix     # macOS/Linux
```

### Option 2: Separate Terminals
```bash
# Terminal 1 - Backend
start-server.bat     # Windows
./start-server.sh    # macOS/Linux

# Terminal 2 - Frontend
npm run client
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## Data Flow

1. **User grants camera/microphone permission**
2. **Recording starts** → Browser MediaRecorder captures WebM video
3. **User stops recording** → Blob sent to backend via POST /api/analyze
4. **Backend processing** (parallel):
   - Whisper extracts audio → transcription
   - librosa analyzes audio → pauses, fillers
   - spaCy analyzes text → grammar, vocab, structure
   - MediaPipe analyzes video → facial expressions, eye contact
5. **Scoring service** combines all metrics
6. **Results displayed** on frontend with 9 metric cards

---

## Environment Variables

Create `backend/.env`:

```env
# Language Profiling App Configuration
PORT=5000
```

**Note**: Application uses local models only - no API keys required.

---

## Dependencies

### Frontend (package.json)
- react: ^18.2.0
- react-dom: ^18.2.0
- react-scripts: 5.0.1
- axios: ^1.6.2
- react-router-dom: ^6.20.1

### Backend (requirements.txt)
- fastapi
- uvicorn
- python-multipart
- whisper-openai
- spacy
- librosa
- opencv-python
- mediapipe
- numpy

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| FFmpeg not found | Install FFmpeg and add to PATH |
| Python 3.10 not found | Install from python.org |
| Virtual env won't activate | Run `Set-ExecutionPolicy RemoteSigned` in PowerShell |
| Port 5000 in use | Change PORT in backend/.env |
| Out of memory | Close other apps; models download on first run (~2-3GB) |

---

## License

MIT
