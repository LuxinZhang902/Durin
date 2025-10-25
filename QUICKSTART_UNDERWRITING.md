# Quick Start - Underwriting System

## 🚀 Get Started in 2 Minutes

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start the API Server
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✓ LLM service initialized (or fallback message)
```

### Step 3: Run the Demo
Open a new terminal:
```bash
cd backend
python demo_underwriting.py
```

This will:
1. Upload transactions for 2 users
2. Submit personal data
3. Perform liveness checks
4. Run underwriting analysis
5. Display full decisions with PD scores, reasons, and counterfactuals

---

## 📊 What You'll See

### User 001 - Good Profile
```
APPROVED ✓

Risk Assessment:
  - PD (12-month): 5.50%
  - Credit Limit: $2000.00
  - APR: 17.50%

Cashflow Health:
  - Monthly Income: $2800.00
  - Cash Buffer: 25.3 days
  - Payment Burden: 28%

Key Risk Factors:
  1. [LOW] Consistent and stable income pattern
  2. [LOW] Healthy cash buffer of 25.3 days
```

### User 002 - Risky Profile
```
APPROVED ✓ (but with lower limit)

Risk Assessment:
  - PD (12-month): 9.80%
  - Credit Limit: $800.00
  - APR: 21.80%

Cashflow Health:
  - Monthly Income: $2200.00
  - Cash Buffer: 12.1 days
  - Payment Burden: 42%
  - NSF Events (90d): 3

Key Risk Factors:
  1. [HIGH] 3 NSF/overdraft events in last 90 days
  2. [MEDIUM] Irregular income (CV=0.48)
  3. [HIGH] Payment burden at 42% exceeds 40% threshold

Improvement Suggestions:
  1. Eliminate NSF events
     Current: 3.00 → Target: 0.00
     PD Impact: -0.045 (moderate difficulty)
```

---

## 🌐 Interactive API Docs

Visit: **http://localhost:8000/docs**

Try endpoints directly in the browser:
- Upload transactions
- Submit personal data
- Run liveness checks
- Get underwriting decisions

---

## 📁 Sample Data Locations

- `data/underwriting/bank_transactions_user1.csv` - Good profile
- `data/underwriting/bank_transactions_user2.csv` - Risky profile
- `data/underwriting/personal_data.json` - Employment info
- `data/underwriting/README.md` - Data format guide

---

## 🧪 Manual Testing

### Option 1: Use curl (see data/underwriting/README.md)
### Option 2: Use Swagger UI (http://localhost:8000/docs)
### Option 3: Use the demo script (recommended)

---

## 🎯 Key Endpoints

```
POST /api/underwrite/transactions/csv  - Upload transaction CSV
POST /api/underwrite/personal-data     - Submit personal info
POST /api/underwrite/liveness          - Facial liveness check
POST /api/underwrite/analyze           - Run full analysis
GET  /api/underwrite/decision/{id}     - Get decision
```

---

## 📖 Full Documentation

- **System Overview:** See `UNDERWRITING.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **Data Formats:** See `data/underwriting/README.md`

---

## ✅ Success Checklist

- [ ] API server running on port 8000
- [ ] Demo script executes without errors
- [ ] Both users receive decisions
- [ ] Interactive docs accessible at /docs
- [ ] User 001 approved with ~$2000 limit
- [ ] User 002 approved with ~$800 limit (or declined)

---

## 🆘 Troubleshooting

**ImportError on scikit-learn/numpy/pillow:**
```bash
pip install scikit-learn==1.3.2 numpy==1.26.2 pillow==10.1.0
```

**Port 8000 already in use:**
```bash
uvicorn app.main:app --reload --port 8001
# Update demo script: API_BASE = "http://localhost:8001"
```

**ModuleNotFoundError for app.models:**
```bash
# Make sure you're in the backend directory
cd backend
python demo_underwriting.py
```

---

**🎉 You're ready! Run the demo and explore the API.**

