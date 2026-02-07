#!/bin/bash

echo "Starting Language Profiling App..."
echo ""

# Check if virtual environment exists
if [ ! -f "backend/myenv/bin/activate" ]; then
    echo "ERROR: Backend virtual environment not found!"
    echo "Please run ./setup.sh first to set up the project."
    exit 1
fi

cd backend
source myenv/bin/activate
python run.py
