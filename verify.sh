#!/bin/bash

# FinShield AI - Project Verification Script
# Checks that all required files and dependencies are in place

echo "🛡️  FinShield AI - Project Verification"
echo "========================================"
echo ""

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1 - MISSING"
        ((ERRORS++))
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
    else
        echo "❌ $1/ - MISSING"
        ((ERRORS++))
    fi
}

echo "📁 Checking project structure..."
echo ""

# Root files
check_file "README.md"
check_file "SETUP.md"
check_file "DEMO.md"
check_file "LICENSE"
check_file "docker-compose.yml"
check_file ".env.example"
check_file ".gitignore"
check_file "run.sh"
check_file "run-local.sh"

echo ""
echo "📂 Checking backend files..."
echo ""

check_dir "backend"
check_dir "backend/app"
check_file "backend/requirements.txt"
check_file "backend/Dockerfile"
check_file "backend/.env.example"
check_file "backend/app/__init__.py"
check_file "backend/app/main.py"
check_file "backend/app/graph_analyzer.py"
check_file "backend/app/llm_service.py"

echo ""
echo "📂 Checking frontend files..."
echo ""

check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/src/components"
check_dir "frontend/src/services"
check_file "frontend/package.json"
check_file "frontend/vite.config.js"
check_file "frontend/tailwind.config.js"
check_file "frontend/Dockerfile"
check_file "frontend/nginx.conf"
check_file "frontend/index.html"
check_file "frontend/src/App.jsx"
check_file "frontend/src/main.jsx"
check_file "frontend/src/index.css"
check_file "frontend/src/services/api.js"
check_file "frontend/src/components/FileUpload.jsx"
check_file "frontend/src/components/GraphVisualization.jsx"
check_file "frontend/src/components/RiskTable.jsx"
check_file "frontend/src/components/ExplanationPanel.jsx"

echo ""
echo "📂 Checking data files..."
echo ""

check_dir "data"
check_file "data/users.csv"
check_file "data/transactions.csv"

echo ""
echo "🔍 Checking dependencies..."
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker installed ($(docker --version | cut -d' ' -f3 | cut -d',' -f1))"
    if docker info &> /dev/null 2>&1; then
        echo "✅ Docker daemon running"
    else
        echo "⚠️  Docker daemon not running"
        ((WARNINGS++))
    fi
else
    echo "⚠️  Docker not installed (optional for local dev)"
    ((WARNINGS++))
fi

# Check Python
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 installed ($(python3 --version | cut -d' ' -f2))"
else
    echo "⚠️  Python 3 not installed (required for local dev)"
    ((WARNINGS++))
fi

# Check Node
if command -v node &> /dev/null; then
    echo "✅ Node.js installed ($(node --version))"
else
    echo "⚠️  Node.js not installed (required for local dev)"
    ((WARNINGS++))
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm installed ($(npm --version))"
else
    echo "⚠️  npm not installed (required for local dev)"
    ((WARNINGS++))
fi

echo ""
echo "🔐 Checking environment configuration..."
echo ""

if [ -f ".env" ]; then
    echo "✅ .env file exists"
    if grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
        echo "✅ OPENAI_API_KEY appears to be set"
    elif grep -q "OPENAI_API_KEY=your_openai_api_key_here" .env 2>/dev/null; then
        echo "⚠️  OPENAI_API_KEY is placeholder - needs real key"
        ((WARNINGS++))
    else
        echo "⚠️  OPENAI_API_KEY may not be set correctly"
        ((WARNINGS++))
    fi
else
    echo "⚠️  .env file not found - create from .env.example"
    ((WARNINGS++))
fi

echo ""
echo "========================================"
echo "📊 Verification Summary"
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Project is ready to run."
    echo ""
    echo "Next steps:"
    echo "  1. Ensure OPENAI_API_KEY is set in .env"
    echo "  2. Run: ./run.sh (Docker) or ./run-local.sh (Local)"
    echo "  3. Open: http://localhost:3000"
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Project structure OK, but $WARNINGS warning(s) found."
    echo "   Review warnings above before running."
else
    echo "❌ Found $ERRORS error(s) and $WARNINGS warning(s)."
    echo "   Please fix errors before running the application."
    exit 1
fi

echo ""
