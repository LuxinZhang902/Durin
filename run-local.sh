#!/bin/bash

# Durin - Local Development Script
# Run backend and frontend without Docker

set -e

echo "🛡️  Durin - Local Development Mode"
echo "=========================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Setup backend
echo "🐍 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q -r requirements.txt

if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Created .env - please add your OPENAI_API_KEY"
fi

echo "✅ Backend setup complete"
echo ""

# Setup frontend
echo "⚛️  Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo "✅ Frontend setup complete"
echo ""

# Start services
echo "🚀 Starting services..."
echo ""

# Start backend in background
cd ../backend
source venv/bin/activate
echo "Starting backend on http://localhost:8000..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ../frontend
echo "Starting frontend on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "✅ Durin is running!"
echo ""
echo "📊 Frontend:  http://localhost:3000"
echo "🔌 Backend:   http://localhost:8000"
echo "📖 API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================="

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT
wait
