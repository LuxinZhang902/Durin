#!/bin/bash

# FinShield AI - Quick Start Script
# This script helps you get started quickly with the application

set -e

echo "🛡️  FinShield AI - Quick Start"
echo "================================"
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

echo "🐳 Starting FinShield AI with Docker..."
echo ""

# Build and start services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check backend health
echo "🔍 Checking backend health..."
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "⚠️  Backend may still be starting..."
fi

echo ""
echo "================================"
echo "✅ FinShield AI is ready!"
echo ""
echo "📊 Frontend:  http://localhost:3000"
echo "🔌 Backend:   http://localhost:8000"
echo "📖 API Docs:  http://localhost:8000/docs"
echo ""
echo "📁 Sample data available in ./data/"
echo "   - users.csv"
echo "   - transactions.csv"
echo ""
echo "🛑 To stop: docker-compose down"
echo "📋 To view logs: docker-compose logs -f"
echo "================================"
