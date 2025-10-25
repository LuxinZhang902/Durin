"""
System verification script.
Tests all components without running full demo.
"""
import sys


def test_imports():
    """Test all critical imports."""
    print("Testing imports...")

    try:
        import fastapi
        print("  ✓ FastAPI")
    except ImportError as e:
        print(f"  ✗ FastAPI: {e}")
        return False

    try:
        import sqlalchemy
        print("  ✓ SQLAlchemy")
    except ImportError as e:
        print(f"  ✗ SQLAlchemy: {e}")
        return False

    try:
        import pandas
        print("  ✓ Pandas")
    except ImportError as e:
        print(f"  ✗ Pandas: {e}")
        return False

    try:
        import sklearn
        print("  ✓ Scikit-learn")
    except ImportError as e:
        print(f"  ✗ Scikit-learn: {e}")
        return False

    try:
        import PIL
        print("  ✓ Pillow")
    except ImportError as e:
        print(f"  ✗ Pillow: {e}")
        return False

    try:
        import deepface
        print("  ✓ DeepFace")
    except ImportError as e:
        print(f"  ✗ DeepFace: {e}")
        return False

    try:
        import requests
        print("  ✓ Requests")
    except ImportError as e:
        print(f"  ✗ Requests: {e}")
        return False

    return True


def test_database():
    """Test database initialization."""
    print("\nTesting database...")

    try:
        from app.database import init_db, SessionLocal, User, Transaction
        print("  ✓ Database imports")

        # Initialize
        init_db()
        print("  ✓ Database initialized")

        # Test connection
        db = SessionLocal()
        count = db.query(User).count()
        print(f"  ✓ Database connection (users: {count})")
        db.close()

        return True
    except Exception as e:
        print(f"  ✗ Database error: {e}")
        return False


def test_models():
    """Test Pydantic models."""
    print("\nTesting Pydantic models...")

    try:
        from app.models import BankTransaction, PersonalData, LivenessCheck
        from datetime import datetime

        # Test BankTransaction
        txn = BankTransaction(
            txn_id="test_001",
            account_id="acc_001",
            timestamp=datetime.utcnow(),
            amount=100.0,
            currency="USD",
            transaction_type="income"
        )
        print("  ✓ BankTransaction model")

        # Test PersonalData
        personal = PersonalData(
            user_id="test_user",
            full_name="Test User",
            address="123 Test St",
            country="US",
            employment_status="full_time",
            monthly_income=3000.0,
            tenure_months=12
        )
        print("  ✓ PersonalData model")

        # Test LivenessCheck
        liveness = LivenessCheck(
            user_id="test_user",
            image_data="dGVzdF9pbWFnZV9kYXRh",  # base64 encoded
            device_fingerprint="device_001"
        )
        print("  ✓ LivenessCheck model")

        return True
    except Exception as e:
        print(f"  ✗ Model error: {e}")
        return False


def test_analyzers():
    """Test analysis components."""
    print("\nTesting analyzers...")

    try:
        from app.cashflow_analyzer import CashflowAnalyzer
        from app.underwriting_scorer import UnderwritingScorer
        from app.liveness_checker_v2 import LivenessCheckerV2

        # Test cashflow analyzer
        analyzer = CashflowAnalyzer()
        print("  ✓ CashflowAnalyzer initialized")

        # Test underwriting scorer
        scorer = UnderwritingScorer()
        print("  ✓ UnderwritingScorer initialized")

        # Test liveness checker
        checker = LivenessCheckerV2()
        print("  ✓ LivenessCheckerV2 initialized")

        return True
    except Exception as e:
        print(f"  ✗ Analyzer error: {e}")
        return False


def test_face_detection():
    """Test face detection (may take time on first run)."""
    print("\nTesting face detection (may download models)...")

    try:
        from PIL import Image
        import io
        import base64
        from app.liveness_checker_v2 import LivenessCheckerV2
        from app.models import LivenessCheck
        from datetime import datetime

        # Create test image
        img = Image.new('RGB', (300, 300), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        image_b64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')

        # Create liveness check request
        check = LivenessCheck(
            user_id="test_face_user",
            image_data=image_b64,
            device_fingerprint="test_device"
        )

        # Run check (will likely fail - no face in blue image)
        checker = LivenessCheckerV2()
        result, embedding = checker.verify_liveness(check, "Test User")

        print(f"  ✓ Face detection ran (pass={result.liveness_pass})")
        print(f"    Note: Test image has no face, so pass=False is expected")

        return True
    except Exception as e:
        print(f"  ✗ Face detection error: {e}")
        print(f"    This may be due to model download. Try again.")
        return False


def test_sanctions_api():
    """Test sanctions API (requires internet)."""
    print("\nTesting sanctions API...")

    try:
        import requests

        # Test OpenSanctions API
        response = requests.post(
            "https://api.opensanctions.org/match/default",
            json={
                "queries": {
                    "q1": {
                        "schema": "Person",
                        "properties": {
                            "name": ["Test Person NonExistent"]
                        }
                    }
                }
            },
            timeout=10
        )

        if response.status_code == 200:
            print("  ✓ OpenSanctions API accessible")
            return True
        else:
            print(f"  ⚠ OpenSanctions API returned {response.status_code}")
            return True  # Don't fail on API issues
    except Exception as e:
        print(f"  ⚠ Sanctions API error: {e}")
        print(f"    System will work with API offline (defaults to pass)")
        return True  # Don't fail on network issues


def test_sample_data():
    """Test that sample data files exist."""
    print("\nTesting sample data files...")

    import os

    files = [
        "data/underwriting/bank_transactions_user1.csv",
        "data/underwriting/bank_transactions_user2.csv",
    ]

    all_exist = True
    for file_path in files:
        if os.path.exists(file_path):
            print(f"  ✓ {file_path}")
        else:
            print(f"  ✗ {file_path} NOT FOUND")
            all_exist = False

    return all_exist


def main():
    """Run all tests."""
    print("="*60)
    print("Durin - SYSTEM VERIFICATION")
    print("="*60)

    tests = [
        ("Imports", test_imports),
        ("Database", test_database),
        ("Models", test_models),
        ("Analyzers", test_analyzers),
        ("Sample Data", test_sample_data),
        ("Sanctions API", test_sanctions_api),
        ("Face Detection", test_face_detection),
    ]

    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print(f"\n✗ {name} test crashed: {e}")
            results[name] = False

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status:10} - {name}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All systems operational! Ready for demo.")
        print("\nNext steps:")
        print("  1. Start server: uvicorn app.main:app --reload")
        print("  2. Run demo: python demo_underwriting.py")
        return 0
    else:
        print("\n⚠ Some tests failed. Check errors above.")
        print("\nCommon fixes:")
        print("  - Install dependencies: pip install -r requirements.txt")
        print("  - Check internet connection (for model downloads)")
        print("  - Ensure Python 3.8+")
        return 1


if __name__ == "__main__":
    sys.exit(main())
