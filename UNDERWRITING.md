# Durin - Underwriting System

Country-agnostic cashflow-based underwriting with fraud prevention.

## 🎯 Overview

The underwriting system converts verified foreign/domestic cashflow into furnishable-ready credit decisions, gated by identity integrity checks. It provides:

- **Cashflow Analysis**: 90-day transaction history → financial health metrics
- **Liveness Verification**: Facial scan fraud prevention gate
- **Credit Scoring**: PD calculation with monotone constraints
- **Explainability**: Risk reasons and counterfactual improvements
- **Jurisdiction Support**: US/UK policy configurations

## 🏗️ Architecture

```
┌─────────────────────┐
│ Bank Transactions   │──┐
│ (CSV/JSON)          │  │
└─────────────────────┘  │
                         │    ┌──────────────────┐
┌─────────────────────┐  ├───>│ Cashflow Analyzer│
│ Personal Data       │  │    └──────────────────┘
│ (Employment, Income)│  │              │
└─────────────────────┘  │              ▼
                         │    ┌──────────────────┐
┌─────────────────────┐  │    │ Underwriting     │
│ Facial Liveness     │──┴───>│ Scorer           │
│ (Base64 Image)      │       └──────────────────┘
└─────────────────────┘                 │
                                        ▼
                              ┌──────────────────┐
                              │ Decision Token   │
                              │ - PD Score       │
                              │ - Credit Limit   │
                              │ - APR            │
                              │ - Reasons        │
                              │ - Counterfactuals│
                              └──────────────────┘
```

## 📊 Components

### 1. Cashflow Analyzer

Computes financial health metrics from transaction history:

**Income Metrics:**

- Median monthly income
- Income coefficient of variation (stability)

**Spending Metrics:**

- Essential spending (groceries, utilities, rent)
- Discretionary spending

**Health Metrics:**

- Buffer days (cash runway)
- Payment burden (recurring payments / income)
- On-time payment ratio
- NSF/overdraft count (90 days)

### 2. Liveness Checker

Identity integrity gate with fraud prevention:

**Checks:**

- Image validation (format, size)
- Liveness scoring (mock implementation for MVP)
- Replay detection (screen capture detection)
- Sanctions screening (mock deny-list)
- Device risk scoring (shared device detection)

**Production Upgrade Path:**

- InsightFace ONNX for face embeddings
- Passive liveness (texture analysis, blink detection)
- Real sanctions lists (OFAC, OFSI, PEP databases)
- Device intelligence service integration

### 3. Underwriting Scorer

Credit risk engine with explainable decisions:

**PD Calculation:**

- Monotone constraints (better cashflow → lower PD)
- Feature-driven (uses computed metrics)
- Jurisdiction-specific thresholds

**Outputs:**

- Probability of default (12-month)
- Credit limit (tiered by PD)
- APR (risk-based pricing)
- Risk reasons (top 5 factors)
- Counterfactuals (improvement suggestions)

## 🚀 API Endpoints

### Health Check

```bash
GET /api/health
```

Returns system status including underwriting services.

### 1. Upload Transactions (CSV)

```bash
POST /api/underwrite/transactions/csv?user_id={user_id}
Content-Type: multipart/form-data

file: bank_transactions.csv
```

**CSV Format:**

```csv
txn_id,account_id,timestamp,amount,currency,merchant,counterparty,transaction_type,mcc
txn_001,ACC_U1,2025-07-28T09:00:00Z,2800.00,USD,Acme Corp Payroll,,income,
txn_002,ACC_U1,2025-07-29T14:23:00Z,-45.32,USD,Whole Foods Market,,expense,5411
```

**Response:**

```json
{
  "success": true,
  "message": "Parsed and stored 48 transactions",
  "user_id": "user_001",
  "transaction_count": 48
}
```

### 2. Upload Transactions (JSON)

```bash
POST /api/underwrite/transactions
Content-Type: application/json

{
  "user_id": "user_001",
  "transactions": [
    {
      "txn_id": "txn_001",
      "account_id": "ACC_U1",
      "timestamp": "2025-07-28T09:00:00Z",
      "amount": 2800.00,
      "currency": "USD",
      "merchant": "Acme Corp Payroll",
      "transaction_type": "income"
    }
  ]
}
```

### 3. Submit Personal Data

```bash
POST /api/underwrite/personal-data
Content-Type: application/json

{
  "personal_data": {
    "user_id": "user_001",
    "full_name": "Sarah Johnson",
    "address": "1234 Maple Street, Apt 5B, Austin, TX 78701",
    "country": "US",
    "employment_status": "full_time",
    "monthly_income": 2800.00,
    "tenure_months": 18
  }
}
```

**Employment Status Options:**

- `full_time`
- `part_time`
- `self_employed`
- `unemployed`
- `retired`

### 4. Perform Liveness Check

```bash
POST /api/underwrite/liveness
Content-Type: application/json

{
  "liveness_check": {
    "user_id": "user_001",
    "image_data": "base64_encoded_selfie_image...",
    "device_fingerprint": "device_abc123"
  }
}
```

**Response:**

```json
{
  "success": true,
  "user_id": "user_001",
  "liveness_pass": true,
  "liveness_score": 0.87,
  "replay_detected": false,
  "sanctions_pass": true,
  "device_risk_score": 0.12,
  "flags": []
}
```

### 5. Run Underwriting Analysis

```bash
POST /api/underwrite/analyze
Content-Type: application/json

{
  "user_id": "user_001",
  "jurisdiction": "US"
}
```

**Jurisdictions:** `US` or `UK`

**Response:**

```json
{
  "success": true,
  "message": "Underwriting analysis complete",
  "decision": {
    "decision_id": "dec_a1b2c3d4e5f6",
    "user_id": "user_001",
    "timestamp": "2025-10-25T20:30:00Z",
    "jurisdiction": "US",
    "fraud_gate_passed": true,
    "pd_12m": 0.055,
    "lgd": 0.45,
    "expected_loss": 49.5,
    "approved": true,
    "credit_limit": 2000,
    "apr": 17.5,
    "reasons": [
      {
        "code": "STABLE_INCOME",
        "description": "Consistent and stable income pattern detected",
        "impact": -0.01,
        "severity": "low"
      },
      {
        "code": "STRONG_CASH_BUFFER",
        "description": "Healthy cash buffer of 25.3 days",
        "impact": -0.015,
        "severity": "low"
      }
    ],
    "counterfactuals": []
  }
}
```

### 6. Retrieve Decision

```bash
GET /api/underwrite/decision/{user_id}
```

### 7. Check Status

```bash
GET /api/underwrite/status/{user_id}
```

Returns which steps have been completed:

```json
{
  "user_id": "user_001",
  "transactions_uploaded": true,
  "personal_data_submitted": true,
  "liveness_checked": true,
  "decision_made": true,
  "ready_for_analysis": true
}
```

### 8. Clear User Data (Testing)

```bash
DELETE /api/underwrite/user/{user_id}
```

## 📈 Scoring Logic

### PD Calculation Formula

```
Base PD = 0.08

Adjustments:
  Buffer Days:      -2.5% (≥30d) to +2.5% (<10d)
  Payment Burden:   -2.0% (≤25%) to +3.0% (>45%)
  On-time Ratio:    -1.5% (≥95%) to +2.5% (<75%)
  NSF Events:       -1.0% (0) to +3.0% (≥2)
  Income Stability: -1.0% (CV≤0.2) to +2.5% (CV>0.6)
  Income Level:     -1.0% (≥$4k) to +1.5% (<$1.5k)
  Employment Tenure: -1.0% (≥24mo) to +1.5% (<6mo)

Final PD = Capped between 1% and 30%
```

### Credit Limit Tiers

| PD Range | Credit Limit | Risk Tier  |
| -------- | ------------ | ---------- |
| 0-3%     | $3,000       | Prime      |
| 3-6%     | $2,000       | Near-Prime |
| 6-9%     | $1,200       | Starter    |
| 9-12%    | $800         | High-Risk  |
| >12%     | $0 (Decline) | Declined   |

### APR Pricing

```
APR = Base Rate (12%) + Risk Premium (PD × 100)
Capped at 35.99%
```

## 🌍 Jurisdiction Differences

### US Thresholds

- Min buffer days: 15
- Max payment burden: 40%
- Min on-time ratio: 85%
- Max NSF count: 2
- Starter max PD: 12%

### UK Thresholds

- Min buffer days: 20
- Max payment burden: 35%
- Min on-time ratio: 90%
- Max NSF count: 1
- Starter max PD: 10%

## 🧪 Testing

### Quick Start

1. **Start the API:**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. **Run the demo script:**

```bash
cd backend
python demo_underwriting.py
```

This will run through both sample users (good profile and risky profile).

### Manual Testing

See `data/underwriting/README.md` for detailed curl examples.

### Sample Users

**User 001 (Sarah Johnson):**

- Stable full-time employment
- Regular $2,800/month salary
- Low risk profile
- Expected: APPROVED at $2,000 limit, ~17.5% APR

**User 002 (Marcus Chen):**

- Gig economy worker
- Irregular income ($1,800-2,400/month)
- 3 NSF events, late fees detected
- High payment burden from payday loans
- Expected: APPROVED at $800 limit, ~22% APR (or DECLINED depending on thresholds)

## 📊 Metrics

### Cashflow Metrics Explained

**Buffer Days:** How many days the user can survive at current spending rate with available cash.

- Good: ≥20 days
- Fair: 10-20 days
- Poor: <10 days

**Payment Burden:** Recurring monthly payments as % of income.

- Good: ≤30%
- Fair: 30-40%
- Poor: >40%

**Income CV (Coefficient of Variation):** Stability measure (std dev / mean).

- Stable: CV < 0.3
- Moderate: CV 0.3-0.5
- Volatile: CV > 0.5

**On-time Ratio:** % of payments made on time.

- Excellent: ≥95%
- Good: 85-95%
- Poor: <85%

## 🔐 Security & Privacy

### Current Implementation (MVP)

- In-memory storage (no persistence)
- Base64 image transmission
- Mock liveness detection
- Hashed PII in personal data (optional)

### Production Recommendations

- Encrypt PII at rest and in transit
- Store images ephemerally (delete after processing)
- Use secure key management (AWS KMS, HashiCorp Vault)
- Implement audit logging
- GDPR/CCPA compliance workflows
- Rate limiting on endpoints
- Device fingerprinting with consent

## 📝 Compliance Notes

### Adverse Action Requirements

When declining or offering less favorable terms, reasons must be provided:

**US (Reg B / ECOA):**

- Clear statement of adverse action
- Specific reasons (up to 4 primary)
- Right to obtain credit report
- CFPB contact information

**UK (UK-GDPR Art. 22):**

- Right to human review
- Explanation of automated decision logic
- Right to contest decision
- ICO contact information

This system provides the `reasons` field to support adverse action letters.

### Furnishing to Credit Bureaus

The decision token can be used to generate:

- **US:** Metro2 format records
- **UK:** CAIS (Credit Account Information Sharing) format

Fields included:

- Account open date
- Credit limit
- Payment status
- Compliance condition codes

## 🚀 Deployment

### Docker

```bash
# Build and run
docker-compose up --build

# API available at http://localhost:8000
```

### Local Development

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Access interactive docs
open http://localhost:8000/docs
```

## 📚 API Documentation

Interactive OpenAPI documentation available at:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🎓 Examples

See the `data/underwriting/` directory for:

- Sample transaction CSVs
- Personal data JSON examples
- Complete API workflow examples
- Expected outcomes for each profile

## 🤝 Support

For questions or issues:

- Check `/api/health` endpoint
- Review logs in console
- See `data/underwriting/README.md` for troubleshooting
- Open an issue on GitHub

---

**Built with FastAPI, Pandas, and Scikit-learn**
