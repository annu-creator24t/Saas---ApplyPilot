from passlib.context import CryptContext

# Password hashing context
_pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    """
    return _pwd_context.hash(password)


def verify_password(
    password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against its hashed value.
    """
    return _pwd_context.verify(
        password,
        hashed_password,
    )