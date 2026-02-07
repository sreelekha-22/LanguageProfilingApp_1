# Setup Instructions

Complete guide to set up the Language Profiling Application on a new machine.

## Quick Start (Automated)

The easiest way to set up the project:

### Windows
```bash
setup.bat
```

### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

Then follow the prompts. The script will check prerequisites, install dependencies, and guide you through the setup.

---

## Manual Setup

If you prefer to set up manually or the automated script doesn't work, follow these steps:

### Prerequisites

Before starting, ensure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Python 3.10** - [Download here](https://www.python.org/downloads/release/python-31011/)
3. **FFmpeg** (REQUIRED for Whisper speech-to-text)
   - **Windows**: Download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) - get `ffmpeg-release-essentials.zip`, extract, and add the `bin/` folder to your PATH
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt-get install ffmpeg`

### Step-by-Step Installation

#### 1. Install Node.js Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

#### 2. Set Up Python Backend

```bash
cd backend

# Create virtual environment
py -3.10 -m venv myenv        # Windows
python3.10 -m venv myenv      # macOS/Linux

# Activate virtual environment
myenv\Scripts\activate         # Windows
source myenv/bin/activate      # macOS/Linux

# Upgrade pip
python -m pip install --upgrade pip

# Install PyTorch (CPU version - faster installation)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# Install Python requirements
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm

# Install Gramformer for grammar correction
pip install git+https://github.com/PrithivirajDamodaran/Gramformer.git

cd ..
```

#### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend

# Windows
(
echo # Language Profiling App Configuration
echo # Get your free Hugging Face token from: https://huggingface.co/settings/tokens
echo HUGGINGFACE_API_KEY=your_huggingface_api_key_here
echo PORT=5000
) > .env

# macOS/Linux
cat > .env << 'EOF'
# Language Profiling App Configuration
# Get your free Hugging Face token from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
PORT=5000
EOF

cd ..
```

**Get your FREE Hugging Face API Key:**
1. Go to https://huggingface.co/settings/tokens
2. Sign up for a free account (if you don't have one)
3. Create a new token with "Read" permissions
4. Copy the token and replace `your_huggingface_api_key_here` in the `.env` file

---

## Running the Application

### Option 1: Using npm (Runs both frontend and backend)

```bash
# Windows
npm run dev

# macOS/Linux
npm run dev:unix
```

### Option 2: Run separately (Useful for debugging)

**Terminal 1 - Backend:**
```bash
# Windows
start-server.bat

# macOS/Linux
./start-server.sh
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## Troubleshooting

### "FFmpeg not found" Error

FFmpeg is required for Whisper to process audio. 

**Windows:**
1. Download from: https://www.gyan.dev/ffmpeg/builds/
2. Get `ffmpeg-release-essentials.zip`
3. Extract to a folder (e.g., `C:\ffmpeg`)
4. Add `C:\ffmpeg\bin` to your system PATH
5. Restart your terminal/command prompt
6. Verify: `ffmpeg -version`

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### "Python 3.10 not found" Error

This project specifically requires Python 3.10 due to dependency compatibility.

1. Download Python 3.10 from: https://www.python.org/downloads/release/python-31011/
2. Install it
3. Make sure to check "Add Python to PATH" during installation
4. Verify: `py -3.10 --version` (Windows) or `python3.10 --version` (macOS/Linux)

### Virtual Environment Issues

If you get errors activating the virtual environment:

**Windows - Execution Policy Error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try again.

### Port Already in Use

If port 5000 is already in use:

1. Edit `backend/.env` and change `PORT=5000` to `PORT=5001` (or any available port)
2. Update the frontend API URL in `client/src/App.js` (if needed)

### Out of Memory Errors

If you get memory errors during model loading:

1. Close other applications
2. The models will download on first run (~2-3 GB total)
3. Subsequent runs will use cached models

### API Errors / 410 Errors

If you see 410 errors or model unavailable errors:

1. Make sure you've added your Hugging Face API key to `backend/.env`
2. Verify the API key has "Read" permissions
3. Check your internet connection
4. Some models may be temporarily unavailable - the app will use fallback methods

---

## Project Structure

```
LanguageProfilingApp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
├── backend/               # Python FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── main.py       # FastAPI app
│   ├── models/           # ML models
│   ├── requirements.txt  # Python dependencies
│   ├── run.py           # Server entry point
│   └── .env             # Environment variables
├── setup.bat            # Windows setup script
├── setup.sh             # macOS/Linux setup script
├── start-server.bat     # Windows server start
├── start-server.sh      # macOS/Linux server start
└── package.json         # Root package.json
```

---

## Features

- **Video Recording**: Records user video for language analysis
- **Two Rounds of Speaking**:
  - Round 1: 2-4 minutes on an impromptu topic
  - Round 2: 2-4 minutes on a user-chosen topic
- **Comprehensive Analysis**:
  - **Facial Expressions & Confidence**: Analyzes facial expressions from video
  - Fluency & coherence
  - Vocabulary richness
  - Grammar patterns
  - Fillers & pauses
  - Sentiment / tone (enhanced with facial expression data)
  - Structure (intro → body → conclusion)
  - Confidence markers
  - Complexity level (CEFR-ish)

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for frontend errors
2. Check the terminal for backend errors
3. Ensure all prerequisites are installed correctly
4. Try running the automated setup script again
5. Delete `backend/myenv` and `node_modules` folders, then re-run setup

## License

MIT
