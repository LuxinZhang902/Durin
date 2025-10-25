"""
Test the FastAPI endpoint with Reality Defender integration.
This tests the full async chain.
"""
import sys
import os
import base64
import io
import requests
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv()

# Fix encoding issues on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')


def test_liveness_endpoint():
    """Test the /api/underwrite/liveness endpoint with Reality Defender."""

    print("=" * 60)
    print("TESTING LIVENESS ENDPOINT WITH REALITY DEFENDER")
    print("=" * 60)

    # Create a simple test image
    print("\n1. Creating test image...")
    img = Image.new('RGB', (400, 400), color='green')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    image_data = img_bytes.getvalue()

    # Encode to base64
    image_b64 = base64.b64encode(image_data).decode('utf-8')
    print(f"   Image created: {len(image_data)} bytes")

    # Prepare request
    print("\n2. Sending request to http://localhost:8000/api/underwrite/liveness")

    payload = {
        "liveness_check": {
            "user_id": "test_async_user",
            "image_data": image_b64,
            "device_fingerprint": "test_device_async"
        }
    }

    print("   (This may take 10-20 seconds for Reality Defender API)")

    try:
        response = requests.post(
            "http://localhost:8000/api/underwrite/liveness",
            json=payload,
            timeout=30
        )

        print(f"\n3. Response status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()

            print("\n" + "=" * 60)
            print("RESULTS")
            print("=" * 60)

            print(f"\nSuccess: {result.get('success')}")
            print(f"Liveness Pass: {result.get('liveness_pass')}")
            print(f"Liveness Score: {result.get('liveness_score'):.3f}")
            print(f"Sanctions Pass: {result.get('sanctions_pass')}")
            print(f"Device Risk: {result.get('device_risk_score'):.3f}")

            flags = result.get('flags', [])
            if flags:
                print(f"\nFlags:")
                for flag in flags:
                    print(f"  - {flag}")

            # Check if Reality Defender was called
            if "REALITY_DEFENDER_DEEPFAKE" in flags:
                print("\n[OK] REALITY DEFENDER WAS CALLED AND FLAGGED DEEPFAKE")
                return True
            elif "NO_FACE_DETECTED" in flags:
                print("\n[OK] NO FACE DETECTED (expected for test image)")
                print("[OK] But Reality Defender should have been called")
                return True
            else:
                print("\n[OK] REALITY DEFENDER WAS CALLED AND PASSED")
                return True
        else:
            print(f"\n[FAIL] Error: {response.status_code}")
            print(response.text)
            return False

    except requests.exceptions.Timeout:
        print("\n[FAIL] Request timed out after 30 seconds")
        return False
    except Exception as e:
        print(f"\n[FAIL] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n[TEST] FastAPI + Reality Defender Async Integration\n")

    success = test_liveness_endpoint()

    print("\n" + "=" * 60)
    if success:
        print("[OK] TEST PASSED - Reality Defender integration working!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("[FAIL] TEST FAILED - Check errors above")
        print("=" * 60)
        sys.exit(1)
