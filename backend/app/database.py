"""
SQLAlchemy database models and session management.
Production-ready SQLite setup with proper connection pooling and session handling.
"""
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.pool import StaticPool
from datetime import datetime
from typing import Generator
import json
import enum

# Database setup
DATABASE_URL = "sqlite:///./finshield_underwriting.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # For SQLite compatibility
    echo=False  # Set to True for SQL query debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Enums
class TransactionTypeEnum(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"
    FEE = "fee"


class EmploymentStatusEnum(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    SELF_EMPLOYED = "self_employed"
    UNEMPLOYED = "unemployed"
    RETIRED = "retired"


class DecisionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"


# Database Models
class User(Base):
    """User application record."""
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    country = Column(String(2), nullable=False)
    employment_status = Column(SQLEnum(EmploymentStatusEnum), nullable=False)
    monthly_income = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    email_hash = Column(String, nullable=True)
    phone_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    liveness_checks = relationship("LivenessCheckDB", back_populates="user", cascade="all, delete-orphan")
    decisions = relationship("UnderwritingDecisionDB", back_populates="user", cascade="all, delete-orphan")


class Transaction(Base):
    """Bank transaction record."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    txn_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    account_id = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    merchant = Column(String, nullable=True)
    counterparty = Column(String, nullable=True)
    transaction_type = Column(SQLEnum(TransactionTypeEnum), nullable=False)
    mcc = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")


class LivenessCheckDB(Base):
    """Liveness verification record."""
    __tablename__ = "liveness_checks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    device_fingerprint = Column(String, nullable=False)

    # Liveness results
    liveness_pass = Column(Boolean, nullable=False)
    liveness_score = Column(Float, nullable=False)
    is_real_face = Column(Boolean, default=True)
    is_deepfake = Column(Boolean, default=False)
    deepfake_confidence = Column(Float, default=0.0)
    replay_detected = Column(Boolean, default=False)

    # Sanctions screening
    sanctions_pass = Column(Boolean, default=True)
    sanctions_matches = Column(Text, nullable=True)  # JSON string
    pep_match = Column(Boolean, default=False)

    # Device risk
    device_risk_score = Column(Float, nullable=False)
    flags = Column(Text, nullable=True)  # JSON array

    # Face embedding (stored for deduplication)
    face_embedding = Column(Text, nullable=True)  # JSON array of floats

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="liveness_checks")


class UnderwritingDecisionDB(Base):
    """Underwriting decision record."""
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    jurisdiction = Column(String(2), nullable=False)

    # Fraud gate
    fraud_gate_passed = Column(Boolean, nullable=False)
    fraud_decline_reason = Column(String, nullable=True)

    # Cashflow metrics (stored as JSON)
    cashflow_metrics = Column(Text, nullable=False)  # JSON object

    # Risk assessment
    pd_12m = Column(Float, nullable=False)
    lgd = Column(Float, default=0.45)
    expected_loss = Column(Float, nullable=False)

    # Decision
    status = Column(SQLEnum(DecisionStatus), nullable=False)
    approved = Column(Boolean, nullable=False)
    credit_limit = Column(Float, nullable=True)
    apr = Column(Float, nullable=True)

    # Explainability
    risk_reasons = Column(Text, nullable=False)  # JSON array
    counterfactuals = Column(Text, nullable=True)  # JSON array

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="decisions")


# Database initialization
def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI.

    Usage in endpoint:
        @app.post("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def reset_db():
    """Drop all tables and recreate. USE WITH CAUTION."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
