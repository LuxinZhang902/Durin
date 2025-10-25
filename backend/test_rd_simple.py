"""
Simple test to verify Reality Defender API works.
No mocks, no tricks - just direct API call.
"""
import os
import sys
import tempfile
import asyncio
from PIL import Image
import io
from dotenv import load_dotenv

# Load env
load_dotenv('.env.local')
load_dotenv()

def test_reality_defender():
    """Test Reality Defender API directly."""

    print("="*60)
    print("REALITY DEFENDER - DIRECT API TEST")
    print("="*60)

    # Check API key
    api_key = os.getenv('REALITY_DEFENDER_API_KEY')
    if not api_key:
        print("\nERROR: REALITY_DEFENDER_API_KEY not found in .env.local")
        return False

    print(f"\n1. API Key: {api_key[:30]}...")

    # Import SDK
    try:
        from realitydefender import RealityDefender
        print("2. SDK imported successfully")
    except ImportError as e:
        print(f"\nERROR: {e}")
        print("Run: pip install realitydefender")
        return False

    # Create test image
    print("3. Creating test image...")
    img = Image.new('RGB', (500, 500), color='green')

    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        img.save(tmp, format='JPEG')
        tmp_path = tmp.name

    print(f"   Image saved: {tmp_path}")

    # Initialize client
    print("4. Initializing Reality Defender client...")
    rd = RealityDefender(api_key=api_key)
    print("   Client initialized")

    # Upload and analyze
    print("5. Uploading image to Reality Defender API...")
    print("   (This will take 10-20 seconds)")

    async def analyze():
        # Upload
        response = await rd.upload(file_path=tmp_path)
        request_id = response.get("request_id")
        print(f"   Upload complete. Request ID: {request_id}")

        # Get results
        print("   Waiting for analysis...")
        result = await rd.get_result(request_id)

        return result

    # Run async
    try:
        result = asyncio.run(analyze())
    except Exception as e:
        print(f"\nERROR during API call: {e}")
        os.unlink(tmp_path)
        return False

    # Clean up
    os.unlink(tmp_path)

    # Display results
    print("\n" + "="*60)
    print("REALITY DEFENDER RESULTS")
    print("="*60)

    status = result.get('status', 'unknown')
    score = result.get('score', 0.0)
    models = result.get('models', [])

    print(f"\nStatus: {status}")
    print(f"Score: {score:.3f}")
    print(f"  (0.0 = real, 1.0 = fake)")
    print(f"Is Deepfake: {'YES' if score > 0.5 else 'NO'}")

    if models:
        print(f"\nModels analyzed: {len(models)}")
        for i, model in enumerate(models, 1):
            name = model.get('name', 'Unknown')
            m_score = model.get('score', 0.0)
            m_status = model.get('status', 'unknown')
            print(f"  {i}. {name}")
            print(f"     Score: {m_score:.3f}")
            print(f"     Status: {m_status}")

    print("\n" + "="*60)
    print("SUCCESS - Reality Defender API is working!")
    print("="*60)

    return True

if __name__ == "__main__":
    success = test_reality_defender()
    sys.exit(0 if success else 1)
