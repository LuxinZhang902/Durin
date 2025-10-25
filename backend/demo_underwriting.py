"""
Demo script for underwriting system.
Demonstrates end-to-end workflow with sample data.

Run this after starting the FastAPI server:
    uvicorn app.main:app --reload
"""
import requests
import json
import base64
from datetime import datetime

API_BASE = "http://localhost:8000"


def demo_user_workflow(user_id: str, csv_file: str, personal_data: dict):
    """Run complete underwriting workflow for a user."""
    
    print(f"\n{'='*60}")
    print(f"UNDERWRITING DEMO: {user_id}")
    print(f"{'='*60}\n")
    
    # Step 1: Upload transaction CSV
    print("Step 1: Uploading bank transactions...")
    with open(csv_file, 'rb') as f:
        response = requests.post(
            f"{API_BASE}/api/underwrite/transactions/csv",
            params={"user_id": user_id},
            files={"file": f}
        )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Uploaded {result['transaction_count']} transactions")
    else:
        print(f"✗ Failed: {response.text}")
        return
    
    # Step 2: Submit personal data
    print("\nStep 2: Submitting personal data...")
    response = requests.post(
        f"{API_BASE}/api/underwrite/personal-data",
        json={"personal_data": personal_data}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Personal data stored")
        print(f"  - Employment: {personal_data['employment_status']}")
        print(f"  - Monthly income: ${personal_data['monthly_income']:.2f}")
        print(f"  - Tenure: {personal_data['tenure_months']} months")
    else:
        print(f"✗ Failed: {response.text}")
        return
    
    # Step 3: Perform liveness check (with test image)
    print("\nStep 3: Performing liveness check...")

    # For hackathon demo: Create a minimal valid JPEG image
    # In production, this would be a real selfie from webcam/phone camera
    # This creates a 100x100 red square JPEG for testing
    from PIL import Image
    import io

    # Create test image
    img = Image.new('RGB', (200, 200), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    image_b64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')
    
    response = requests.post(
        f"{API_BASE}/api/underwrite/liveness",
        json={
            "liveness_check": {
                "user_id": user_id,
                "image_data": image_b64,
                "device_fingerprint": f"device_{user_id}"
            }
        }
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Liveness check complete")
        print(f"  - Pass: {result['liveness_pass']}")
        print(f"  - Score: {result['liveness_score']:.3f}")
        print(f"  - Real face: {result.get('is_real_face', True)}")
        print(f"  - Deepfake: {result.get('is_deepfake', False)}")
        print(f"  - Sanctions pass: {result['sanctions_pass']}")
        print(f"  - Device risk: {result['device_risk_score']:.3f}")
        if result['flags']:
            print(f"  - Flags: {', '.join(result['flags'])}")
    else:
        print(f"✗ Failed: {response.text}")
        return
    
    # Step 4: Run underwriting analysis
    print("\nStep 4: Running underwriting analysis...")
    response = requests.post(
        f"{API_BASE}/api/underwrite/analyze",
        json={
            "user_id": user_id,
            "jurisdiction": "US"
        }
    )
    
    if response.status_code == 200:
        result = response.json()
        decision = result['decision']
        
        print(f"\n{'─'*60}")
        print("UNDERWRITING DECISION")
        print(f"{'─'*60}")
        
        # Decision summary
        print(f"\n{'APPROVED ✓' if decision['approved'] else 'DECLINED ✗'}")
        print(f"\nDecision ID: {decision['decision_id']}")
        print(f"Timestamp: {decision['timestamp']}")
        print(f"\nRisk Assessment:")
        print(f"  - PD (12-month): {decision['pd_12m']:.2%}")
        print(f"  - Credit Limit: ${decision['credit_limit']:.2f}")
        if decision['apr']:
            print(f"  - APR: {decision['apr']:.2f}%")
        print(f"  - Expected Loss: ${decision['expected_loss']:.2f}")
        
        # Cashflow metrics
        if decision['cashflow_metrics']:
            metrics = decision['cashflow_metrics']
            print(f"\nCashflow Health:")
            print(f"  - Monthly Income: ${metrics['net_income_median']:.2f}")
            print(f"  - Income Stability (CV): {metrics['income_cv']:.3f}")
            print(f"  - Cash Buffer: {metrics['buffer_days']:.1f} days")
            print(f"  - Payment Burden: {metrics['payment_burden']:.1%}")
            print(f"  - On-time Ratio: {metrics['on_time_ratio']:.1%}")
            print(f"  - NSF Events (90d): {metrics['nsf_count_90d']}")
        
        # Risk reasons
        if decision['reasons']:
            print(f"\nKey Risk Factors:")
            for i, reason in enumerate(decision['reasons'][:5], 1):
                impact_sign = "+" if reason['impact'] > 0 else ""
                print(f"  {i}. [{reason['severity'].upper()}] {reason['description']}")
                print(f"     Impact: {impact_sign}{reason['impact']:.3f}")
        
        # Counterfactuals
        if decision['counterfactuals']:
            print(f"\nImprovement Suggestions:")
            for i, cf in enumerate(decision['counterfactuals'], 1):
                print(f"  {i}. {cf['action']}")
                print(f"     Current: {cf['current_value']:.2f} → Target: {cf['target_value']:.2f}")
                print(f"     PD Impact: {cf['pd_delta']:.3f} ({cf['feasibility']} difficulty)")
        
        print(f"\n{'─'*60}\n")
        
    else:
        print(f"✗ Failed: {response.text}")
        return
    
    return decision


def check_system_health():
    """Check if the API is running."""
    try:
        response = requests.get(f"{API_BASE}/api/health")
        if response.status_code == 200:
            health = response.json()
            print("✓ API is running")
            print(f"  Services: {health['services']}")
            return True
        else:
            print("✗ API health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to API. Make sure the server is running:")
        print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return False


def main():
    """Run demo for both sample users."""
    
    print("\n" + "="*60)
    print("Durin - UNDERWRITING SYSTEM DEMO")
    print("="*60)
    
    # Check system health
    if not check_system_health():
        return
    
    # User 1: Good profile (stable employment)
    user1_data = {
        "user_id": "user_001",
        "full_name": "Sarah Johnson",
        "address": "1234 Maple Street, Apt 5B, Austin, TX 78701",
        "country": "US",
        "employment_status": "full_time",
        "monthly_income": 2800.00,
        "tenure_months": 18
    }
    
    demo_user_workflow(
        user_id="user_001",
        csv_file="data/underwriting/bank_transactions_user1.csv",
        personal_data=user1_data
    )
    
    # User 2: Risky profile (gig worker, NSF events)
    user2_data = {
        "user_id": "user_002",
        "full_name": "Marcus Chen",
        "address": "789 Oak Avenue, Unit 12, Los Angeles, CA 90001",
        "country": "US",
        "employment_status": "self_employed",
        "monthly_income": 2200.00,
        "tenure_months": 6
    }
    
    demo_user_workflow(
        user_id="user_002",
        csv_file="data/underwriting/bank_transactions_user2.csv",
        personal_data=user2_data
    )
    
    print("\n" + "="*60)
    print("DEMO COMPLETE")
    print("="*60)
    print("\nAPI Documentation: http://localhost:8000/docs")
    print("View decisions at: GET /api/underwrite/decision/{user_id}")
    print("\n")


if __name__ == "__main__":
    main()

