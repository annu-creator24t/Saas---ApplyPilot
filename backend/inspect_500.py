import requests

headers = {
    "Origin": "http://localhost:3000",
    "Content-Type": "application/json"
}

payload = {
    "email": "test@example.com",
    "password": "password123"
}

print("=== TESTING POST /auth/login ===")
r_login = requests.post("http://localhost:8000/auth/login", json=payload, headers=headers)
print("Status Code:", r_login.status_code)
print("CORS Header:", r_login.headers.get("access-control-allow-origin"))
print("Response Body:", r_login.text)

print("\n=== TESTING POST /auth/register ===")
reg_payload = {
    "full_name": "Test User",
    "email": "test_inspect@example.com",
    "password": "Password123!"
}
r_reg = requests.post("http://localhost:8000/auth/register", json=reg_payload, headers=headers)
print("Status Code:", r_reg.status_code)
print("CORS Header:", r_reg.headers.get("access-control-allow-origin"))
print("Response Body:", r_reg.text)
