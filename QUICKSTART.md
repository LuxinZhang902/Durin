# ⚡ FinShield AI - Quick Start

Get up and running in **5 minutes**.

---

## 🚀 Fastest Path (Docker)

```bash
# 1. Navigate to project
cd FinshieldAI

# 2. Create environment file
cp .env.example .env

# 3. Add your OpenAI API key
# Edit .env and replace 'your_openai_api_key_here' with your actual key
# Get key from: https://platform.openai.com/api-keys

# 4. Start everything
./run.sh

# 5. Open browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

**That's it!** 🎉

---

## 📋 Step-by-Step First Demo

### 1. Upload Sample Data
- Click **"Users / KYC Data"** → Select `data/users.csv`
- Click **"Transactions Data"** → Select `data/transactions.csv`

### 2. Run Analysis
- Click **"Run Analysis"** button
- Wait ~1 second for results

### 3. Explore Results
- **Graph View**: See the fraud network visualization
- Click any **red node** (high risk) to see AI explanation
- Switch to **Table View** for detailed risk scores

---

## 🛠️ Alternative: Local Development

```bash
# If you don't have Docker or prefer local setup

# 1. Start services
./run-local.sh

# 2. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

---

## ✅ Verify Installation

```bash
# Run verification script
./verify.sh

# Should show all green checkmarks ✅
```

---

## 🆘 Troubleshooting

### "OPENAI_API_KEY not found"
```bash
# Make sure .env exists and has your key
cat .env
# Should show: OPENAI_API_KEY=sk-...
```

### "Port already in use"
```bash
# Stop existing services
docker-compose down

# Or change ports in docker-compose.yml
```

### "Docker not running"
```bash
# Start Docker Desktop application
# Then retry: ./run.sh
```

### Graph not showing
- Try different browser (Chrome recommended)
- Clear browser cache
- Check browser console for errors

---

## 📚 Next Steps

- **Read full docs**: [README.md](README.md)
- **Demo preparation**: [DEMO.md](DEMO.md)
- **Detailed setup**: [SETUP.md](SETUP.md)

---

## 🎯 Key URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main dashboard |
| **Backend** | http://localhost:8000 | API server |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/api/health | Service status |

---

## 🎬 Quick Demo Flow

1. **Upload** → `data/users.csv` + `data/transactions.csv`
2. **Analyze** → Click "Run Analysis"
3. **Explore** → Click red nodes for AI explanations
4. **Present** → Show graph + AI insights

**Total time: 30 seconds** ⚡

---

**Questions? Check [SETUP.md](SETUP.md) for detailed troubleshooting.**
