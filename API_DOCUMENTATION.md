# Durin - Complete API Documentation

**Base URL**: `http://localhost:8000`

**Version**: 1.0.0

**Production Ready**: All endpoints use real APIs (Reality Defender, OpenSanctions, SQLite Database)

---

## Table of Contents

1. [Health & Status](#health--status)
2. [User Onboarding Flow](#user-onboarding-flow)
3. [Underwriting Endpoints](#underwriting-endpoints)
4. [Legacy Fraud Detection](#legacy-fraud-detection)
5. [Error Handling](#error-handling)
6. [Complete Frontend Integration Example](#complete-frontend-integration-example)

---

## Health & Status

### GET `/api/health`

**Description**: Check API health status

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T21:30:00Z",
  "database": "connected",
  "services": {
    "reality_defender": "configured",
    "opensanctions": "configured",
    "llm": "ready"
  }
}
```

---

## User Onboarding Flow

Complete user journey from signup to credit decision.

### Step 1: Submit Personal Data

**POST** `/api/underwrite/personal-data`

**Description**: Submit user's personal and employment information

**Request Body**:

```json
{
  "personal_data": {
    "user_id": "user_12345",
    "full_name": "John Smith",
    "address": "123 Main Street, Apt 4B, New York, NY 10001",
    "country": "US",
    "employment_status": "full_time",
    "monthly_income": 5000,
    "tenure_months": 24,
    "email_hash": "optional_hash",
    "phone_hash": "optional_hash"
  }
}
```

**Response**:

```json
{
  "success": true,
  "user_id": "user_12345",
  "message": "Personal data stored successfully"
}
```

**Validation Rules**:

- `full_name`: Minimum 2 characters
- `address`: Minimum 10 characters
- `monthly_income`: Must be > 0
- `tenure_months`: Must be >= 0
- `employment_status`: One of: `full_time`, `part_time`, `self_employed`, `unemployed`, `retired`

---

### Step 2: Upload Bank Transactions

**POST** `/api/underwrite/transactions`

**Description**: Upload user's bank transaction history (JSON)

**Request Body**:

```json
{
  "user_id": "user_12345",
  "transactions": [
    {
      "txn_id": "txn_001",
      "account_id": "acc_12345",
      "timestamp": "2025-10-01T10:30:00Z",
      "amount": 2500.0,
      "currency": "USD",
      "merchant": "Employer Inc",
      "counterparty": null,
      "transaction_type": "income",
      "mcc": "8999"
    },
    {
      "txn_id": "txn_002",
      "account_id": "acc_12345",
      "timestamp": "2025-10-05T14:20:00Z",
      "amount": -45.5,
      "currency": "USD",
      "merchant": "Grocery Store",
      "counterparty": null,
      "transaction_type": "expense",
      "mcc": "5411"
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "user_id": "user_12345",
  "transactions_stored": 2,
  "message": "Transactions uploaded successfully"
}
```

---

**POST** `/api/underwrite/transactions/csv`

**Description**: Upload user's bank transaction history (CSV file)

**Request**: `multipart/form-data`

- `user_id`: string (form field)
- `file`: CSV file (file upload)

**CSV Format**:

```csv
txn_id,account_id,timestamp,amount,currency,merchant,counterparty,transaction_type,mcc
txn_001,acc_12345,2025-10-01T10:30:00Z,2500.00,USD,Employer Inc,,income,8999
txn_002,acc_12345,2025-10-05T14:20:00Z,-45.50,USD,Grocery Store,,expense,5411
```

**Example (curl)**:

```bash
curl -X POST "http://localhost:8000/api/underwrite/transactions/csv" \
  -F "user_id=user_12345" \
  -F "file=@transactions.csv"
```

**Response**:

```json
{
  "success": true,
  "user_id": "user_12345",
  "transactions_parsed": 150,
  "transactions_stored": 150,
  "message": "CSV uploaded and transactions stored successfully"
}
```

---

### Step 3: Liveness Check (Selfie + Deepfake Detection)

**POST** `/api/underwrite/liveness`

**Description**: Verify user's identity with facial liveness check using Reality Defender API

**Request Body**:

```json
{
  "liveness_check": {
    "user_id": "user_12345",
    "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "device_fingerprint": "device_abc123",
    "timestamp": "2025-10-25T21:30:00Z"
  }
}
```

**Response**:

```json
{
  "success": true,
  "user_id": "user_12345",
  "liveness_pass": true,
  "liveness_score": 0.92,
  "replay_detected": false,
  "sanctions_pass": true,
  "device_risk_score": 0.08,
  "flags": [],
  "message": "Liveness check passed"
}
```

**Possible Flags**:

- `IMAGE_TOO_SMALL`: Image data insufficient
- `UNSUPPORTED_FORMAT`: Only JPEG/PNG supported
- `IMAGE_RESOLUTION_TOO_LOW`: Minimum 200x200 pixels
- `REALITY_DEFENDER_DEEPFAKE`: Deepfake detected by Reality Defender
- `REPLAY_DETECTED`: Screen capture detected
- `SANCTIONS_MATCH`: User matches sanctions/PEP database
- `HIGH_DEVICE_RISK`: Device has high fraud risk
- `VELOCITY_ABUSE`: Too many attempts

**Real API Calls Made**:

- ✅ **Reality Defender API**: Deepfake detection (returns request_id + score)
- ✅ **OpenSanctions API**: Sanctions/PEP screening (OFAC, UN, EU, UK OFSI)

---

### Step 4: Run Full Underwriting Analysis

**POST** `/api/underwrite/analyze`

**Description**: Generate final credit decision based on all collected data

**Request Body**:

```json
{
  "user_id": "user_12345",
  "jurisdiction": "US"
}
```

**Response**:

```json
{
  "decision_id": "dec_abc123xyz",
  "user_id": "user_12345",
  "timestamp": "2025-10-25T21:30:00Z",
  "jurisdiction": "US",

  "fraud_gate_passed": true,
  "liveness_result": {
    "user_id": "user_12345",
    "liveness_pass": true,
    "liveness_score": 0.92,
    "replay_detected": false,
    "sanctions_pass": true,
    "device_risk_score": 0.08,
    "flags": []
  },

  "cashflow_metrics": {
    "net_income_median": 5000.0,
    "income_cv": 0.12,
    "essential_spend_median": 2100.0,
    "discretionary_spend_median": 800.0,
    "buffer_days": 45.2,
    "payment_burden": 0.35,
    "on_time_ratio": 0.98,
    "nsf_count_90d": 0,
    "transaction_count": 150
  },

  "pd_12m": 0.045,
  "lgd": 0.45,
  "expected_loss": 24.3,

  "approved": true,
  "credit_limit": 2500.0,
  "apr": 18.9,

  "reasons": [
    {
      "code": "STABLE_INCOME",
      "description": "Consistent monthly income with low variance (CV=12%)",
      "impact": -0.02,
      "severity": "low"
    },
    {
      "code": "STRONG_BUFFER",
      "description": "Healthy cash buffer of 45.2 days",
      "impact": -0.015,
      "severity": "low"
    },
    {
      "code": "EXCELLENT_PAYMENT_HISTORY",
      "description": "98% on-time payment ratio, 0 NSF events",
      "impact": -0.025,
      "severity": "low"
    }
  ],

  "counterfactuals": [
    {
      "action": "Reduce discretionary spending by 20%",
      "current_value": 800.0,
      "target_value": 640.0,
      "pd_delta": -0.008,
      "feasibility": "easy"
    }
  ],

  "model_version": "1.0.0",
  "policy_version": "2025-10-01"
}
```

**Decision Logic**:

1. **Fraud Gate**: Must pass liveness check (no deepfakes, no sanctions)
2. **Cashflow Analysis**: Analyzes income stability, spending patterns, payment history
3. **Risk Scoring**: Calculates PD (Probability of Default) using XGBoost model
4. **Credit Decision**: Applies policy rules to determine approval/limit/APR

**Approval Criteria**:

- `fraud_gate_passed = true`
- `pd_12m < 0.15` (15% default probability threshold)
- `buffer_days > 7`
- `nsf_count_90d < 5`

---

### Step 5: Get Decision Status

**GET** `/api/underwrite/decision/{user_id}`

**Description**: Retrieve the latest underwriting decision for a user

**Response**: Same as `/api/underwrite/analyze` response

**Error Response** (if no decision exists):

```json
{
  "detail": "No decision found for user user_12345"
}
```

---

**GET** `/api/underwrite/status/{user_id}`

**Description**: Get summary of what data has been collected for a user

**Response**:

```json
{
  "user_id": "user_12345",
  "has_personal_data": true,
  "has_transactions": true,
  "transaction_count": 150,
  "has_liveness_check": true,
  "liveness_passed": true,
  "has_decision": true,
  "decision_approved": true,
  "ready_for_analysis": true
}
```

---

### Step 6: Delete User Data (GDPR Compliance)

**DELETE** `/api/underwrite/user/{user_id}`

**Description**: Delete all user data from the system

**Response**:

```json
{
  "success": true,
  "user_id": "user_12345",
  "deleted": {
    "personal_data": true,
    "transactions": 150,
    "liveness_checks": 1,
    "decisions": 1
  },
  "message": "All data for user user_12345 has been deleted"
}
```

---

## Legacy Fraud Detection

**Note**: These endpoints are for the original fraud detection system. For underwriting, use the `/api/underwrite/*` endpoints above.

### POST `/api/analyze`

Basic fraud detection analysis (legacy)

### POST `/api/explain`

Explain fraud predictions (legacy)

### GET `/api/results`

Get cached results (legacy)

---

## Error Handling

All endpoints return standard HTTP status codes:

**200 OK**: Success
**400 Bad Request**: Invalid input data

```json
{
  "detail": "Validation error: monthly_income must be greater than 0"
}
```

**404 Not Found**: Resource not found

```json
{
  "detail": "No decision found for user user_12345"
}
```

**500 Internal Server Error**: Server error

```json
{
  "detail": "Database connection error"
}
```

**422 Unprocessable Entity**: Pydantic validation error

```json
{
  "detail": [
    {
      "loc": ["body", "personal_data", "monthly_income"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

## Complete Frontend Integration Example

### JavaScript/TypeScript Example

```javascript
class FinShieldClient {
  constructor(baseURL = "http://localhost:8000") {
    this.baseURL = baseURL;
  }

  // Step 1: Submit personal data
  async submitPersonalData(userData) {
    const response = await fetch(
      `${this.baseURL}/api/underwrite/personal-data`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal_data: {
            user_id: userData.userId,
            full_name: userData.fullName,
            address: userData.address,
            country: userData.country,
            employment_status: userData.employmentStatus,
            monthly_income: userData.monthlyIncome,
            tenure_months: userData.tenureMonths,
          },
        }),
      }
    );
    return response.json();
  }

  // Step 2: Upload transactions from CSV
  async uploadTransactionsCSV(userId, csvFile) {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", csvFile);

    const response = await fetch(
      `${this.baseURL}/api/underwrite/transactions/csv`,
      {
        method: "POST",
        body: formData,
      }
    );
    return response.json();
  }

  // Step 3: Capture and submit selfie
  async submitLivenessCheck(userId, imageDataURL, deviceFingerprint) {
    const response = await fetch(`${this.baseURL}/api/underwrite/liveness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        liveness_check: {
          user_id: userId,
          image_data: imageDataURL,
          device_fingerprint: deviceFingerprint,
          timestamp: new Date().toISOString(),
        },
      }),
    });
    return response.json();
  }

  // Step 4: Run underwriting analysis
  async runUnderwriting(userId, jurisdiction = "US") {
    const response = await fetch(`${this.baseURL}/api/underwrite/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        jurisdiction: jurisdiction,
      }),
    });
    return response.json();
  }

  // Get decision
  async getDecision(userId) {
    const response = await fetch(
      `${this.baseURL}/api/underwrite/decision/${userId}`
    );
    return response.json();
  }

  // Check status
  async getStatus(userId) {
    const response = await fetch(
      `${this.baseURL}/api/underwrite/status/${userId}`
    );
    return response.json();
  }
}

// Example usage
async function completeOnboarding() {
  const client = new FinShieldClient();
  const userId = "user_" + Date.now();

  try {
    // Step 1: Submit personal data
    console.log("Step 1: Submitting personal data...");
    await client.submitPersonalData({
      userId: userId,
      fullName: "John Smith",
      address: "123 Main St, New York, NY 10001",
      country: "US",
      employmentStatus: "full_time",
      monthlyIncome: 5000,
      tenureMonths: 24,
    });

    // Step 2: Upload transactions
    console.log("Step 2: Uploading transactions...");
    const csvFile = document.getElementById("transaction-file").files[0];
    await client.uploadTransactionsCSV(userId, csvFile);

    // Step 3: Liveness check
    console.log("Step 3: Performing liveness check...");
    const video = document.getElementById("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const imageDataURL = canvas.toDataURL("image/jpeg");

    const livenessResult = await client.submitLivenessCheck(
      userId,
      imageDataURL,
      navigator.userAgent
    );

    if (!livenessResult.liveness_pass) {
      console.error("Liveness check failed:", livenessResult.flags);
      return;
    }

    // Step 4: Run underwriting
    console.log("Step 4: Running underwriting analysis...");
    const decision = await client.runUnderwriting(userId);

    // Display results
    if (decision.approved) {
      console.log(
        `Approved! Credit Limit: $${decision.credit_limit}, APR: ${decision.apr}%`
      );
    } else {
      console.log("Application declined");
      console.log("Reasons:", decision.reasons);
    }
  } catch (error) {
    console.error("Onboarding error:", error);
  }
}
```

---

## Testing

### Health Check

```bash
curl http://localhost:8000/api/health
```

### Complete Flow Test

```bash
# 1. Submit personal data
curl -X POST http://localhost:8000/api/underwrite/personal-data \
  -H "Content-Type: application/json" \
  -d '{
    "personal_data": {
      "user_id": "test_user",
      "full_name": "Test User",
      "address": "123 Test St, Test City, TS 12345",
      "country": "US",
      "employment_status": "full_time",
      "monthly_income": 5000,
      "tenure_months": 24
    }
  }'

# 2. Upload transactions (CSV)
curl -X POST http://localhost:8000/api/underwrite/transactions/csv \
  -F "user_id=test_user" \
  -F "file=@data/underwriting/sample_transactions.csv"

# 3. Run analysis
curl -X POST http://localhost:8000/api/underwrite/analyze \
  -H "Content-Type": application/json" \
  -d '{"user_id": "test_user", "jurisdiction": "US"}'
```

---

## Production Deployment Notes

### Environment Variables Required

```bash
# .env.local
OPENSANCTIONS_API_KEY=your_opensanctions_key
REALITY_DEFENDER_API_KEY=your_reality_defender_key
OPENAI_API_KEY=your_openai_key  # Optional, for explanations
```

### Database

- SQLite (development): `finshield_underwriting.db`
- PostgreSQL (production): Configure via `DATABASE_URL`

### CORS

Update CORS origins in `main.py` for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting

Consider adding rate limiting for production:

- Liveness checks: 5 per user per hour
- Underwriting analysis: 1 per user per day

---

## Support

**Documentation**: [Full Docs](./IMPLEMENTATION_SUMMARY.md)
**Issues**: Report bugs in GitHub issues
**Web Interface**: http://localhost:8000/test (for liveness testing)

---

**Last Updated**: October 25, 2025
**API Version**: 1.0.0
**Status**: Production Ready ✅
