import hashlib
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with a static application salt for portability."""
    salt = "smartbite_canteen_salt_2024"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# Initialize default demo accounts
DEMO_ACCOUNTS = [
    {
        "name": "Prof. Arvind Sharma (Canteen Admin)",
        "email": "admin@smartbite.edu",
        "password": "admin123",
        "role": "Admin",
        "department": "EVS & Campus Services"
    },
    {
        "name": "Rajesh Kumar (Head Chef)",
        "email": "staff@smartbite.edu",
        "password": "staff123",
        "role": "Canteen Staff",
        "department": "Main Mess & Kitchen Operations"
    }
]

def seed_demo_users_if_needed(db: Session):
    for acc in DEMO_ACCOUNTS:
        existing = db.query(User).filter(User.email == acc["email"]).first()
        if not existing:
            user = User(
                name=acc["name"],
                email=acc["email"],
                password_hash=hash_password(acc["password"]),
                role=acc["role"],
                department=acc["department"]
            )
            db.add(user)
    db.commit()

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    seed_demo_users_if_needed(db)
    
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify credentials."
        )
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your password."
        )

    # Simple session token
    token = f"smartbite_{secrets.token_hex(20)}"

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/demo-accounts")
def get_demo_accounts():
    """Return public demo account hints for the login page."""
    return [
        {
            "role": "Admin",
            "email": "admin@smartbite.edu",
            "password": "admin123",
            "description": "Full access to inventory, waste records, surplus, analytics, suggestions & reports"
        },
        {
            "role": "Canteen Staff",
            "email": "staff@smartbite.edu",
            "password": "staff123",
            "description": "Kitchen operations: daily food preparation, waste recording & surplus tracking"
        }
    ]
