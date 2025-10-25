"""
FinShield AI - FastAPI Backend
Fraud detection API with graph analysis and LLM explanations.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import pandas as pd
import io
import json
from datetime import datetime

from app.graph_analyzer import FraudGraphAnalyzer
from app.llm_service import LLMExplainer
from app.cashflow_analyzer import CashflowAnalyzer
from app.liveness_checker import LivenessChecker
from app.underwriting_scorer import UnderwritingScorer
from app.models import (
    BankTransaction, PersonalData, LivenessCheck,
    TransactionUploadRequest, PersonalDataSubmission,
    LivenessCheckRequest, AnalyzeRequest, UnderwritingDecision
)

app = FastAPI(
    title="FinShield AI API",
    description="AI-powered fraud detection and network analysis",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state (use database in production)
analyzer = FraudGraphAnalyzer()
llm_explainer = None
analysis_results = None
explanations_cache = {}

# Underwriting system state
cashflow_analyzer = CashflowAnalyzer()
liveness_checker = LivenessChecker()
underwriting_scorer = UnderwritingScorer()

# In-memory storage for underwriting data (use database in production)
user_transactions = {}  # user_id -> List[BankTransaction]
user_personal_data = {}  # user_id -> PersonalData
user_liveness_results = {}  # user_id -> LivenessResult
user_decisions = {}  # user_id -> UnderwritingDecision


# Pydantic models
class AnalysisResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict] = None


class ExplainRequest(BaseModel):
    account_id: str


class ExplainResponse(BaseModel):
    success: bool
    account_id: str
    explanation: str
    risk_score: float


@app.on_event("startup")
async def startup_event():
    """Initialize LLM service on startup."""
    global llm_explainer
    try:
        llm_explainer = LLMExplainer()
        print("✓ LLM service initialized")
    except Exception as e:
        print(f"⚠ LLM service initialization failed: {e}")
        print("  Fallback explanations will be used")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "FinShield AI",
        "status": "operational",
        "version": "1.0.0",
        "llm_available": llm_explainer is not None
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_data(
    users_file: UploadFile = File(...),
    transactions_file: UploadFile = File(...)
):
    """
    Analyze uploaded KYC and transaction data.
    
    Expected CSV formats:
    - users.csv: user_id, device_id, ip, country
    - transactions.csv: from, to, amount, timestamp, device_id, ip
    """
    global analysis_results, explanations_cache
    
    try:
        # Read uploaded files
        users_content = await users_file.read()
        transactions_content = await transactions_file.read()
        
        # Parse CSVs
        users_df = pd.read_csv(io.StringIO(users_content.decode('utf-8')))
        transactions_df = pd.read_csv(io.StringIO(transactions_content.decode('utf-8')))
        
        # Validate required columns
        required_user_cols = ['user_id']
        required_txn_cols = ['from', 'to', 'amount', 'timestamp']
        
        if not all(col in users_df.columns for col in required_user_cols):
            raise HTTPException(
                status_code=400,
                detail=f"Users CSV must contain columns: {required_user_cols}"
            )
        
        if not all(col in transactions_df.columns for col in required_txn_cols):
            raise HTTPException(
                status_code=400,
                detail=f"Transactions CSV must contain columns: {required_txn_cols}"
            )
        
        # Run graph analysis
        results = analyzer.build_graph(users_df, transactions_df)
        analysis_results = results
        explanations_cache.clear()
        
        # Generate explanations for high-risk accounts
        if llm_explainer and results['high_risk_accounts']:
            high_risk_ids = [acc['id'] for acc in results['high_risk_accounts'][:5]]  # Top 5
            
            for account_id in high_risk_ids:
                context = analyzer.get_account_context(account_id)
                try:
                    explanation = llm_explainer.generate_explanation(context)
                    explanations_cache[account_id] = explanation
                except Exception as e:
                    print(f"Error generating explanation for {account_id}: {e}")
        
        return AnalysisResponse(
            success=True,
            message=f"Analysis complete. Found {results['summary']['high_risk_count']} high-risk accounts.",
            data=results
        )
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Uploaded files are empty")
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/explain", response_model=ExplainResponse)
async def explain_account(request: ExplainRequest):
    """
    Generate AI explanation for a specific account's risk score.
    """
    account_id = request.account_id
    
    # Check if we have analysis results
    if not analysis_results:
        raise HTTPException(
            status_code=400,
            detail="No analysis results available. Please run analysis first."
        )
    
    # Check cache first
    if account_id in explanations_cache:
        # Find risk score
        risk_score = 0.0
        for node in analysis_results['nodes']:
            if node['id'] == account_id:
                risk_score = node['risk_score']
                break
        
        return ExplainResponse(
            success=True,
            account_id=account_id,
            explanation=explanations_cache[account_id],
            risk_score=risk_score
        )
    
    # Generate new explanation
    context = analyzer.get_account_context(account_id)
    
    if not context:
        raise HTTPException(
            status_code=404,
            detail=f"Account {account_id} not found in analysis results"
        )
    
    try:
        if llm_explainer:
            explanation = llm_explainer.generate_explanation(context)
        else:
            explanation = llm_explainer._generate_fallback_explanation(context) if llm_explainer else "LLM service unavailable"
        
        explanations_cache[account_id] = explanation
        
        return ExplainResponse(
            success=True,
            account_id=account_id,
            explanation=explanation,
            risk_score=context['risk_score']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        )


@app.get("/api/results")
async def get_results():
    """
    Retrieve the most recent analysis results.
    """
    if not analysis_results:
        return {
            "success": False,
            "message": "No analysis results available"
        }
    
    return {
        "success": True,
        "data": analysis_results,
        "explanations": explanations_cache
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "graph_analyzer": True,
            "llm_service": llm_explainer is not None,
            "underwriting_system": True
        },
        "analysis_loaded": analysis_results is not None
    }


# ============================================================================
# UNDERWRITING ENDPOINTS
# ============================================================================

@app.post("/api/underwrite/transactions")
async def upload_transactions(request: TransactionUploadRequest):
    """
    Upload bank transaction history for a user.
    
    Stores transactions in memory for later analysis.
    """
    try:
        user_id = request.user_id
        transactions = request.transactions
        
        if not transactions:
            raise HTTPException(
                status_code=400,
                detail="Transaction list cannot be empty"
            )
        
        # Store transactions
        user_transactions[user_id] = transactions
        
        return {
            "success": True,
            "message": f"Stored {len(transactions)} transactions for user {user_id}",
            "user_id": user_id,
            "transaction_count": len(transactions),
            "date_range": {
                "start": min(t.timestamp for t in transactions).isoformat(),
                "end": max(t.timestamp for t in transactions).isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store transactions: {str(e)}"
        )


@app.post("/api/underwrite/transactions/csv")
async def upload_transactions_csv(
    user_id: str,
    file: UploadFile = File(...)
):
    """
    Upload bank transactions as CSV file.
    
    Expected columns: txn_id, account_id, timestamp, amount, currency, 
                     merchant, counterparty, transaction_type, mcc
    """
    try:
        # Read CSV
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Validate required columns
        required_cols = ['txn_id', 'account_id', 'timestamp', 'amount', 'transaction_type']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_cols}"
            )
        
        # Parse transactions
        transactions = []
        for _, row in df.iterrows():
            txn = BankTransaction(
                txn_id=str(row['txn_id']),
                account_id=str(row['account_id']),
                timestamp=pd.to_datetime(row['timestamp']),
                amount=float(row['amount']),
                currency=str(row.get('currency', 'USD')),
                merchant=str(row.get('merchant', '')) if pd.notna(row.get('merchant')) else None,
                counterparty=str(row.get('counterparty', '')) if pd.notna(row.get('counterparty')) else None,
                transaction_type=str(row['transaction_type']),
                mcc=str(row.get('mcc', '')) if pd.notna(row.get('mcc')) else None
            )
            transactions.append(txn)
        
        # Store transactions
        user_transactions[user_id] = transactions
        
        return {
            "success": True,
            "message": f"Parsed and stored {len(transactions)} transactions",
            "user_id": user_id,
            "transaction_count": len(transactions)
        }
        
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")


@app.post("/api/underwrite/personal-data")
async def submit_personal_data(request: PersonalDataSubmission):
    """
    Submit personal and employment information.
    
    Validates and stores data for underwriting analysis.
    """
    try:
        personal_data = request.personal_data
        user_id = personal_data.user_id
        
        # Store personal data
        user_personal_data[user_id] = personal_data
        
        return {
            "success": True,
            "message": f"Personal data stored for user {user_id}",
            "user_id": user_id,
            "employment_status": personal_data.employment_status,
            "country": personal_data.country
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store personal data: {str(e)}"
        )


@app.post("/api/underwrite/liveness")
async def check_liveness(request: LivenessCheckRequest):
    """
    Perform facial liveness verification.
    
    Checks for:
    - Image validity
    - Liveness score
    - Replay detection
    - Sanctions screening
    - Device risk
    """
    try:
        liveness_check = request.liveness_check
        user_id = liveness_check.user_id
        
        # Perform liveness check
        result = liveness_checker.verify_liveness(liveness_check)
        
        # Store result
        user_liveness_results[user_id] = result
        
        return {
            "success": True,
            "user_id": user_id,
            "liveness_pass": result.liveness_pass,
            "liveness_score": result.liveness_score,
            "replay_detected": result.replay_detected,
            "sanctions_pass": result.sanctions_pass,
            "device_risk_score": result.device_risk_score,
            "flags": result.flags
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Liveness check failed: {str(e)}"
        )


@app.post("/api/underwrite/analyze")
async def analyze_underwriting(request: AnalyzeRequest):
    """
    Run full underwriting analysis for a user.
    
    Combines:
    1. Transaction history → Cashflow metrics
    2. Personal data
    3. Liveness verification
    
    Returns:
    - PD score (probability of default)
    - Credit limit
    - APR
    - Risk reasons
    - Counterfactual improvements
    """
    try:
        user_id = request.user_id
        jurisdiction = request.jurisdiction
        
        # Validate all data is present
        if user_id not in user_transactions:
            raise HTTPException(
                status_code=400,
                detail=f"No transaction data found for user {user_id}. Upload transactions first."
            )
        
        if user_id not in user_personal_data:
            raise HTTPException(
                status_code=400,
                detail=f"No personal data found for user {user_id}. Submit personal data first."
            )
        
        if user_id not in user_liveness_results:
            raise HTTPException(
                status_code=400,
                detail=f"No liveness check found for user {user_id}. Perform liveness check first."
            )
        
        # Get stored data
        transactions = user_transactions[user_id]
        personal_data = user_personal_data[user_id]
        liveness_result = user_liveness_results[user_id]
        
        # Run cashflow analysis
        cashflow_metrics = cashflow_analyzer.analyze(transactions)
        
        # Run underwriting scoring
        decision = underwriting_scorer.score(
            user_id=user_id,
            personal_data=personal_data,
            cashflow_metrics=cashflow_metrics,
            liveness_result=liveness_result,
            jurisdiction=jurisdiction
        )
        
        # Store decision
        user_decisions[user_id] = decision
        
        return {
            "success": True,
            "message": "Underwriting analysis complete",
            "decision": decision.dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.get("/api/underwrite/decision/{user_id}")
async def get_decision(user_id: str):
    """
    Retrieve stored underwriting decision for a user.
    """
    if user_id not in user_decisions:
        raise HTTPException(
            status_code=404,
            detail=f"No decision found for user {user_id}"
        )
    
    decision = user_decisions[user_id]
    
    return {
        "success": True,
        "decision": decision.dict()
    }


@app.get("/api/underwrite/status/{user_id}")
async def get_underwriting_status(user_id: str):
    """
    Check which underwriting steps have been completed for a user.
    """
    return {
        "user_id": user_id,
        "transactions_uploaded": user_id in user_transactions,
        "personal_data_submitted": user_id in user_personal_data,
        "liveness_checked": user_id in user_liveness_results,
        "decision_made": user_id in user_decisions,
        "ready_for_analysis": (
            user_id in user_transactions and
            user_id in user_personal_data and
            user_id in user_liveness_results
        )
    }


@app.delete("/api/underwrite/user/{user_id}")
async def clear_user_data(user_id: str):
    """
    Clear all stored data for a user (for testing/demo).
    """
    removed = {
        "transactions": user_id in user_transactions,
        "personal_data": user_id in user_personal_data,
        "liveness_result": user_id in user_liveness_results,
        "decision": user_id in user_decisions
    }
    
    user_transactions.pop(user_id, None)
    user_personal_data.pop(user_id, None)
    user_liveness_results.pop(user_id, None)
    user_decisions.pop(user_id, None)
    
    return {
        "success": True,
        "message": f"Cleared all data for user {user_id}",
        "removed": removed
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
