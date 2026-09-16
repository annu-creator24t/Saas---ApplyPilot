import os
import sys

# Ensure UTF-8 output if supported
if sys.platform == "win32":
    os.environ["PYTHONIOENCODING"] = "utf-8"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    print("[PASS] Health check endpoint passed.")

def test_missing_auth():
    res = client.get("/resume")
    assert res.status_code == 401
    data = res.json()
    assert data["success"] is False
    assert "error" in data
    assert data["error"]["code"] == "AUTHENTICATION_ERROR"
    assert "traceback" not in str(data)
    print("[PASS] Missing auth test passed: returns 401 with standard error format.")

def test_invalid_jwt():
    res = client.get("/resume", headers={"Authorization": "Bearer invalid.token.value"})
    assert res.status_code == 401
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] == "AUTHENTICATION_ERROR"
    assert "traceback" not in str(data)
    print("[PASS] Invalid JWT test passed: returns 401 with standard error format.")

def test_empty_resume_upload():
    # Attempting to upload empty file
    res = client.post(
        "/resume/upload",
        headers={"Authorization": "Bearer some.invalid.token"},
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    # Should fail with 401 (auth) or 422 (validation) - no crash
    assert res.status_code in (400, 401, 422)
    data = res.json()
    assert data["success"] is False
    assert "traceback" not in str(data)
    print("[PASS] Empty resume upload handled safely.")

def test_validation_error_format():
    # Missing required body on /auth/register
    res = client.post("/auth/register", json={})
    assert res.status_code == 422
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "message" in data
    assert "traceback" not in str(data)
    print("[PASS] Validation error formatting test passed.")

def test_not_found_format():
    res = client.get("/non-existent-route-12345")
    assert res.status_code == 404
    data = res.json()
    assert data["success"] is False
    assert "traceback" not in str(data)
    print("[PASS] 404 Not Found formatting test passed.")

if __name__ == "__main__":
    print("Running Error Handling Test Suite...")
    test_health()
    test_missing_auth()
    test_invalid_jwt()
    test_empty_resume_upload()
    test_validation_error_format()
    test_not_found_format()
    print("\nAll Error Handling Suite Tests Passed Successfully!")
