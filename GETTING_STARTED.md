# 🚀 Getting Started with Durin

**Welcome!** This guide will get you from zero to demo in **5 minutes**.

---

## ⚡ Super Quick Start (TL;DR)

```bash
# 1. Add your OpenAI API key to .env
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# 2. Run the app
./run.sh

# 3. Open browser
open http://localhost:3000

# 4. Upload sample data from /data folder and click "Run Analysis"
```

**Done!** 🎉

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Docker Desktop** installed and running
  - Download: https://www.docker.com/products/docker-desktop
- ✅ **OpenAI API Key** (for AI explanations)
  - Get one: https://platform.openai.com/api-keys
  - Free tier works fine for demos

**That's it!** Everything else is included.

---

## 🎯 Step-by-Step Setup

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. **Save it somewhere** - you'll need it in Step 3

### Step 2: Verify Project Files

```bash
# Navigate to project directory
cd FinshieldAI

# Run verification script
./verify.sh
```

You should see all green checkmarks ✅

### Step 3: Configure Environment

```bash
# The .env file already exists, just edit it
nano .env  # or use your favorite editor

# Replace the placeholder with your actual key:
OPENAI_API_KEY=sk-your-actual-key-here

# Save and exit (Ctrl+X, then Y, then Enter in nano)
```

### Step 4: Start the Application

```bash
# One command to start everything
./run.sh
```

You'll see:

```
🐳 Starting Durin with Docker...
✅ Backend is running at http://localhost:8000
✅ Durin is ready!

📊 Frontend:  http://localhost:3000
🔌 Backend:   http://localhost:8000
📖 API Docs:  http://localhost:8000/docs
```

### Step 5: Open the Dashboard

Open your browser to: **http://localhost:3000**

You should see the Durin dashboard with a dark theme and gradient logo.

### Step 6: Run Your First Analysis

1. **Upload Users Data:**

   - Click the "Users / KYC Data" upload box
   - Select `data/users.csv` from the project folder
   - You'll see a green checkmark ✅

2. **Upload Transactions Data:**

   - Click the "Transactions Data" upload box
   - Select `data/transactions.csv`
   - Another green checkmark ✅

3. **Run Analysis:**

   - Click the big blue **"Run Analysis"** button
   - Wait ~1 second

4. **Explore Results:**
   - You'll see an interactive graph with colored nodes:
     - 🔴 Red = High risk (7-10)
     - 🟠 Orange = Medium risk (4-6)
     - 🟢 Green = Low risk (0-3)
5. **Get AI Explanation:**
   - Click any red (high-risk) node
   - Wait 2-3 seconds for GPT-4 to generate explanation
   - Read the AI-generated fraud analysis in the right panel

**Congratulations!** You've successfully run your first fraud analysis. 🎉

---

## 🎬 What to Demo

### The Wow Moments

1. **Upload Speed** - Drag & drop is instant
2. **Analysis Speed** - Results in <1 second
3. **Graph Visualization** - Beautiful, interactive network
4. **AI Explanations** - Real GPT-4 insights, not hardcoded
5. **Professional UI** - Dark mode, smooth animations

### Key Features to Show

- ✅ **Graph View** - Force-directed network visualization
- ✅ **Table View** - Sortable risk assessment table
- ✅ **AI Panel** - Detailed fraud signals with severity
- ✅ **Risk Scoring** - 0-10 scale with color coding
- ✅ **Multi-Signal Detection** - 4 different fraud patterns

---

## 🛑 How to Stop

```bash
# Stop all services
docker-compose down

# Or press Ctrl+C if you used ./run-local.sh
```

---

## 🔄 How to Restart

```bash
# Start again
./run.sh

# Or if services are already running
docker-compose restart
```

---

## 🐛 Common Issues & Fixes

### Issue: "Port 3000 already in use"

**Fix:**

```bash
# Stop existing services
docker-compose down

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
./run.sh
```

### Issue: "OPENAI_API_KEY not found"

**Fix:**

```bash
# Check if .env exists
cat .env

# If it shows "your_openai_api_key_here", edit it:
nano .env

# Replace with your actual key:
OPENAI_API_KEY=sk-your-real-key-here

# Restart services
docker-compose restart
```

### Issue: "Docker daemon not running"

**Fix:**

1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar)
3. Run `./run.sh` again

### Issue: Graph not showing

**Fix:**

- Try Chrome or Firefox (Safari sometimes has issues)
- Clear browser cache (Cmd+Shift+R on Mac)
- Check browser console for errors (F12)
- Make sure you uploaded BOTH CSV files

### Issue: AI explanation stuck on "Generating..."

**Fix:**

- Check your OpenAI API key is valid
- Check you have API credits (free tier works)
- Wait up to 10 seconds (OpenAI can be slow)
- If it fails, the app will show a fallback explanation

---

## 📚 Next Steps

### Learn More

- **Full Documentation:** [README.md](README.md)
- **Demo Script:** [DEMO.md](DEMO.md) - 5-minute pitch
- **Detailed Setup:** [SETUP.md](SETUP.md) - Advanced configuration
- **Project Summary:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

### Customize

- **Change Colors:** Edit `frontend/tailwind.config.js`
- **Adjust Risk Weights:** Edit `backend/app/graph_analyzer.py`
- **Add New Signals:** Add detection methods in graph analyzer

### Deploy to Production

- **AWS:** Use EC2 + RDS
- **Heroku:** One-click deploy
- **DigitalOcean:** App Platform

---

## 🎓 Understanding the Sample Data

### users.csv (15 users)

- **Fraud Pattern:** Users U1, U2, U8 share device D1
- **Fraud Pattern:** Users U4, U5, U12 share device D3
- Shows account takeover or mule network behavior

### transactions.csv (30 transactions)

- **Fraud Pattern:** Account A1 sends 4 small transactions (<$1k) - structuring
- **Fraud Pattern:** Account A11 sends 4 small transactions - structuring
- **Fraud Pattern:** A8 → A1 → ... creates circular flow
- Shows money laundering patterns

---

## 🎯 Quick Reference

### URLs

| Service      | URL                              |
| ------------ | -------------------------------- |
| Dashboard    | http://localhost:3000            |
| API Server   | http://localhost:8000            |
| API Docs     | http://localhost:8000/docs       |
| Health Check | http://localhost:8000/api/health |

### Commands

| Action         | Command                  |
| -------------- | ------------------------ |
| Start (Docker) | `./run.sh`               |
| Start (Local)  | `./run-local.sh`         |
| Stop           | `docker-compose down`    |
| Restart        | `docker-compose restart` |
| View Logs      | `docker-compose logs -f` |
| Verify Setup   | `./verify.sh`            |

### Files

| File                    | Purpose             |
| ----------------------- | ------------------- |
| `.env`                  | Your OpenAI API key |
| `data/users.csv`        | Sample KYC data     |
| `data/transactions.csv` | Sample transactions |
| `README.md`             | Full documentation  |
| `DEMO.md`               | Demo script         |

---

## 💡 Pro Tips

1. **Test Before Demo:** Run through the full workflow once
2. **Have Backup:** Take screenshots in case of network issues
3. **Clear Cache:** Start with a fresh browser session
4. **Zoom UI:** Set browser zoom to 110% for better visibility
5. **Practice Timing:** 5-minute demo = 30s per major feature

---

## 🆘 Get Help

### Check Logs

```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# All logs
docker-compose logs -f
```

### Test API Directly

```bash
# Health check
curl http://localhost:8000/api/health

# Interactive API docs
open http://localhost:8000/docs
```

### Verify Services

```bash
# Check if containers are running
docker-compose ps

# Should show both backend and frontend as "Up"
```

---

## ✅ Pre-Demo Checklist

Before your demo, verify:

- [ ] Docker is running
- [ ] `./verify.sh` shows all green checkmarks
- [ ] `.env` has your real OpenAI API key
- [ ] `./run.sh` starts without errors
- [ ] http://localhost:3000 loads the dashboard
- [ ] Sample CSVs upload successfully
- [ ] Analysis completes in <1 second
- [ ] Graph renders correctly
- [ ] AI explanation generates (may take 2-3s)
- [ ] You've practiced the demo flow once

---

**You're ready to demo! 🚀**

**Questions?** Check [SETUP.md](SETUP.md) for detailed troubleshooting.

**Good luck with your hackathon!** 🏆
