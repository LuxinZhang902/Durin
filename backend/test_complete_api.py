"""
Complete API Test Suite for Durin Underwriting System
Tests the full user journey from onboarding to credit decision.
"""
import requests
import base64
import io
import sys
import json
from PIL import Image
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:8000"

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}[OK]{Colors.RESET} {msg}")

def print_error(msg):
    print(f"{Colors.RED}[FAIL]{Colors.RESET} {msg}")

def print_info(msg):
    print(f"{Colors.BLUE}[INFO]{Colors.RESET} {msg}")

def print_warning(msg):
    print(f"{Colors.YELLOW}[WARN]{Colors.RESET} {msg}")


class FinShieldAPITest:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.test_user_id = f"test_user_{int(datetime.now().timestamp())}"
        self.results = {
            "passed": 0,
            "failed": 0,
            "warnings": 0
        }

    def test_health_check(self):
        """Test: Health check endpoint"""
        print("\n" + "="*60)
        print("TEST 1: Health Check")
        print("="*60)

        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)

            if response.status_code == 200:
                data = response.json()
                print_success(f"API is healthy")
                print_info(f"Status: {data.get('status')}")
                print_info(f"Database: {data.get('database')}")

                services = data.get('services', {})
                print_info(f"Reality Defender: {services.get('reality_defender')}")
                print_info(f"OpenSanctions: {services.get('opensanctions')}")

                self.results["passed"] += 1
                return True
            else:
                print_error(f"Health check failed: {response.status_code}")
                self.results["failed"] += 1
                return False

        except Exception as e:
            print_error(f"Health check error: {str(e)}")
            self.results["failed"] += 1
            return False

    def test_submit_personal_data(self):
        """Test: Submit personal data"""
        print("\n" + "="*60)
        print("TEST 2: Submit Personal Data")
        print("="*60)

        payload = {
            "personal_data": {
                "user_id": self.test_user_id,
                "full_name": "John Smith",
                "address": "123 Main Street, Apt 4B, New York, NY 10001",
                "country": "US",
                "employment_status": "full_time",
                "monthly_income": 5000.00,
                "tenure_months": 24
            }
        }

        try:
            response = requests.post(
                f"{self.base_url}/api/underwrite/personal-data",
                json=payload,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                print_success("Personal data submitted successfully")
                print_info(f"User ID: {data.get('user_id')}")
                print_info(f"Message: {data.get('message')}")
                self.results["passed"] += 1
                return True
            else:
                print_error(f"Failed to submit personal data: {response.status_code}")
                print_error(f"Response: {response.text}")
                self.results["failed"] += 1
                return False

        except Exception as e:
            print_error(f"Error submitting personal data: {str(e)}")
            self.results["failed"] += 1
            return False

    def test_upload_transactions(self):
        """Test: Upload bank transactions"""
        print("\n" + "="*60)
        print("TEST 3: Upload Bank Transactions")
        print("="*60)

        # Generate sample transactions
        transactions = []
        base_date = datetime.now() - timedelta(days=90)

        # Income transactions (monthly salary)
        for month in range(3):
            transactions.append({
                "txn_id": f"txn_income_{month}",
                "account_id": f"acc_{self.test_user_id}",
                "timestamp": (base_date + timedelta(days=month*30)).isoformat() + "Z",
                "amount": 5000.00,
                "currency": "USD",
                "merchant": "Employer Inc",
                "counterparty": None,
                "transaction_type": "income",
                "mcc": "8999"
            })

        # Expense transactions
        expense_categories = [
            ("Grocery Store", "expense", "5411", -45.50),
            ("Gas Station", "expense", "5541", -35.00),
            ("Restaurant", "expense", "5812", -25.00),
            ("Utility Company", "expense", "4900", -120.00),
            ("Rent Payment", "expense", "6513", -1200.00),
        ]

        for i in range(30):
            category = random.choice(expense_categories)
            transactions.append({
                "txn_id": f"txn_expense_{i}",
                "account_id": f"acc_{self.test_user_id}",
                "timestamp": (base_date + timedelta(days=i*3)).isoformat() + "Z",
                "amount": category[3] + random.uniform(-10, 10),
                "currency": "USD",
                "merchant": category[0],
                "counterparty": None,
                "transaction_type": category[1],
                "mcc": category[2]
            })

        payload = {
            "user_id": self.test_user_id,
            "transactions": transactions
        }

        try:
            response = requests.post(
                f"{self.base_url}/api/underwrite/transactions",
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                print_success("Transactions uploaded successfully")
                print_info(f"Transactions stored: {data.get('transactions_stored')}")
                self.results["passed"] += 1
                return True
            else:
                print_error(f"Failed to upload transactions: {response.status_code}")
                print_error(f"Response: {response.text}")
                self.results["failed"] += 1
                return False

        except Exception as e:
            print_error(f"Error uploading transactions: {str(e)}")
            self.results["failed"] += 1
            return False

    def test_liveness_check(self):
        """Test: Liveness check with Reality Defender"""
        print("\n" + "="*60)
        print("TEST 4: Liveness Check (Reality Defender API)")
        print("="*60)

        # Create a test image
        img = Image.new('RGB', (640, 480), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        image_b64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')

        payload = {
            "liveness_check": {
                "user_id": self.test_user_id,
                "image_data": f"data:image/jpeg;base64,{image_b64}",
                "device_fingerprint": "test_device_api_suite",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }

        try:
            print_info("Calling Reality Defender API (may take 10-20 seconds)...")
            response = requests.post(
                f"{self.base_url}/api/underwrite/liveness",
                json=payload,
                timeout=40
            )

            if response.status_code == 200:
                data = response.json()
                print_success("Liveness check completed")
                print_info(f"Liveness Pass: {data.get('liveness_pass')}")
                print_info(f"Liveness Score: {data.get('liveness_score')}")
                print_info(f"Sanctions Pass: {data.get('sanctions_pass')}")
                print_info(f"Device Risk: {data.get('device_risk_score')}")

                flags = data.get('flags', [])
                if flags:
                    print_warning(f"Flags: {', '.join(flags)}")
                else:
                    print_info("Flags: None")

                # Check if Reality Defender was actually called
                if 'REALITY_DEFENDER_DEEPFAKE' in flags or data.get('liveness_score', 0) > 0:
                    print_success("Reality Defender API was called (real API, not mock)")

                self.results["passed"] += 1
                return True
            else:
                print_error(f"Liveness check failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                self.results["failed"] += 1
                return False

        except Exception as e:
            print_error(f"Error during liveness check: {str(e)}")
            self.results["failed"] += 1
            return False

    def test_run_underwriting(self):
        """Test: Full underwriting analysis"""
        print("\n" + "="*60)
        print("TEST 5: Run Underwriting Analysis")
        print("="*60)

        payload = {
            "user_id": self.test_user_id,
            "jurisdiction": "US"
        }

        try:
            print_info("Running underwriting analysis...")
            response = requests.post(
                f"{self.base_url}/api/underwrite/analyze",
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                print_success("Underwriting analysis completed")
                print_info(f"Decision ID: {data.get('decision_id')}")
                print_info(f"Fraud Gate Passed: {data.get('fraud_gate_passed')}")
                print_info(f"PD (12-month): {data.get('pd_12m'):.3f}")
                print_info(f"Approved: {data.get('approved')}")

                if data.get('approved'):
                    print_success(f"Credit Limit: ${data.get('credit_limit')}")
                    print_success(f"APR: {data.get('apr')}%")
                else:
                    print_warning("Application declined")

                # Display risk reasons
                reasons = data.get('reasons', [])
                if reasons:
                    print_info(f"Risk Factors ({len(reasons)}):")
                    for reason in reasons[:3]:  # Show top 3
                        print(f"  - {reason['code']}: {reason['description']}")

                self.results["passed"] += 1
                return True
            else:
                print_error(f"Underwriting analysis failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                self.results["failed"] += 1
                return False

        except Exception as e:
            print_error(f"Error during underwriting analysis: {str(e)}")
            self.results["failed"] += 1
            return False

    def test_get_decision(self):
        """Test: Retrieve decision"""
        print("\n" + "="*60)
        print("TEST 6: Get Decision")
        print("="*60)

        try:
            response = requests.get(
                f"{self.base_url}/api/underwrite/decision/{self.test_user_id}",
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                print_success("Decision retrieved successfully")
                print_info(f"User ID: {data.get('user_id')}")
                print_info(f"Approved: {data.get('approved')}")
                self.results["passed"] += 1
                return True
            else:
                print_error(f"Failed to get decision: {response.status_code}")
                self.results["failed"] += 1
                return False

        except Exception as e:
            print_error(f"Error getting decision: {str(e)}")
            self.results["failed"] += 1
            return False

    def test_get_status(self):
        """Test: Get user status"""
        print("\n" + "="*60)
        print("TEST 7: Get User Status")
        print("="*60)

        try:
            response = requests.get(
                f"{self.base_url}/api/underwrite/status/{self.test_user_id}",
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                print_success("Status retrieved successfully")
                print_info(f"Has Personal Data: {data.get('has_personal_data')}")
                print_info(f"Has Transactions: {data.get('has_transactions')} ({data.get('transaction_count', 0)} txns)")
                print_info(f"Has Liveness Check: {data.get('has_liveness_check')}")
                print_info(f"Has Decision: {data.get('has_decision')}")
                print_info(f"Ready for Analysis: {data.get('ready_for_analysis')}")
                self.results["passed"] += 1
                return True
            else:
                print_error(f"Failed to get status: {response.status_code}")
                self.results["failed"] += 1
                return False

        except Exception as e:
            print_error(f"Error getting status: {str(e)}")
            self.results["failed"] += 1
            return False

    def test_delete_user(self):
        """Test: Delete user data (GDPR)"""
        print("\n" + "="*60)
        print("TEST 8: Delete User Data (GDPR Compliance)")
        print("="*60)

        try:
            response = requests.delete(
                f"{self.base_url}/api/underwrite/user/{self.test_user_id}",
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                print_success("User data deleted successfully")
                deleted = data.get('deleted', {})
                print_info(f"Personal Data: {deleted.get('personal_data')}")
                print_info(f"Transactions: {deleted.get('transactions')}")
                print_info(f"Liveness Checks: {deleted.get('liveness_checks')}")
                print_info(f"Decisions: {deleted.get('decisions')}")
                self.results["passed"] += 1
                return True
            else:
                print_error(f"Failed to delete user: {response.status_code}")
                self.results["failed"] += 1
                return False

        except Exception as e:
            print_error(f"Error deleting user: {str(e)}")
            self.results["failed"] += 1
            return False

    def run_all_tests(self):
        """Run complete test suite"""
        print("\n" + "="*70)
        print("Durin - COMPLETE API TEST SUITE")
        print("="*70)
        print(f"Testing API at: {self.base_url}")
        print(f"Test User ID: {self.test_user_id}")

        tests = [
            self.test_health_check,
            self.test_submit_personal_data,
            self.test_upload_transactions,
            self.test_liveness_check,
            self.test_run_underwriting,
            self.test_get_decision,
            self.test_get_status,
            self.test_delete_user
        ]

        for test in tests:
            test()

        # Final summary
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        total = self.results["passed"] + self.results["failed"]
        print_success(f"Passed: {self.results['passed']}/{total}")
        if self.results["failed"] > 0:
            print_error(f"Failed: {self.results['failed']}/{total}")
        if self.results["warnings"] > 0:
            print_warning(f"Warnings: {self.results['warnings']}")

        success_rate = (self.results["passed"] / total * 100) if total > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")

        if success_rate == 100:
            print_success("\nALL TESTS PASSED! API is production ready!")
            return 0
        else:
            print_error("\nSOME TESTS FAILED. Review errors above.")
            return 1


if __name__ == "__main__":
    tester = FinShieldAPITest()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)
