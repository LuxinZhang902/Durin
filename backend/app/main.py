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
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "graph_analyzer": True,
            "llm_service": llm_explainer is not None
        },
        "analysis_loaded": analysis_results is not None
    }


if __name__ == "__main__":
    import uvicorn
