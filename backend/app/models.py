"""
Pydantic models for underwriting system.
Defines data structures for bank transactions, personal data, liveness checks, and decisions.
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    """Transaction type classification."""
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"
    FEE = "fee"


class EmploymentStatus(str, Enum):
    """Employment status options."""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    SELF_EMPLOYED = "self_employed"
    UNEMPLOYED = "unemployed"
    RETIRED = "retired"


class BankTransaction(BaseModel):
    """Bank transaction data from user's account history."""
    txn_id: str = Field(..., description="Unique transaction identifier")
    account_id: str = Field(..., description="User's account identifier")
    timestamp: datetime = Field(..., description="Transaction timestamp")
    amount: float = Field(..., description="Transaction amount (positive for income, negative for expense)")
    currency: str = Field(default="USD", description="Currency code")
    merchant: Optional[str] = Field(None, description="Merchant name")
    counterparty: Optional[str] = Field(None, description="Counterparty account")
    transaction_type: TransactionType = Field(..., description="Transaction classification")
    mcc: Optional[str] = Field(None, description="Merchant category code")
    
    @validator('amount')
    def validate_amount(cls, v):
        """Ensure amount is not zero."""
        if v == 0:
            raise ValueError("Transaction amount cannot be zero")
        return v


class PersonalData(BaseModel):
    """Personal and employment information."""
    user_id: str = Field(..., description="Unique user identifier")
    full_name: str = Field(..., min_length=2, description="User's full legal name")
    address: str = Field(..., min_length=10, description="Current residential address")
    country: str = Field(..., description="Country of residence")
    employment_status: EmploymentStatus = Field(..., description="Current employment status")
    monthly_income: float = Field(..., gt=0, description="Stated monthly income")
    tenure_months: int = Field(..., ge=0, description="Months at current employment")
    email_hash: Optional[str] = Field(None, description="Hashed email for privacy")
    phone_hash: Optional[str] = Field(None, description="Hashed phone for privacy")


class LivenessCheck(BaseModel):
    """Facial liveness verification data."""
    user_id: str = Field(..., description="User identifier")
    image_data: str = Field(..., description="Base64 encoded selfie image")
    device_fingerprint: str = Field(..., description="Device identifier hash")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Check timestamp")
    
    @validator('image_data')
    def validate_image_data(cls, v):
        """Basic validation for base64 image data."""
        if len(v) < 100:
            raise ValueError("Image data too small, must be valid base64 image")
        return v


class LivenessResult(BaseModel):
    """Result of liveness check."""
    user_id: str
    liveness_pass: bool = Field(..., description="Whether liveness check passed")
    liveness_score: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    replay_detected: bool = Field(default=False, description="Screen replay detected")
    sanctions_pass: bool = Field(default=True, description="Not on sanctions list")
    device_risk_score: float = Field(..., ge=0, le=1, description="Device risk 0-1")
    flags: List[str] = Field(default_factory=list, description="Warning flags")


class CashflowMetrics(BaseModel):
    """Computed cashflow health metrics."""
    net_income_median: float = Field(..., description="Median monthly income")
    income_cv: float = Field(..., ge=0, description="Income coefficient of variation")
    essential_spend_median: float = Field(..., ge=0, description="Median essential spending")
    discretionary_spend_median: float = Field(..., ge=0, description="Median discretionary spending")
    buffer_days: float = Field(..., ge=0, description="Days of runway at current spending")
    payment_burden: float = Field(..., ge=0, le=1, description="Recurring payments / income ratio")
    on_time_ratio: float = Field(..., ge=0, le=1, description="On-time payment ratio")
    nsf_count_90d: int = Field(..., ge=0, description="NSF/overdraft events in 90 days")
    transaction_count: int = Field(..., gt=0, description="Total transactions analyzed")


class RiskReason(BaseModel):
    """Individual risk factor contributing to score."""
    code: str = Field(..., description="Machine-readable reason code")
    description: str = Field(..., description="Human-readable explanation")
    impact: float = Field(..., description="Impact on PD (+ increases risk, - decreases)")
    severity: str = Field(..., description="Severity: low, medium, high")


class Counterfactual(BaseModel):
    """What-if scenario showing improvement path."""
    action: str = Field(..., description="Suggested improvement action")
    current_value: float = Field(..., description="Current metric value")
    target_value: float = Field(..., description="Target metric value")
    pd_delta: float = Field(..., description="Change in PD if target achieved")
    feasibility: str = Field(..., description="Feasibility: easy, moderate, hard")


class UnderwritingDecision(BaseModel):
    """Final underwriting decision with full context."""
    decision_id: str = Field(..., description="Unique decision identifier")
    user_id: str = Field(..., description="User identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    jurisdiction: str = Field(default="US", description="Regulatory jurisdiction")
    
    # Fraud gate results
    fraud_gate_passed: bool = Field(..., description="Passed identity/fraud checks")
    liveness_result: Optional[LivenessResult] = None
    
    # Cashflow analysis
    cashflow_metrics: Optional[CashflowMetrics] = None
    
    # Risk assessment
    pd_12m: float = Field(..., ge=0, le=1, description="Probability of default 12-month")
    lgd: float = Field(default=0.45, ge=0, le=1, description="Loss given default")
    expected_loss: float = Field(..., ge=0, description="Expected loss = PD * LGD * EAD")
    
    # Decision outcome
    approved: bool = Field(..., description="Underwriting decision")
    credit_limit: float = Field(..., ge=0, description="Approved credit limit (0 if declined)")
    apr: Optional[float] = Field(None, ge=0, le=100, description="Annual percentage rate")
    
    # Explanations
    reasons: List[RiskReason] = Field(default_factory=list, description="Risk factors")
    counterfactuals: List[Counterfactual] = Field(default_factory=list, description="Improvement paths")
    
    # Policy metadata
    model_version: str = Field(default="1.0.0", description="Scoring model version")
    policy_version: str = Field(default="2025-10-01", description="Policy ruleset version")
    
    class Config:
        json_schema_extra = {
            "example": {
                "decision_id": "dec_01HF8K2MXYZ",
                "user_id": "user_123",
                "fraud_gate_passed": True,
                "pd_12m": 0.085,
                "approved": True,
                "credit_limit": 1200,
                "apr": 22.9,
                "reasons": [
                    {
                        "code": "STABLE_INCOME",
                        "description": "Consistent monthly income detected",
                        "impact": -0.02,
                        "severity": "low"
                    }
                ]
            }
        }


class TransactionUploadRequest(BaseModel):
    """Request to upload transaction history."""
    user_id: str
    transactions: List[BankTransaction]


class PersonalDataSubmission(BaseModel):
    """Request to submit personal data."""
    personal_data: PersonalData


class LivenessCheckRequest(BaseModel):
    """Request to perform liveness check."""
    liveness_check: LivenessCheck


class AnalyzeRequest(BaseModel):
    """Request to run full underwriting analysis."""
    user_id: str
    jurisdiction: str = Field(default="US", description="US or UK")

