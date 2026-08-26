"""
Phase 3 Verification Script – CivicAI FastAPI AI Service
=========================================================
Tests:
  1. GET  /        → Health check returns 200 + yoloAvailable flag
  2. POST /predict-image  → Returns category, confidence, source

Usage:
  cd ai-service
  python test_phase3.py

NOTE: FastAPI server must be running on http://localhost:8000
      Start it with:  python main.py
"""

import sys
import time
import io
import requests
from PIL import Image, ImageDraw

BASE_URL = "http://localhost:8000"
PASS = "[PASS]"
FAIL = "[FAIL]"

def banner(title):
    print("\n" + "=" * 50)
    print(f"  {title}")
    print("=" * 50)

def make_dummy_image_bytes(label="pothole_test"):
    """Create a simple dummy image with label text."""
    img = Image.new("RGB", (320, 240), color=(100, 80, 60))
    draw = ImageDraw.Draw(img)
    draw.rectangle([80, 60, 240, 180], outline="red", width=3)
    draw.text((90, 100), label, fill="white")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.read()


def test_health():
    banner("TEST 1: Health Check – GET /")
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        data = r.json()
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert "service" in data, "Missing 'service' key"
        print(f"{PASS} Status: {r.status_code}")
        print(f"  Service  : {data.get('service')}")
        print(f"  Version  : {data.get('version')}")
        print(f"  YOLO     : {data.get('yoloAvailable')}")
        return True
    except Exception as e:
        print(f"{FAIL} Health check failed: {e}")
        return False


def test_predict_image():
    banner("TEST 2: YOLO Image Prediction – POST /predict-image")
    try:
        image_bytes = make_dummy_image_bytes("pothole_002")
        files = {"image": ("pothole_002.jpg", io.BytesIO(image_bytes), "image/jpeg")}
        r = requests.post(f"{BASE_URL}/predict-image", files=files, timeout=15)
        data = r.json()
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert data.get("success") is True, "Expected success=True"
        assert "category" in data, "Missing 'category' key"
        assert "confidence" in data, "Missing 'confidence' key"
        assert "citizenCategory" in data, "Missing 'citizenCategory' key"
        print(f"{PASS} Status: {r.status_code}")
        print(f"  Category        : {data.get('category')}")
        print(f"  CitizenCategory : {data.get('citizenCategory')}")
        print(f"  Confidence      : {data.get('confidence')}")
        print(f"  Model           : {data.get('model')}")
        print(f"  Source          : {data.get('source')}")
        return True
    except Exception as e:
        print(f"{FAIL} predict-image test failed: {e}")
        return False


def test_department_stub():
    banner("TEST 3: Department Stub – POST /predict-department")
    try:
        r = requests.post(
            f"{BASE_URL}/predict-department",
            json={"description": "large pothole on highway"},
            timeout=5,
        )
        data = r.json()
        assert r.status_code == 200
        assert data.get("success") is True
        print(f"{PASS} Status: {r.status_code} | Dept: {data.get('department')}")
        return True
    except Exception as e:
        print(f"{FAIL} Department stub test failed: {e}")
        return False


def test_duplicate_stub():
    banner("TEST 4: Duplicate Stub – POST /check-duplicate")
    try:
        r = requests.post(
            f"{BASE_URL}/check-duplicate",
            json={"description": "test", "latitude": 12.9, "longitude": 77.5},
            timeout=5,
        )
        data = r.json()
        assert r.status_code == 200
        assert "isDuplicate" in data
        print(f"{PASS} Status: {r.status_code} | isDuplicate: {data.get('isDuplicate')}")
        return True
    except Exception as e:
        print(f"{FAIL} Duplicate stub test failed: {e}")
        return False


if __name__ == "__main__":
    print("\n=============================================")
    print("     CivicAI Phase 3 Verification Tests      ")
    print("=============================================")
    print(f"  Target: {BASE_URL}")

    results = [
        test_health(),
        test_predict_image(),
        test_department_stub(),
        test_duplicate_stub(),
    ]

    passed = sum(results)
    total = len(results)

    print("\n=============================================")
    if passed == total:
        print(f"  [OK] ALL {total} TESTS PASSED  — Phase 3 Verified!")
    else:
        print(f"  [{passed}/{total}] Tests passed. Some tests failed.")
    print("=============================================\n")
    sys.exit(0 if passed == total else 1)
