# Frontend Integration Guide - Durin

This guide shows you **exactly** how to connect your frontend to the FinShield backend API.

---

## 1. Pre-Merge Setup

### Backend Setup (One Time)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create environment file
# Copy .env.example to .env.local and add API keys
cp .env.example .env.local

# Edit .env.local with your keys:
# OPENSANCTIONS_API_KEY=5c0e476942350bccb869e50b8e3a2479
# REALITY_DEFENDER_API_KEY=rd_b96549396a496950_37f5b891dac8c82eec491914e0106ff0
```

### Start Backend Server

```bash
# From backend directory
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: **http://localhost:8000**

---

## 2. Frontend Configuration

### Option A: React/Next.js/Vue

Create an API client file:

**`frontend/src/services/finshield-api.js`**

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

class FinShieldAPI {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request("/api/health");
  }

  // Step 1: Submit personal data
  async submitPersonalData(userData) {
    return this.request("/api/underwrite/personal-data", {
      method: "POST",
      body: JSON.stringify({
        personal_data: {
          user_id: userData.userId,
          full_name: userData.fullName,
          address: userData.address,
          country: userData.country,
          employment_status: userData.employmentStatus,
          monthly_income: parseFloat(userData.monthlyIncome),
          tenure_months: parseInt(userData.tenureMonths),
        },
      }),
    });
  }

  // Step 2: Upload transactions (CSV file)
  async uploadTransactionsCSV(userId, csvFile) {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", csvFile);

    const url = `${this.baseURL}/api/underwrite/transactions/csv`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      // Don't set Content-Type - browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to upload transactions");
    }

    return await response.json();
  }

  // Step 2 Alternative: Upload transactions (JSON)
  async uploadTransactionsJSON(userId, transactions) {
    return this.request("/api/underwrite/transactions", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        transactions: transactions,
      }),
    });
  }

  // Step 3: Liveness check (selfie + deepfake detection)
  async submitLivenessCheck(userId, imageDataURL, deviceFingerprint) {
    return this.request("/api/underwrite/liveness", {
      method: "POST",
      body: JSON.stringify({
        liveness_check: {
          user_id: userId,
          image_data: imageDataURL,
          device_fingerprint: deviceFingerprint || navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  }

  // Step 4: Run underwriting analysis
  async runUnderwriting(userId, jurisdiction = "US") {
    return this.request("/api/underwrite/analyze", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        jurisdiction: jurisdiction,
      }),
    });
  }

  // Get decision
  async getDecision(userId) {
    return this.request(`/api/underwrite/decision/${userId}`);
  }

  // Check status
  async getStatus(userId) {
    return this.request(`/api/underwrite/status/${userId}`);
  }

  // Delete user (GDPR)
  async deleteUser(userId) {
    return this.request(`/api/underwrite/user/${userId}`, {
      method: "DELETE",
    });
  }
}

export default new FinShieldAPI();
```

---

## 3. React Component Examples

### Personal Data Form

**`frontend/src/components/PersonalDataForm.jsx`**

```jsx
import React, { useState } from "react";
import finshieldAPI from "../services/finshield-api";

export default function PersonalDataForm({ onComplete, userId }) {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    country: "US",
    employmentStatus: "full_time",
    monthlyIncome: "",
    tenureMonths: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await finshieldAPI.submitPersonalData({
        userId,
        ...formData,
      });

      console.log("Personal data submitted:", result);
      onComplete(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Personal Information</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        required
        minLength={2}
      />

      <input
        type="text"
        placeholder="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        required
        minLength={10}
      />

      <select
        value={formData.employmentStatus}
        onChange={(e) =>
          setFormData({ ...formData, employmentStatus: e.target.value })
        }
      >
        <option value="full_time">Full Time</option>
        <option value="part_time">Part Time</option>
        <option value="self_employed">Self Employed</option>
        <option value="unemployed">Unemployed</option>
        <option value="retired">Retired</option>
      </select>

      <input
        type="number"
        placeholder="Monthly Income"
        value={formData.monthlyIncome}
        onChange={(e) =>
          setFormData({ ...formData, monthlyIncome: e.target.value })
        }
        required
        min="0"
      />

      <input
        type="number"
        placeholder="Months at Current Job"
        value={formData.tenureMonths}
        onChange={(e) =>
          setFormData({ ...formData, tenureMonths: e.target.value })
        }
        required
        min="0"
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Next Step"}
      </button>
    </form>
  );
}
```

---

### CSV Transaction Uploader

**`frontend/src/components/TransactionUploader.jsx`**

```jsx
import React, { useState } from "react";
import finshieldAPI from "../services/finshield-api";

export default function TransactionUploader({ onComplete, userId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await finshieldAPI.uploadTransactionsCSV(userId, file);
      console.log("Transactions uploaded:", result);
      onComplete(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Bank Transactions</h2>

      <input type="file" accept=".csv" onChange={handleFileChange} />

      {file && <p>Selected: {file.name}</p>}

      {error && <div className="error">{error}</div>}

      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? "Uploading..." : "Upload Transactions"}
      </button>

      <div className="help">
        <p>
          CSV Format: txn_id, account_id, timestamp, amount, currency, merchant,
          transaction_type, mcc
        </p>
        <a href="/sample_transactions.csv" download>
          Download Sample CSV
        </a>
      </div>
    </div>
  );
}
```

---

### Webcam Liveness Check

**`frontend/src/components/LivenessCheck.jsx`**

```jsx
import React, { useState, useRef, useEffect } from "react";
import finshieldAPI from "../services/finshield-api";

export default function LivenessCheck({ onComplete, userId }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      setError("Camera access denied. Please allow camera access.");
    }
  };

  const capturePhoto = async () => {
    if (!stream) {
      setError("Please start camera first");
      return;
    }

    // Capture image from video
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    // Convert to base64
    const imageDataURL = canvas.toDataURL("image/jpeg", 0.95);

    setLoading(true);
    setError(null);

    try {
      // This will take 10-20 seconds (Reality Defender API)
      const livenessResult = await finshieldAPI.submitLivenessCheck(
        userId,
        imageDataURL,
        navigator.userAgent
      );

      setResult(livenessResult);

      // Check if passed
      if (livenessResult.liveness_pass) {
        onComplete(livenessResult);
      } else {
        setError(`Liveness check failed: ${livenessResult.flags.join(", ")}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Identity Verification</h2>

      <video
        ref={videoRef}
        autoPlay
        style={{ width: "100%", maxWidth: "640px" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="controls">
        <button onClick={startCamera} disabled={stream}>
          Start Camera
        </button>
        <button onClick={capturePhoto} disabled={!stream || loading}>
          {loading ? "Analyzing (10-20s)..." : "Capture Photo"}
        </button>
      </div>

      {loading && (
        <div className="loading">
          <p>Analyzing your photo with Reality Defender...</p>
          <p>This may take 10-20 seconds</p>
        </div>
      )}

      {result && (
        <div className="result">
          <h3>Liveness Results</h3>
          <p>Score: {(result.liveness_score * 100).toFixed(1)}%</p>
          <p>Status: {result.liveness_pass ? "✅ Passed" : "❌ Failed"}</p>
          {result.flags.length > 0 && <p>Flags: {result.flags.join(", ")}</p>}
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

---

### Final Decision Display

**`frontend/src/components/DecisionResults.jsx`**

```jsx
import React, { useState, useEffect } from "react";
import finshieldAPI from "../services/finshield-api";

export default function DecisionResults({ userId }) {
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    runUnderwriting();
  }, [userId]);

  const runUnderwriting = async () => {
    try {
      // Run analysis
      const result = await finshieldAPI.runUnderwriting(userId);
      setDecision(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Analyzing your application...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="decision-results">
      {decision.approved ? (
        <div className="approved">
          <h2>🎉 Congratulations! You're Approved!</h2>
          <div className="offer">
            <p>
              <strong>Credit Limit:</strong> $
              {decision.credit_limit.toLocaleString()}
            </p>
            <p>
              <strong>APR:</strong> {decision.apr}%
            </p>
          </div>
        </div>
      ) : (
        <div className="declined">
          <h2>Application Decision</h2>
          <p>We're unable to approve your application at this time.</p>
        </div>
      )}

      <div className="details">
        <h3>Risk Assessment</h3>
        <p>
          <strong>Default Probability:</strong>{" "}
          {(decision.pd_12m * 100).toFixed(2)}%
        </p>

        {decision.reasons && decision.reasons.length > 0 && (
          <div className="risk-factors">
            <h4>Key Factors</h4>
            <ul>
              {decision.reasons.slice(0, 5).map((reason, i) => (
                <li key={i}>
                  <strong>{reason.code}:</strong> {reason.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {decision.counterfactuals && decision.counterfactuals.length > 0 && (
          <div className="improvements">
            <h4>Ways to Improve</h4>
            <ul>
              {decision.counterfactuals.map((cf, i) => (
                <li key={i}>{cf.action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 4. Complete Flow Component

**`frontend/src/components/UnderwritingFlow.jsx`**

```jsx
import React, { useState } from "react";
import PersonalDataForm from "./PersonalDataForm";
import TransactionUploader from "./TransactionUploader";
import LivenessCheck from "./LivenessCheck";
import DecisionResults from "./DecisionResults";

export default function UnderwritingFlow() {
  const [step, setStep] = useState(1);
  const [userId] = useState(() => `user_${Date.now()}`);

  return (
    <div className="underwriting-flow">
      <div className="progress">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          1. Personal Info
        </div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          2. Transactions
        </div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>
          3. Verify Identity
        </div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>4. Results</div>
      </div>

      {step === 1 && (
        <PersonalDataForm userId={userId} onComplete={() => setStep(2)} />
      )}

      {step === 2 && (
        <TransactionUploader userId={userId} onComplete={() => setStep(3)} />
      )}

      {step === 3 && (
        <LivenessCheck userId={userId} onComplete={() => setStep(4)} />
      )}

      {step === 4 && <DecisionResults userId={userId} />}
    </div>
  );
}
```

---

## 5. Environment Configuration

### Development

**`.env.development`**

```bash
REACT_APP_API_URL=http://localhost:8000
```

### Production

**`.env.production`**

```bash
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## 6. CORS Configuration

The backend already has CORS enabled for all origins in development. For production, update `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 7. Running Everything Together

### Terminal 1: Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Frontend (React)

```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### Terminal 3: Frontend (Next.js)

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

## 8. Testing the Integration

### Quick Test

```javascript
import finshieldAPI from "./services/finshield-api";

// Test connection
finshieldAPI
  .healthCheck()
  .then((data) => console.log("API Connected:", data))
  .catch((err) => console.error("API Error:", err));
```

---

## 9. Error Handling

### Common Errors

**CORS Error**:

```
Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: CORS is already enabled. Make sure backend is running.

**Connection Refused**:

```
Failed to fetch
```

**Solution**: Backend server is not running. Start it with `uvicorn app.main:app`

**422 Validation Error**:

```json
{
  "detail": [
    {
      "loc": ["body", "personal_data", "monthly_income"],
      "msg": "ensure this value is greater than 0"
    }
  ]
}
```

**Solution**: Check your form data matches the API requirements.

---

## 10. Deployment

### Backend (Render/Railway/Fly.io)

```bash
# Add to backend/Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify)

Update API URL to your deployed backend:

```bash
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## Next Steps

1. ✅ Copy `finshield-api.js` to your frontend
2. ✅ Use the React components as templates
3. ✅ Start backend server
4. ✅ Test API connection
5. ✅ Build your UI around these components

**You're ready to integrate!** 🚀

Need help? Check:

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [API_READY.md](./API_READY.md) - Quick start guide
- [backend/static/test_liveness.html](./backend/static/test_liveness.html) - Working webcam example
