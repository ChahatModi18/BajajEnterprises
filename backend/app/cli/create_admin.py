import sys
import argparse
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.entities import User

def create_admin_user(email: str, password: str, full_name: str = "Store Administrator"):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Error: User with email '{email}' already exists.")
            return False
            
        hashed_password = get_password_hash(password)
        admin = User(
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            role="ADMIN",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"Success: Administrator '{email}' created successfully.")
        return True
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create the first Bajaj Enterprises Administrator")
    parser.add_argument("--email", required=True, help="Administrator email address")
    parser.add_argument("--password", required=True, help="Administrator secure password")
    parser.add_argument("--name", default="Store Administrator", help="Administrator full name")

    args = parser.parse_args()
    if len(args.password) < 8:
        print("Error: Password must be at least 8 characters long.")
        sys.exit(1)
        
    success = create_admin_user(args.email, args.password, args.name)
    if not success:
        sys.exit(1)
