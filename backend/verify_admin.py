import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core import security
from app.core.config import settings

async def verify_admin():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    admin_email = "admin@wealthplanner.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"Admin found: {existing_admin['email']}")
        print(f"Role: {existing_admin.get('role')}")
        valid = security.verify_password("admin123", existing_admin["hashed_password"])
        print(f"Password valid: {valid}")
    else:
        print("Admin user not found. Did it fail to insert?")

if __name__ == "__main__":
    asyncio.run(verify_admin())
