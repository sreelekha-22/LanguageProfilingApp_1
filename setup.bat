@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo  Language Profiling App - Setup Script
echo ==========================================
echo.

REM Check for Node.js
echo [1/8] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js v16+ from https://nodejs.org/
    exit /b 1
)
echo OK: Node.js found
echo.

REM Check for Python 3.10
echo [2/8] Checking Python 3.10 installation...
py -3.10 --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python 3.10 is not installed. Please install Python 3.10 from https://www.python.org/downloads/
    exit /b 1
)
echo OK: Python 3.10 found
echo.

REM Check for FFmpeg
echo [3/8] Checking FFmpeg installation...
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo WARNING: FFmpeg is not installed. This is REQUIRED for Whisper to work.
    echo Please download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
    echo Extract ffmpeg-release-essentials.zip and add the bin/ folder to your PATH
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "!continue!"=="y" exit /b 1
)
echo OK: FFmpeg found
echo.

REM Install root dependencies
echo [4/8] Installing root dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install root dependencies
    exit /b 1
)
echo OK: Root dependencies installed
echo.

REM Install client dependencies
echo [5/8] Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    exit /b 1
)
cd ..
echo OK: Client dependencies installed
echo.

REM Setup Python backend
echo [6/8] Setting up Python backend...
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
py -3.10 -m venv myenv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    exit /b 1
)

REM Activate virtual environment
call myenv\Scripts\activate

REM Upgrade pip
python -m pip install --upgrade pip

REM Install PyTorch (CPU version)
echo Installing PyTorch (CPU version)...
pip install torch --index-url https://download.pytorch.org/whl/cpu

REM Install requirements
echo Installing Python requirements...
pip install -r requirements.txt

REM Download spacy model
echo Downloading spaCy language model...
python -m spacy download en_core_web_sm

REM Install Gramformer
echo Installing Gramformer (grammar correction)...
pip install git+https://github.com/PrithivirajDamodaran/Gramformer.git

cd ..
echo OK: Backend setup complete
echo.

echo [7/8] Creating environment file...
if not exist backend\.env (
    (
        echo # Language Profiling App Configuration
        echo # Get your free Hugging Face token from: https://huggingface.co/settings/tokens
        echo HUGGINGFACE_API_KEY=your_huggingface_api_key_here
        echo PORT=5000
    ) > backend\.env
    echo Created backend\.env file. Please edit it and add your Hugging Face API key.
) else (
    echo backend\.env already exists. Skipping...
)
echo.

echo ==========================================
echo  Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo   1. Make sure you have added your Hugging Face API key to backend\.env
echo   2. Run: npm run dev
echo.
echo The application will be available at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo Get your FREE Hugging Face API key at:
echo   https://huggingface.co/settings/tokens
echo.

pause
