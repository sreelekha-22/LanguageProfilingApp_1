@echo off
echo Starting Language Profiling App...
echo.

REM Check if virtual environment exists
if not exist backend\myenv\Scripts\activate.bat (
    echo ERROR: Backend virtual environment not found!
    echo Please run setup.bat first to set up the project.
    exit /b 1
)

cd backend
call myenv\Scripts\activate
python run.py
