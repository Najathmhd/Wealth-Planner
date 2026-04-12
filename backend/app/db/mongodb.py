from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from app.core.config import settings

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set in environment variables")

client = AsyncIOMotorClient(MONGODB_URL)
database = client[settings.DATABASE_NAME]

async def get_database():
    return database
