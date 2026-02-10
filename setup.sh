#!/bin/bash

set -e

echo "=========================================="
echo " Language Profiling App - Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for Node.js
echo "[1/8] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed. Please install Node.js v16+ from https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}OK: Node.js found${NC}"
echo ""

# Check for Python 3.10
echo "[2/8] Checking Python 3.10 installation..."
if ! command -v python3.10 &> /dev/null; then
    echo -e "${RED}ERROR: Python 3.10 is not installed. Please install Python 3.10 from https://www.python.org/downloads/${NC}"
    exit 1
fi
echo -e "${GREEN}OK: Python 3.10 found${NC}"
echo ""

# Check for FFmpeg
echo "[3/8] Checking FFmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}WARNING: FFmpeg is not installed. This is REQUIRED for Whisper to work.${NC}"
    echo "Install it using:"
    echo "  Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "  macOS: brew install ffmpeg"
    echo ""
    read -p "Continue anyway? (y/N): " continue
    if [[ ! $continue =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}OK: FFmpeg found${NC}"
fi
echo ""

# Install root dependencies
echo "[4/8] Installing root dependencies..."
npm install || { echo -e "${RED}ERROR: Failed to install root dependencies${NC}"; exit 1; }
echo -e "${GREEN}OK: Root dependencies installed${NC}"
echo ""

# Install client dependencies
echo "[5/8] Installing client dependencies..."
cd client
npm install || { echo -e "${RED}ERROR: Failed to install client dependencies${NC}"; exit 1; }
cd ..
echo -e "${GREEN}OK: Client dependencies installed${NC}"
echo ""

# Setup Python backend
echo "[6/8] Setting up Python backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3.10 -m venv myenv || { echo -e "${RED}ERROR: Failed to create virtual environment${NC}"; exit 1; }

# Activate virtual environment
source myenv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install PyTorch (CPU version)
echo "Installing PyTorch (CPU version)..."
pip install torch --index-url https://download.pytorch.org/whl/cpu

# Install requirements
echo "Installing Python requirements..."
pip install -r requirements.txt

# Download spacy model
echo "Downloading spaCy language model..."
python -m spacy download en_core_web_sm

# Install Gramformer
echo "Installing Gramformer (grammar correction)..."
pip install git+https://github.com/PrithivirajDamodaran/Gramformer.git

cd ..
echo -e "${GREEN}OK: Backend setup complete${NC}"
echo ""

# Create environment file
echo "[7/8] Creating environment file..."
if [ ! -f backend/.env ]; then
    cat > backend/.env << 'EOF'
# Language Profiling App Configuration
PORT=5000
EOF
    echo "Created backend/.env file."
else
    echo "backend/.env already exists. Skipping..."
fi
echo ""

echo "=========================================="
echo " Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo "  Run: npm run dev"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "Note: All models run locally - no API keys required"
echo ""
