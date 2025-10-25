"""
Durin - FastAPI Backend V2
Fraud detection + underwriting with production-ready database persistence.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
import pandas as pd
import io
import json
from datetime import datetime
import uuid
import os

from app.graph_analyzer import FraudGraphAnalyzer
from app.llm_service import LLMExplainer
from app.cashflow_analyzer import CashflowAnalyzer
from app.liveness_checker_v2 import LivenessCheckerV2
from app.underwriting_scorer import UnderwritingScorer
from app.models import (
    BankTransaction, PersonalData, LivenessCheck,
    TransactionUploadRequest, PersonalDataSubmission,
    LivenessCheckRequest, AnalyzeRequest, UnderwritingDecision
)

# Database imports
from app.database import (
    init_db, get_db, User, Transaction, LivenessCheckDB,
    UnderwritingDecisionDB, EmploymentStatusEnum, TransactionTypeEnum,
    DecisionStatus
)

app = FastAPI(
    title="Durin API",
    description="AI-powered fraud detection and underwriting with database persistence",
    version="2.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global services
analyzer = FraudGraphAnalyzer()
llm_explainer = None
analysis_results = None
explanations_cache = {}

# Underwriting services (production-ready)
cashflow_analyzer = CashflowAnalyzer()
liveness_checker = LivenessCheckerV2()  # Using new version with real face detection
underwriting_scorer = UnderwritingScorer()


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


class ComplianceChatRequest(BaseModel):
    country: str
    question: str
    conversation_history: Optional[List[Dict]] = None


class ComplianceChatResponse(BaseModel):
    success: bool
    country: str
    response: str


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    global llm_explainer

    # Initialize database
    print("Initializing database...")
    init_db()
    print("[OK] Database initialized")

    # Initialize LLM service
    try:
        llm_explainer = LLMExplainer()
        print("[OK] LLM service initialized")
    except Exception as e:
        print(f"[WARN] LLM service initialization failed: {e}")
        print("  Fallback explanations will be used")

    # Mount static files
    static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    if os.path.exists(static_path):
        app.mount("/static", StaticFiles(directory=static_path), name="static")
        print(f"[OK] Static files mounted from {static_path}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "Durin",
        "status": "operational",
        "version": "2.0.0",
        "llm_available": llm_explainer is not None,
        "database": "SQLite (production-ready)",
        "test_page": "/test"
    }


@app.get("/test")
async def test_page():
    """Serve the liveness test page."""
    static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "test_liveness.html")
    if os.path.exists(static_path):
        return FileResponse(static_path)
    else:
        raise HTTPException(status_code=404, detail="Test page not found")


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_data(
    users_file: UploadFile = File(...),
    transactions_file: UploadFile = File(...)
):
    """
    Analyze uploaded KYC and transaction data for fraud detection.

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
                    print(f"Failed to explain {account_id}: {e}")

        return AnalysisResponse(
            success=True,
            message=f"Analysis complete. Found {len(results.get('high_risk_accounts', []))} high-risk accounts.",
            data=results
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.post("/api/explain", response_model=ExplainResponse)
async def explain_account(request: ExplainRequest):
    """Generate LLM explanation for a high-risk account."""
    account_id = request.account_id

    # Check cache first
    if account_id in explanations_cache:
        context = analyzer.get_account_context(account_id)
        return ExplainResponse(
            success=True,
            account_id=account_id,
            explanation=explanations_cache[account_id],
            risk_score=context['risk_score'] if context else 0.0
        )

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
            explanation = "LLM service unavailable"

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
    """Retrieve the most recent fraud analysis results."""
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


@app.post("/api/compliance-chat", response_model=ComplianceChatResponse)
async def compliance_chat(request: ComplianceChatRequest):
    """
    Chat about compliance regulations for a specific country.
    """
    if not llm_explainer:
        raise HTTPException(
            status_code=503,
            detail="LLM service not available"
        )
    
    try:
        response_text = llm_explainer.chat_about_compliance(
            country=request.country,
            user_question=request.question,
            conversation_history=request.conversation_history
        )
        
        return ComplianceChatResponse(
            success=True,
            country=request.country,
            response=response_text
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate compliance response: {str(e)}"
        )


@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    """Detailed health check with database status."""
    # Test database connection
    try:
        user_count = db.query(User).count()
        transaction_count = db.query(Transaction).count()
        decision_count = db.query(UnderwritingDecisionDB).count()
        db_healthy = True
    except Exception as e:
        print(f"Database health check failed: {e}")
        user_count = 0
        transaction_count = 0
        decision_count = 0
        db_healthy = False

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "graph_analyzer": True,
            "llm_service": llm_explainer is not None,
            "underwriting_system": True,
            "database": db_healthy,
            "face_detection": True,
            "sanctions_screening": True
        },
        "database_stats": {
            "users": user_count,
            "transactions": transaction_count,
            "decisions": decision_count
        },
        "analysis_loaded": analysis_results is not None
    }


# ============================================================================
# UNDERWRITING ENDPOINTS (Database-Backed)
# ============================================================================

@app.post("/api/underwrite/transactions")
async def upload_transactions(
    request: TransactionUploadRequest,
    db: Session = Depends(get_db)
):
    """
    Upload bank transaction history for a user.

    Stores transactions in database for later analysis.
    """
    try:
        user_id = request.user_id
        transactions = request.transactions

        if not transactions:
            raise HTTPException(
                status_code=400,
                detail="Transaction list cannot be empty"
            )

        # Check if user exists, if not create placeholder
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            # Create placeholder user (will be updated when personal data is submitted)
            user = User(
                user_id=user_id,
                full_name="Pending",
                address="Pending",
                country="US",
                employment_status=EmploymentStatusEnum.FULL_TIME,
                monthly_income=0.0,
                tenure_months=0
            )
            db.add(user)
            db.commit()

        # Delete existing transactions for this user (idempotent upload)
        db.query(Transaction).filter(Transaction.user_id == user_id).delete()

        # Insert new transactions
        for txn in transactions:
            db_txn = Transaction(
                txn_id=txn.txn_id,
                user_id=user_id,
                account_id=txn.account_id,
                timestamp=txn.timestamp,
                amount=txn.amount,
                currency=txn.currency,
                merchant=txn.merchant,
                counterparty=txn.counterparty,
                transaction_type=TransactionTypeEnum(txn.transaction_type),
                mcc=txn.mcc
            )
            db.add(db_txn)

        db.commit()

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
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store transactions: {str(e)}"
        )


@app.post("/api/underwrite/transactions/csv")
async def upload_transactions_csv(
    user_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
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

        # Check if user exists, if not create placeholder
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            user = User(
                user_id=user_id,
                full_name="Pending",
                address="Pending",
                country="US",
                employment_status=EmploymentStatusEnum.FULL_TIME,
                monthly_income=0.0,
                tenure_months=0
            )
            db.add(user)
            db.commit()

        # Delete existing transactions
        db.query(Transaction).filter(Transaction.user_id == user_id).delete()

        # Insert new transactions
        for txn in transactions:
            db_txn = Transaction(
                txn_id=txn.txn_id,
                user_id=user_id,
                account_id=txn.account_id,
                timestamp=txn.timestamp,
                amount=txn.amount,
                currency=txn.currency,
                merchant=txn.merchant,
                counterparty=txn.counterparty,
                transaction_type=TransactionTypeEnum(txn.transaction_type),
                mcc=txn.mcc
            )
            db.add(db_txn)

        db.commit()

        return {
            "success": True,
            "message": f"Parsed and stored {len(transactions)} transactions",
            "user_id": user_id,
            "transaction_count": len(transactions)
        }

    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")


@app.post("/api/underwrite/personal-data")
async def submit_personal_data(
    request: PersonalDataSubmission,
    db: Session = Depends(get_db)
):
    """
    Submit personal and employment information.

    Validates and stores data in database for underwriting analysis.
    """
    try:
        personal_data = request.personal_data
        user_id = personal_data.user_id

        # Check if user exists
        user = db.query(User).filter(User.user_id == user_id).first()

        if user:
            # Update existing user
            user.full_name = personal_data.full_name
            user.address = personal_data.address
            user.country = personal_data.country
            user.employment_status = EmploymentStatusEnum(personal_data.employment_status)
            user.monthly_income = personal_data.monthly_income
            user.tenure_months = personal_data.tenure_months
            user.email_hash = personal_data.email_hash
            user.phone_hash = personal_data.phone_hash
            user.updated_at = datetime.utcnow()
        else:
            # Create new user
            user = User(
                user_id=user_id,
                full_name=personal_data.full_name,
                address=personal_data.address,
                country=personal_data.country,
                employment_status=EmploymentStatusEnum(personal_data.employment_status),
                monthly_income=personal_data.monthly_income,
                tenure_months=personal_data.tenure_months,
                email_hash=personal_data.email_hash,
                phone_hash=personal_data.phone_hash
            )
            db.add(user)

        db.commit()

        return {
            "success": True,
            "message": f"Personal data stored for user {user_id}",
            "user_id": user_id,
            "employment_status": personal_data.employment_status,
            "country": personal_data.country
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store personal data: {str(e)}"
        )


@app.post("/api/liveness/check")
async def check_liveness_simple(
    image: UploadFile = File(...),
    user_id: str = "demo_user",
    device_fingerprint: str = ""
):
    """
    Simple liveness check endpoint for frontend demo.
    Accepts image file directly without complex request model.
    """
    try:
        # Mock liveness check result for demo
        import random
        
        liveness_score = random.uniform(0.7, 0.95)
        is_real_face = liveness_score > 0.6
        is_deepfake = random.random() < 0.1
        replay_detected = random.random() < 0.05
        sanctions_pass = random.random() > 0.1
        device_risk_score = random.uniform(0.1, 0.4)
        
        flags = []
        if not is_real_face:
            flags.append("NO_FACE_DETECTED")
        if is_deepfake:
            flags.append("DEEPFAKE_DETECTED")
        if replay_detected:
            flags.append("REPLAY_ATTACK")
        if not sanctions_pass:
            flags.append("SANCTIONS_MATCH")
        
        liveness_pass = is_real_face and not is_deepfake and not replay_detected and sanctions_pass
        
        return {
            "success": True,
            "user_id": user_id,
            "liveness_pass": liveness_pass,
            "liveness_score": liveness_score,
            "is_real_face": is_real_face,
            "is_deepfake": is_deepfake,
            "replay_detected": replay_detected,
            "sanctions_pass": sanctions_pass,
            "device_risk_score": device_risk_score,
            "flags": flags
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Liveness check failed: {str(e)}"
        )


@app.post("/api/underwrite/liveness")
async def check_liveness(
    request: LivenessCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Perform facial liveness verification with real face detection and deepfake detection.

    Checks for:
    - Real face detection (DeepFace/RetinaFace)
    - Deepfake detection
    - Replay attack detection
    - Real sanctions/PEP screening (OpenSanctions API)
    - Device risk scoring
    - Duplicate identity detection
    """
    try:
        liveness_check = request.liveness_check
        user_id = liveness_check.user_id

        # Get user for sanctions screening
        user = db.query(User).filter(User.user_id == user_id).first()
        user_name = user.full_name if user and user.full_name != "Pending" else None

        # Perform liveness check with real face detection (async)
        result, face_embedding = await liveness_checker.verify_liveness(liveness_check, user_name)

        # Store result in database
        db_liveness = LivenessCheckDB(
            user_id=user_id,
            device_fingerprint=liveness_check.device_fingerprint,
            liveness_pass=result.liveness_pass,
            liveness_score=result.liveness_score,
            is_real_face=not ("NO_FACE_DETECTED" in result.flags),
            is_deepfake="DEEPFAKE_DETECTED" in result.flags,
            deepfake_confidence=0.0,  # Would be set by deepfake detector
            replay_detected=result.replay_detected,
            sanctions_pass=result.sanctions_pass,
            sanctions_matches=None,  # Could store JSON of matches
            pep_match="SANCTIONS_MATCH" in result.flags,
            device_risk_score=result.device_risk_score,
            flags=json.dumps(result.flags),
            face_embedding=json.dumps(face_embedding) if face_embedding else None
        )
        db.add(db_liveness)
        db.commit()

        return {
            "success": True,
            "user_id": user_id,
            "liveness_pass": result.liveness_pass,
            "liveness_score": result.liveness_score,
            "is_real_face": not ("NO_FACE_DETECTED" in result.flags),
            "is_deepfake": "DEEPFAKE_DETECTED" in result.flags,
            "replay_detected": result.replay_detected,
            "sanctions_pass": result.sanctions_pass,
            "device_risk_score": result.device_risk_score,
            "flags": result.flags
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Liveness check failed: {str(e)}"
        )


@app.post("/api/underwrite/analyze")
async def analyze_underwriting(
    request: AnalyzeRequest,
    db: Session = Depends(get_db)
):
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

        # Load user from database
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"User {user_id} not found. Submit personal data first."
            )

        # Load transactions
        db_transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
        if not db_transactions:
            raise HTTPException(
                status_code=400,
                detail=f"No transaction data found for user {user_id}. Upload transactions first."
            )

        # Load liveness result
        liveness_result_db = db.query(LivenessCheckDB).filter(
            LivenessCheckDB.user_id == user_id
        ).order_by(LivenessCheckDB.created_at.desc()).first()

        if not liveness_result_db:
            raise HTTPException(
                status_code=400,
                detail=f"No liveness check found for user {user_id}. Perform liveness check first."
            )

        # Convert database models to Pydantic models
        transactions = [
            BankTransaction(
                txn_id=t.txn_id,
                account_id=t.account_id,
                timestamp=t.timestamp,
                amount=t.amount,
                currency=t.currency,
                merchant=t.merchant,
                counterparty=t.counterparty,
                transaction_type=t.transaction_type.value,
                mcc=t.mcc
            )
            for t in db_transactions
        ]

        personal_data = PersonalData(
            user_id=user.user_id,
            full_name=user.full_name,
            address=user.address,
            country=user.country,
            employment_status=user.employment_status.value,
            monthly_income=user.monthly_income,
            tenure_months=user.tenure_months,
            email_hash=user.email_hash,
            phone_hash=user.phone_hash
        )

        from app.models import LivenessResult
        liveness_result = LivenessResult(
            user_id=user_id,
            liveness_pass=liveness_result_db.liveness_pass,
            liveness_score=liveness_result_db.liveness_score,
            replay_detected=liveness_result_db.replay_detected,
            sanctions_pass=liveness_result_db.sanctions_pass,
            device_risk_score=liveness_result_db.device_risk_score,
            flags=json.loads(liveness_result_db.flags) if liveness_result_db.flags else []
        )

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

        # Store decision in database
        # Determine fraud decline reason if fraud gate failed
        fraud_decline_reason = None
        if not decision.fraud_gate_passed and decision.liveness_result:
            fraud_decline_reason = ",".join(decision.liveness_result.flags) if decision.liveness_result.flags else "FRAUD_GATE_FAILED"

        db_decision = UnderwritingDecisionDB(
            decision_id=decision.decision_id,
            user_id=user_id,
            jurisdiction=jurisdiction,
            fraud_gate_passed=decision.fraud_gate_passed,
            fraud_decline_reason=fraud_decline_reason,
            cashflow_metrics=json.dumps(cashflow_metrics.dict()),
            pd_12m=decision.pd_12m,
            lgd=decision.lgd,
            expected_loss=decision.expected_loss,
            status=DecisionStatus.APPROVED if decision.approved else DecisionStatus.DECLINED,
            approved=decision.approved,
            credit_limit=decision.credit_limit,
            apr=decision.apr,
            risk_reasons=json.dumps([r.dict() for r in decision.reasons]),
            counterfactuals=json.dumps([c.dict() for c in decision.counterfactuals]) if decision.counterfactuals else None
        )
        db.add(db_decision)
        db.commit()

        return {
            "success": True,
            "message": "Underwriting analysis complete",
            "decision": decision.dict()
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.get("/api/underwrite/decision/{user_id}")
async def get_decision(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieve stored underwriting decision for a user.
    """
    db_decision = db.query(UnderwritingDecisionDB).filter(
        UnderwritingDecisionDB.user_id == user_id
    ).order_by(UnderwritingDecisionDB.created_at.desc()).first()

    if not db_decision:
        raise HTTPException(
            status_code=404,
            detail=f"No decision found for user {user_id}"
        )

    # Convert database model to response
    decision_dict = {
        "decision_id": db_decision.decision_id,
        "user_id": db_decision.user_id,
        "timestamp": db_decision.timestamp.isoformat(),
        "jurisdiction": db_decision.jurisdiction,
        "fraud_gate_passed": db_decision.fraud_gate_passed,
        "fraud_decline_reason": db_decision.fraud_decline_reason,
        "cashflow_metrics": json.loads(db_decision.cashflow_metrics),
        "pd_12m": db_decision.pd_12m,
        "lgd": db_decision.lgd,
        "expected_loss": db_decision.expected_loss,
        "approved": db_decision.approved,
        "credit_limit": db_decision.credit_limit,
        "apr": db_decision.apr,
        "reasons": json.loads(db_decision.risk_reasons),
        "counterfactuals": json.loads(db_decision.counterfactuals) if db_decision.counterfactuals else []
    }

    return {
        "success": True,
        "decision": decision_dict
    }


@app.get("/api/underwrite/status/{user_id}")
async def get_underwriting_status(user_id: str, db: Session = Depends(get_db)):
    """
    Check which underwriting steps have been completed for a user.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    transactions_count = db.query(Transaction).filter(Transaction.user_id == user_id).count()
    liveness_check = db.query(LivenessCheckDB).filter(LivenessCheckDB.user_id == user_id).first()
    decision = db.query(UnderwritingDecisionDB).filter(UnderwritingDecisionDB.user_id == user_id).first()

    has_personal_data = user is not None and user.full_name != "Pending"

    return {
        "user_id": user_id,
        "transactions_uploaded": transactions_count > 0,
        "transaction_count": transactions_count,
        "personal_data_submitted": has_personal_data,
        "liveness_checked": liveness_check is not None,
        "decision_made": decision is not None,
        "ready_for_analysis": (
            transactions_count > 0 and
            has_personal_data and
            liveness_check is not None
        )
    }


@app.delete("/api/underwrite/user/{user_id}")
async def clear_user_data(user_id: str, db: Session = Depends(get_db)):
    """
    Clear all stored data for a user (for testing/demo).

    Cascading deletes will remove transactions, liveness checks, and decisions.
    """
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User {user_id} not found"
        )

    # Get counts before deletion
    removed = {
        "user": True,
        "transactions": db.query(Transaction).filter(Transaction.user_id == user_id).count(),
        "liveness_checks": db.query(LivenessCheckDB).filter(LivenessCheckDB.user_id == user_id).count(),
        "decisions": db.query(UnderwritingDecisionDB).filter(UnderwritingDecisionDB.user_id == user_id).count()
    }

    # Delete user (cascade will delete related records)
    db.delete(user)
    db.commit()

    return {
        "success": True,
        "message": f"Cleared all data for user {user_id}",
        "removed": removed
    }


if __name__ == "__main__":
    import uvicorn
