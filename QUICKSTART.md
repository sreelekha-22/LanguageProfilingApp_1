# Quick Start

## New Machine Setup

### Automated (Recommended)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh && ./setup.sh
```

### Manual

```bash
# 1. Install dependencies
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
pip install git+https://github.com/PrithivirajDamodaran/Gramformer.git

cd ..

# 3. Create .env file in backend/
echo "PORT=5000" > backend/.env
```

## Running

```bash
# Start both frontend and backend
npm run dev          # Windows
npm run dev:unix     # macOS/Linux
```

Or separately:
```bash
# Terminal 1: Backend
start-server.bat     # Windows
./start-server.sh    # macOS/Linux

# Terminal 2: Frontend
npm run client
```

## Access

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Prerequisites Check

- Node.js v16+: `node --version`
- Python 3.10: `py -3.10 --version` / `python3.10 --version`
- FFmpeg: `ffmpeg -version`

## Notes

- All models run locally - no API keys required
- Models download on first run (~2-3GB total)

## Common Issues

| Issue | Solution |
|-------|----------|
| FFmpeg not found | Install FFmpeg and add to PATH |
| Python 3.10 not found | Install Python 3.10 from python.org |
| Virtual env won't activate | Run `Set-ExecutionPolicy RemoteSigned` in PowerShell (Windows) |
| Port 5000 in use | Change PORT in backend/.env |
| Out of memory | Close other apps; models download on first run |

## Project Commands

```bash
npm run dev          # Start both servers
npm run server       # Start backend only (Windows)
npm run server:unix  # Start backend only (macOS/Linux)
npm run client       # Start frontend only
npm run install-all  # Install all Node dependencies
```
