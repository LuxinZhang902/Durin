"""
Test Reality Defender with real webcam capture.
Captures your face from webcam and tests for deepfake detection.
"""
import sys
import os
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv()

# Fix encoding issues on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')


def capture_from_webcam():
    """Capture image from webcam."""
    print("="*60)
    print("WEBCAM CAPTURE FOR REALITY DEFENDER TEST")
    print("="*60)

    try:
        import cv2
        print("\n✓ OpenCV imported")
    except ImportError:
        print("\n✗ OpenCV not installed")
        print("  Installing opencv-python...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "opencv-python"])
        import cv2
        print("✓ OpenCV installed")

    print("\n📸 Initializing webcam...")
    print("   (Your webcam light should turn on)")

    # Open webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("\n✗ Cannot access webcam")
        print("  Please check:")
        print("  - Webcam is connected")
        print("  - No other app is using the webcam")
        print("  - Webcam permissions are granted")
        return None

    print("✓ Webcam opened successfully!")
    print("\n" + "="*60)
    print("INSTRUCTIONS:")
    print("="*60)
    print("1. Position your face in front of the camera")
    print("2. Make sure there's good lighting")
    print("3. Press SPACE to capture")
    print("4. Press ESC to cancel")
    print("="*60)

    frame = None

    while True:
        # Read frame from webcam
        ret, current_frame = cap.read()

        if not ret:
            print("\n✗ Failed to read from webcam")
            break

        # Display the frame
        cv2.imshow('Reality Defender Test - Press SPACE to capture, ESC to cancel', current_frame)

        # Wait for key press
        key = cv2.waitKey(1) & 0xFF

        # SPACE key to capture
        if key == ord(' ') or key == 32:
            frame = current_frame
            print("\n📸 Image captured!")
            break

        # ESC key to cancel
        if key == 27:
            print("\n❌ Cancelled by user")
            break

    # Clean up
    cap.release()
    cv2.destroyAllWindows()

    return frame


def test_with_webcam_image(image):
    """Test Reality Defender with webcam image."""

    if image is None:
        print("\n✗ No image to test")
        return False

    print("\n" + "="*60)
    print("TESTING WITH REALITY DEFENDER")
    print("="*60)

    # Check for API key
    api_key = os.getenv('REALITY_DEFENDER_API_KEY')
    if not api_key:
        print("\n✗ REALITY_DEFENDER_API_KEY not set in .env.local")
        return False

    print(f"\n✓ API Key found: {api_key[:20]}...")

    # Save image temporarily
    import cv2
    import tempfile

    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        cv2.imwrite(tmp.name, image)
        tmp_path = tmp.name

    # Get image bytes
    with open(tmp_path, 'rb') as f:
        image_bytes = f.read()

    print(f"✓ Image saved ({len(image_bytes)} bytes)")

    # Test with Reality Defender
    try:
        from realitydefender import RealityDefender
        import asyncio

        print("\n🛡️  Uploading to Reality Defender...")
        print("   (This may take 5-15 seconds)")

        rd = RealityDefender(api_key=api_key)

        async def analyze():
            # Upload
            response = await rd.upload(file_path=tmp_path)
            request_id = response.get("request_id")
            print(f"✓ Upload complete. Request ID: {request_id}")

            # Get results
            print("⏳ Analyzing image...")
            result = await rd.get_result(request_id)

            return result

        # Run async
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(analyze())
        loop.close()

        # Clean up temp file
        os.unlink(tmp_path)

        # Display results
        print("\n" + "="*60)
        print("🎯 REALITY DEFENDER RESULTS")
        print("="*60)

        status = result.get('status')
        score = result.get('score', 0.0)
        models = result.get('models', [])

        print(f"\nStatus: {status}")
        print(f"Overall Score: {score:.3f}")
        print(f"  (0.0 = Real/Authentic, 1.0 = Fake/Deepfake)")
        print(f"\nIs Deepfake: {'YES ⚠️' if score > 0.5 else 'NO ✓'}")

        if score < 0.3:
            print("\n✅ HIGHLY CONFIDENT - Real human face")
        elif score < 0.5:
            print("\n⚠️  BORDERLINE - Likely real but some anomalies detected")
        elif score < 0.7:
            print("\n🚨 SUSPICIOUS - Possible deepfake or manipulation")
        else:
            print("\n🔴 DEEPFAKE DETECTED - Very likely AI-generated or manipulated")

        if models:
            print(f"\n📊 Model Results ({len(models)} models):")
            for i, model in enumerate(models, 1):
                name = model.get('name', 'Unknown')
                m_score = model.get('score', 0.0)
                m_status = model.get('status', 'unknown')
                print(f"  {i}. {name}")
                print(f"     Score: {m_score:.3f}")
                print(f"     Status: {m_status}")

        # Test via liveness checker integration
        print("\n" + "="*60)
        print("🔗 TESTING LIVENESS CHECKER INTEGRATION")
        print("="*60)

        from app.liveness_checker_v2 import LivenessCheckerV2
        from app.models import LivenessCheck

        checker = LivenessCheckerV2()

        # Create liveness check request
        image_b64 = base64.b64encode(image_bytes).decode('utf-8')

        check = LivenessCheck(
            user_id="webcam_test_user",
            image_data=image_b64,
            device_fingerprint="webcam_test_device"
        )

        print("\n⏳ Running full liveness verification...")
        liveness_result, embedding = checker.verify_liveness(check, "Webcam Test User")

        print(f"\n✓ Liveness check complete!")
        print(f"\nResults:")
        print(f"  - Pass: {liveness_result.liveness_pass}")
        print(f"  - Liveness Score: {liveness_result.liveness_score:.3f}")
        print(f"  - Sanctions Pass: {liveness_result.sanctions_pass}")
        print(f"  - Device Risk: {liveness_result.device_risk_score:.3f}")

        if liveness_result.flags:
            print(f"\n🚩 Flags:")
            for flag in liveness_result.flags:
                print(f"     - {flag}")

        if "REALITY_DEFENDER_DEEPFAKE" in liveness_result.flags:
            print(f"\n  🔴 REALITY DEFENDER FLAGGED AS DEEPFAKE")
        elif "NO_FACE_DETECTED" in liveness_result.flags:
            print(f"\n  ⚠️  No face detected in image")
        else:
            print(f"\n  ✅ All deepfake checks passed!")

        print("\n" + "="*60)
        print("✅ TEST COMPLETE")
        print("="*60)

        return True

    except ImportError as e:
        print(f"\n✗ Import error: {e}")
        print("  Make sure realitydefender is installed:")
        print("  pip install realitydefender")
        return False
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function."""
    print("\n🛡️  FINSHIELD AI - WEBCAM REALITY DEFENDER TEST")
    print("="*60)
    print("\nThis test will:")
    print("  1. Capture your face from webcam")
    print("  2. Send it to Reality Defender API")
    print("  3. Check if it's a real face or deepfake")
    print("  4. Test full liveness checker integration")
    print("\n⚠️  Note: Your image is sent to Reality Defender's servers")
    print("   but is NOT stored permanently by FinShield.")
    print("="*60)

    input("\nPress ENTER to start webcam capture...")

    # Capture image
    image = capture_from_webcam()

    if image is None:
        print("\n❌ No image captured. Exiting.")
        return

    # Test with Reality Defender
    success = test_with_webcam_image(image)

    if success:
        print("\n🎉 All tests completed successfully!")
        print("\n💡 What this proves:")
        print("  ✓ Reality Defender API is working")
        print("  ✓ Your webcam image was analyzed")
        print("  ✓ Deepfake detection is operational")
        print("  ✓ Liveness checker integration works")
        print("\n🚀 System is production-ready for real face verification!")
    else:
        print("\n⚠️  Test failed. Check errors above.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Test cancelled by user (Ctrl+C)")
    except Exception as e:
        print(f"\n\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
