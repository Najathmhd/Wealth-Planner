import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core import security
from app.core.config import settings
from datetime import datetime

async def seed_admin():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    admin_email = "admin@wealthplanner.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin:
        print("Admin user already exists.")
        return
        
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
    print("Admin user created successfully.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
