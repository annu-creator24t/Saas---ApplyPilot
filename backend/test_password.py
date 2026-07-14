from app.utils.password import hash_password, verify_password

password = "jadu"

hashed = hash_password(password)

print("Generated Hash:", hashed)

print("Verify:", verify_password(password, hashed))