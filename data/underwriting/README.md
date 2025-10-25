# Underwriting Sample Data

This directory contains sample data for testing the underwriting system.

## Files

### 1. `bank_transactions_user1.csv`
**Profile:** Sarah Johnson - Stable full-time employee

**Characteristics:**
- Regular monthly income: $2,800/month from salary
- Consistent spending patterns
- Low risk profile
- Good payment history
- Expected outcome: **APPROVED** with higher credit limit (~$2,000)

### 2. `bank_transactions_user2.csv`
**Profile:** Marcus Chen - Gig economy worker

**Characteristics:**
- Irregular income from gig apps
- Multiple NSF/overdraft fees (3 events)
- Late payment fees detected
- Payday loan payments (high payment burden)
- Higher risk profile
- Expected outcome: **APPROVED** but with lower limit (~$800) or **DECLINED** depending on thresholds

### 3. `personal_data.json`
Contains employment and personal information for both users.

**Fields:**
- `user_id`: Unique identifier
- `full_name`: Legal name
- `address`: Current residential address
- `country`: Country of residence (US/UK)
- `employment_status`: full_time, part_time, self_employed, etc.
- `monthly_income`: Stated monthly income
- `tenure_months`: Months at current employment
- `email_hash`: SHA256 hash of email (for privacy)
- `phone_hash`: SHA256 hash of phone (for privacy)

## Data Formats

### Bank Transactions CSV

```csv
txn_id,account_id,timestamp,amount,currency,merchant,counterparty,transaction_type,mcc
```

**Field descriptions:**
- `txn_id`: Unique transaction identifier
- `account_id`: User's account identifier
- `timestamp`: ISO 8601 timestamp
- `amount`: Transaction amount (positive = income, negative = expense)
- `currency`: Currency code (USD, GBP, etc.)
- `merchant`: Merchant name (optional)
- `counterparty`: Counterparty account (optional)
- `transaction_type`: income, expense, transfer, or fee
- `mcc`: Merchant Category Code (optional)

### Transaction Types

- **income**: Salary, gig payments, deposits
- **expense**: Purchases, bills, rent, payments
- **transfer**: Account transfers
- **fee**: Bank fees, late fees, NSF charges

### MCC Codes (Merchant Category Codes)

- `5411`, `5412`, `5422`: Grocery stores
- `5541`, `5542`, `5983`: Gas stations, fuel
- `5912`, `5976`: Pharmacy, medical
- `4814`, `4816`, `4899`: Telecom, utilities
- `6300`, `6513`: Insurance
- `5812`, `5814`: Restaurants

## Testing the API

### Step 1: Upload Transactions

```bash
# User 1 (Good profile)
curl -X POST "http://localhost:8000/api/underwrite/transactions/csv?user_id=user_001" \
  -F "file=@data/underwriting/bank_transactions_user1.csv"

# User 2 (Risky profile)
curl -X POST "http://localhost:8000/api/underwrite/transactions/csv?user_id=user_002" \
  -F "file=@data/underwriting/bank_transactions_user2.csv"
```

### Step 2: Submit Personal Data

```bash
curl -X POST "http://localhost:8000/api/underwrite/personal-data" \
  -H "Content-Type: application/json" \
  -d '{
    "personal_data": {
      "user_id": "user_001",
      "full_name": "Sarah Johnson",
      "address": "1234 Maple Street, Apt 5B, Austin, TX 78701",
      "country": "US",
      "employment_status": "full_time",
      "monthly_income": 2800.00,
      "tenure_months": 18
    }
  }'
```

### Step 3: Perform Liveness Check

```bash
# Create a test image (base64 encoded dummy data)
TEST_IMAGE=$(echo "fake_image_data_for_demo_purposes_only" | base64)

curl -X POST "http://localhost:8000/api/underwrite/liveness" \
  -H "Content-Type: application/json" \
  -d "{
    \"liveness_check\": {
      \"user_id\": \"user_001\",
      \"image_data\": \"$TEST_IMAGE\",
      \"device_fingerprint\": \"device_abc123\"
    }
  }"
```

### Step 4: Run Underwriting Analysis

```bash
curl -X POST "http://localhost:8000/api/underwrite/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "jurisdiction": "US"
  }'
```

### Step 5: Retrieve Decision

```bash
curl "http://localhost:8000/api/underwrite/decision/user_001"
```

## Expected Results

### User 001 (Sarah Johnson) - Good Profile
```json
{
  "approved": true,
  "pd_12m": 0.055,
  "credit_limit": 2000,
  "apr": 17.5,
  "reasons": [
    "Stable income pattern detected",
    "Healthy cash buffer of 25+ days",
    "Low payment burden"
  ]
}
```

### User 002 (Marcus Chen) - Risky Profile
```json
{
  "approved": true,
  "pd_12m": 0.098,
  "credit_limit": 800,
  "apr": 21.8,
  "reasons": [
    "3 NSF/overdraft events in last 90 days",
    "Irregular income pattern (high CV)",
    "High payment burden from payday loans",
    "Insufficient cash buffer"
  ],
  "counterfactuals": [
    "Eliminate NSF events → PD reduces by 1.5%",
    "Increase cash buffer to 20 days → PD reduces by 1.5%",
    "Reduce payment burden to 30% → PD reduces by 2.0%"
  ]
}
```

## Notes

- All data is synthetic and for demonstration purposes only
- Never use real PII (Personally Identifiable Information) in test data
- Transaction dates span ~90 days for meaningful cashflow analysis
- User 1 demonstrates an "approve with good terms" case
- User 2 demonstrates an "approve with caution" or "decline" case depending on risk appetite

## Risk Signals Demonstrated

### User 1 (Low Risk)
- ✅ Regular salary deposits
- ✅ Consistent spending
- ✅ No NSF/overdraft events
- ✅ Low payment burden
- ✅ Essential spending focus

### User 2 (Higher Risk)
- ⚠️ Irregular gig income
- ⚠️ Multiple NSF fees
- ⚠️ Late payment fees
- ⚠️ Payday loan payments (high burden)
- ⚠️ Lower cash buffer

