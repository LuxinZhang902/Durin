# Quick Install & Test Guide

## Installation (One Command)

```bash
cd backend
pip install -r requirements.txt
```

**Expected time:** 5-10 minutes (includes downloading ML models)

## Run the System

### Terminal 1: Start Server
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Wait for:
```
Initializing database...
✓ Database initialized
✓ LLM service initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Run Demo
```bash
cd backend
python demo_underwriting.py
```

## What You'll See

### User 001 (Good Profile)
```
APPROVED ✓

Risk Assessment:
  - PD (12-month): 5.50%
  - Credit Limit: $2000.00
  - APR: 17.50%

Liveness Check:
  - Pass: True
  - Real face: True (or False if no face detected)
  - Deepfake: False
  - Sanctions pass: True
```

### User 002 (Risky Profile)
```
APPROVED ✓ (or DECLINED)

Risk Assessment:
  - PD (12-month): 9.80%
  - Credit Limit: $800.00
  - APR: 21.80%

Key Risk Factors:
  1. [HIGH] 3 NSF/overdraft events
  2. [MEDIUM] Irregular income
```

## Verify Database

```bash
cd backend
python -c "
from app.database import SessionLocal, User, Transaction, UnderwritingDecisionDB
db = SessionLocal()
print(f'Users: {db.query(User).count()}')
print(f'Transactions: {db.query(Transaction).count()}')
print(f'Decisions: {db.query(UnderwritingDecisionDB).count()}')
"
```

## Test Individual Endpoints

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```

### 2. Upload Transactions
```bash
curl -X POST "http://localhost:8000/api/underwrite/transactions/csv?user_id=test_user" \
  -F "file=@data/underwriting/bank_transactions_user1.csv"
```

### 3. Check Status
```bash
curl http://localhost:8000/api/underwrite/status/test_user
```

## Interactive API Docs

Open in browser:
```
http://localhost:8000/docs
```

Try all endpoints with built-in Swagger UI!

## Troubleshooting

### DeepFace Models Not Downloading
```bash
# Manually trigger download
python -c "from deepface import DeepFace; DeepFace.build_model('Facenet512')"
```

### Port 8000 Already in Use
```bash
# Use different port
uvicorn app.main:app --reload --port 8001

# Update demo script
# In demo_underwriting.py: API_BASE = "http://localhost:8001"
```

### Database Locked
```bash
# Reset database
cd backend
rm finshield_underwriting.db
# Restart server (will recreate)
```

### Import Errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

## Success Checklist

- [ ] Server starts without errors
- [ ] Database created (finshield_underwriting.db exists)
- [ ] Health check returns 200
- [ ] Demo script runs both users
- [ ] Both users receive decisions
- [ ] Interactive docs accessible
- [ ] Database has 2+ users

## Next: See Full Documentation

- [SETUP_PRODUCTION.md](SETUP_PRODUCTION.md) - Full setup guide
- [UNDERWRITING.md](UNDERWRITING.md) - API documentation
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details
