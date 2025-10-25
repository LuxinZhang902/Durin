"""
Test Reality Defender API integration.
Tests real deepfake detection on images.
"""
import sys
import os
import base64
import io
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv()

# Fix encoding issues on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')


def test_reality_defender_api():
    """Test Reality Defender API with a test image."""

    print("="*60)
    print("TESTING REALITY DEFENDER API")
    print("="*60)

    # Check for API key
    api_key = os.getenv('REALITY_DEFENDER_API_KEY')
    if not api_key:
        print("\n✗ REALITY_DEFENDER_API_KEY not set in .env.local")
        print("  Please add: REALITY_DEFENDER_API_KEY=your_key_here")
        return False

    print(f"\n✓ API Key found: {api_key[:20]}...")

    # Test with a simple image
    print("\n" + "-"*60)
    print("Creating test image...")
    print("-"*60)

    # Create a test image (simple colored square)
    img = Image.new('RGB', (400, 400), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    image_data = img_bytes.getvalue()

    print(f"✓ Test image created ({len(image_data)} bytes)")

    # Test using liveness checker
    print("\n" + "-"*60)
    print("Testing via LivenessCheckerV2...")
    print("-"*60)

    try:
        from app.liveness_checker_v2 import LivenessCheckerV2
        from app.models import LivenessCheck

        checker = LivenessCheckerV2()

        # Create liveness check request
        image_b64 = base64.b64encode(image_data).decode('utf-8')

        check = LivenessCheck(
            user_id="test_rd_user",
            image_data=image_b64,
            device_fingerprint="test_device_rd"
        )

        print("Calling Reality Defender API...")
        print("(This may take 5-15 seconds for first request)")

        # This will trigger Reality Defender check
        result, embedding = checker.verify_liveness(check, "Test User")

        print(f"\n✓ Liveness check complete!")
        print(f"  - Pass: {result.liveness_pass}")
        print(f"  - Liveness Score: {result.liveness_score:.3f}")
        print(f"  - Flags: {result.flags}")

        # Check if Reality Defender was triggered
        if "REALITY_DEFENDER_DEEPFAKE" in result.flags:
            print(f"\n  ⚠️  REALITY DEFENDER FLAGGED AS DEEPFAKE")
        elif "NO_FACE_DETECTED" in result.flags:
            print(f"\n  ℹ️  No face detected (expected for test image)")
        else:
            print(f"\n  ✓ Reality Defender check passed")

        return True

    except ImportError as e:
        print(f"✗ Cannot import: {e}")
        print("  Make sure you're in the backend directory")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_reality_defender_direct():
    """Test Reality Defender SDK directly."""

    print("\n\n" + "="*60)
    print("TESTING REALITY DEFENDER SDK DIRECTLY")
    print("="*60)

    api_key = os.getenv('REALITY_DEFENDER_API_KEY')
    if not api_key:
        print("\n✗ REALITY_DEFENDER_API_KEY not set")
        return False

    try:
        from realitydefender import RealityDefender
        import asyncio
        import tempfile

        print("\n✓ Reality Defender SDK imported")

        # Create test image file
        img = Image.new('RGB', (400, 400), color='red')

        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp, format='JPEG')
            tmp_path = tmp.name

        print(f"✓ Test image saved: {tmp_path}")

        # Initialize client
        rd = RealityDefender(api_key=api_key)
        print("✓ Reality Defender client initialized")

        # Upload and analyze
        async def analyze():
            print("\nUploading image to Reality Defender...")
            response = await rd.upload(file_path=tmp_path)
            request_id = response.get("request_id")
            print(f"✓ Upload complete. Request ID: {request_id}")

            print("Waiting for analysis results...")
            result = await rd.get_result(request_id)

            return result

        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(analyze())
        loop.close()

        # Clean up
        os.unlink(tmp_path)

        # Display results
        print("\n" + "-"*60)
        print("REALITY DEFENDER RESULTS")
        print("-"*60)

        status = result.get('status')
        score = result.get('score', 0.0)
        models = result.get('models', [])

        print(f"Status: {status}")
        print(f"Overall Score: {score:.3f} (0.0=real, 1.0=fake)")
        print(f"Is Deepfake: {score > 0.5}")

        if models:
            print(f"\nModel Results ({len(models)} models):")
            for i, model in enumerate(models, 1):
                name = model.get('name', 'Unknown')
                m_score = model.get('score', 0.0)
                m_status = model.get('status', 'unknown')
                print(f"  {i}. {name}")
                print(f"     Score: {m_score:.3f}")
                print(f"     Status: {m_status}")

        print("\n✓ Reality Defender API test successful!")
        return True

    except ImportError:
        print("\n✗ realitydefender package not installed")
        print("  Run: pip install realitydefender")
        return False
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n🛡️  Durin - REALITY DEFENDER INTEGRATION TEST")
    print("="*60)

    # Test via liveness checker
    success1 = test_reality_defender_api()

    # Test SDK directly
    success2 = test_reality_defender_direct()

    # Summary
    print("\n\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Liveness Checker Integration: {'✓ PASS' if success1 else '✗ FAIL'}")
    print(f"Direct SDK Test: {'✓ PASS' if success2 else '✗ FAIL'}")

    if success1 and success2:
        print("\n🎉 All Reality Defender tests passed!")
        print("\nReality Defender is now integrated and working!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check errors above.")
        sys.exit(1)
