import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to sys.path for importing app module
sys.path.append(str(Path(__file__).resolve().parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core import security
from app.core.config import settings
from datetime import datetime

async def seed_admin():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    # The app actually uses client.wealth_db!
    db = client.wealth_db
    
    admin_email = "najamhd037@gmail.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print("Admin user already exists in wealth_db. Deleting it to force a clean insert.")
        await db.users.delete_one({"email": admin_email})
        
    hashed_password = security.get_password_hash("admin123")
    admin_user = {
        "email": admin_email,
        "full_name": "System Admin",
        "role": "admin",
        "country": "United States",
        "employment_type": "Private Sector",
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.users.insert_one(admin_user)
    print("Admin user created successfully in wealth_db.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
