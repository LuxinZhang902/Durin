#!/bin/bash

# FinShield AI - Quick Start Script
# Starts fraud detection + liveness verification system with Docker

set -e

echo "🛡️  FinShield AI - Complete System Startup"
echo "============================================"
echo ""
echo "📦 Features:"
echo "   ✅ Fraud Detection (Graph Analysis)"
echo "   ✅ Liveness Verification (Face Detection)"
echo "   ✅ Sanctions Screening (OpenSanctions)"
echo "   ✅ Deepfake Detection (Reality Defender)"
echo "   ✅ Underwriting System (Cashflow Analysis)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your OPENAI_API_KEY"
    echo "   Get your key from: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press Enter after you've added your API key to .env..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "🐳 Starting Durin with Docker..."
echo ""

# Build and start services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
echo "   - Building containers..."
echo "   - Initializing database (SQLite)..."
echo "   - Loading ML models (DeepFace, RetinaFace)..."
echo "   - Starting frontend & backend..."
sleep 8

# Check backend health
echo "🔍 Checking backend health..."
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "⚠️  Backend may still be starting..."
fi

echo ""
echo "============================================"
echo "✅ FinShield AI is ready!"
echo ""
echo "🌐 Access Points:"
echo "   📊 Frontend:       http://localhost:3000"
echo "   🔌 Backend API:    http://localhost:8000"
echo "   📖 API Docs:       http://localhost:8000/docs"
echo "   🧪 Liveness Test:  http://localhost:8000/test"
echo ""
echo "📂 Available Features:"
echo "   1️⃣  Fraud Detection Tab"
echo "      - Upload users.csv + transactions.csv"
echo "      - Graph visualization"
echo "      - AI-powered risk explanations"
echo ""
echo "   2️⃣  Liveness Verification Tab"
echo "      - Upload photo for verification"
echo "      - Real face detection (DeepFace)"
echo "      - Deepfake detection (Reality Defender)"
echo "      - Sanctions screening (OpenSanctions)"
echo "      - Device risk scoring"
echo ""
echo "📁 Sample Data:"
echo "   ./data/users.csv"
echo "   ./data/transactions.csv"
echo ""
echo "🔧 Management Commands:"
echo "   🛑 Stop:       docker-compose down"
echo "   📋 Logs:       docker-compose logs -f"
echo "   🔄 Restart:    docker-compose restart"
echo "   🗑️  Clean:      docker-compose down -v"
echo ""
echo "💡 Quick Start:"
echo "   1. Open http://localhost:3000"
echo "   2. Sign up with demo credentials"
echo "   3. Choose a bank and login"
echo "   4. Try both tabs:"
echo "      - Fraud Detection: Upload CSV files"
echo "      - Liveness Verification: Upload photo"
echo ""
echo "============================================"
