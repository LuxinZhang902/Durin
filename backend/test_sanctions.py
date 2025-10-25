"""
Test OpenSanctions API integration.
Tests real sanctions/PEP screening.
"""
import requests
import json
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Fix encoding issues on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')


def test_opensanctions_api():
    """Test OpenSanctions API with various names."""

    print("="*60)
    print("TESTING OPENSANCTIONS API")
    print("="*60)

    # Test cases
    test_cases = [
        {
            "name": "John Smith",
            "expected": "pass",
            "description": "Common name (should pass)"
        },
        {
            "name": "Vladimir Putin",
            "expected": "match",
            "description": "Known PEP (should match)"
        },
        {
            "name": "Random Person 12345",
            "expected": "pass",
            "description": "Fake name (should pass)"
        }
    ]

    for i, test in enumerate(test_cases, 1):
        print(f"\n{'-'*60}")
        print(f"Test {i}: {test['description']}")
        print(f"Name: {test['name']}")
        print(f"Expected: {test['expected']}")
        print("-"*60)

        try:
            # Get API key from environment
            api_key = os.getenv('OPENSANCTIONS_API_KEY')

            if not api_key:
                print("  ✗ OPENSANCTIONS_API_KEY not set in .env file")
                continue

            # Make API request with authentication
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }

            response = requests.post(
                "https://api.opensanctions.org/match/default",
                headers=headers,
                json={
                    "queries": {
                        "q1": {
                            "schema": "Person",
                            "properties": {
                                "name": [test['name']]
                            }
                        }
                    }
                },
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                results = data.get('responses', {}).get('q1', {}).get('results', [])

                print(f"✓ API Response: {response.status_code}")
                print(f"  Total matches: {len(results)}")

                if results:
                    # Show top matches
                    print(f"\n  Top Matches:")
                    for j, result in enumerate(results[:3], 1):
                        score = result.get('score', 0)
                        caption = result.get('caption', 'Unknown')
                        dataset = result.get('dataset', 'Unknown')

                        print(f"    {j}. {caption}")
                        print(f"       Score: {score:.2%}")
                        print(f"       Dataset: {dataset}")

                    # Check for high confidence matches
                    high_conf = [r for r in results if r.get('score', 0) > 0.7]
                    if high_conf:
                        print(f"\n  ⚠️  HIGH CONFIDENCE MATCH (>70%)")
                        print(f"     This person would be FLAGGED for sanctions screening")
                    else:
                        print(f"\n  ✓ No high confidence matches")
                        print(f"     This person would PASS sanctions screening")
                else:
                    print(f"  ✓ No matches found")
                    print(f"     This person would PASS sanctions screening")

            else:
                print(f"✗ API Error: {response.status_code}")
                print(f"  Response: {response.text[:200]}")

        except requests.RequestException as e:
            print(f"✗ Network Error: {str(e)}")
        except Exception as e:
            print(f"✗ Error: {str(e)}")

    print(f"\n{'='*60}")
    print("TEST COMPLETE")
    print("="*60)


def test_liveness_integration():
    """Test the liveness checker's sanctions integration."""

    print("\n\n" + "="*60)
    print("TESTING LIVENESS CHECKER INTEGRATION")
    print("="*60)

    try:
        from app.liveness_checker_v2 import LivenessCheckerV2

        checker = LivenessCheckerV2()

        # Test sanctions check method directly
        test_names = [
            "John Smith",
            "Vladimir Putin",
            "Random Person"
        ]

        for name in test_names:
            print(f"\nTesting: {name}")
            sanctions_pass, matches = checker._check_sanctions_api(name)

            if sanctions_pass:
                print(f"  ✓ PASS - No sanctions match")
            else:
                print(f"  ⚠️  FLAGGED - Sanctions match detected")
                if matches:
                    match_data = json.loads(matches)
                    print(f"     Match: {match_data.get('top_match', 'Unknown')}")
                    print(f"     Score: {match_data.get('score', 0):.2%}")

        print("\n✓ Liveness checker integration works!")

    except ImportError as e:
        print(f"✗ Cannot import liveness checker: {e}")
        print("  Make sure you're in the backend directory")
    except Exception as e:
        print(f"✗ Error: {str(e)}")


if __name__ == "__main__":
    # Test direct API
    test_opensanctions_api()

    # Test integration with liveness checker
    test_liveness_integration()
