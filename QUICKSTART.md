# ⚡ FinShield AI - Quick Start

Get the **production-ready underwriting system** running in **5 minutes**.

---

## 🚀 Underwriting System (Production-Ready)

### Step 1: Install (One Command)

```bash
cd backend
pip install -r requirements.txt
```

⏱️ **Time:** 5-10 minutes (includes ML model downloads ~450MB)

### Step 2: Start Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Wait for:**
```
Initializing database...
✓ Database initialized
✓ LLM service initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Run Demo (New Terminal)

```bash
cd backend
python demo_underwriting.py
```

### Step 4: Verify Success

✅ You should see:
- User 001: APPROVED ✓ ($2000 limit)
- User 002: APPROVED ✓ or DECLINED ($800 limit)
- Database file created: `finshield_underwriting.db`

**That's it!** 🎉

---

## ✅ Verify Installation

```bash
cd backend
python test_system.py
```

Should show all tests passed ✅

---

## 🆘 Troubleshooting

### Models not downloading?
```bash
python -c "from deepface import DeepFace; DeepFace.build_model('Facenet512')"
```

### Port 8000 busy?
```bash
uvicorn app.main:app --reload --port 8001
# Then update demo_underwriting.py: API_BASE = "http://localhost:8001"
```

### Import errors?
```bash
pip install --upgrade -r requirements.txt
```

### Database locked?
```bash
rm finshield_underwriting.db
# Restart server (will recreate)
```

---

## 📚 Next Steps

- **Interactive API Docs**: http://localhost:8000/docs
- **Production Setup**: [SETUP_PRODUCTION.md](SETUP_PRODUCTION.md)
- **Full API Reference**: [UNDERWRITING.md](UNDERWRITING.md)
- **Implementation Details**: [PRODUCTION_READY_SUMMARY.md](PRODUCTION_READY_SUMMARY.md)

---

## 🎯 Key URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Backend** | http://localhost:8000 | API server |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/api/health | Service status |

---

## 🎬 Demo Highlights

1. **SQLite Database** - Data persists across restarts
2. **Real Face Detection** - DeepFace + RetinaFace with deepfake detection
3. **Sanctions Screening** - OpenSanctions API (OFAC, UN, EU, PEP)
4. **Cashflow Analysis** - 90-day transaction history metrics
5. **Explainable AI** - Risk reasons + counterfactual improvements

**Total demo time: 2 minutes** ⚡

---

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] `finshield_underwriting.db` created
- [ ] Demo processes 2 users
- [ ] Both users receive decisions
- [ ] `/docs` page accessible
- [ ] Database has 2+ users

**All checked?** 🚀 You're ready!

---

**Questions? See [SETUP_PRODUCTION.md](SETUP_PRODUCTION.md) for detailed documentation.**
