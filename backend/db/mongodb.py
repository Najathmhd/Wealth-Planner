from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set in environment variables")

client = AsyncIOMotorClient(MONGODB_URL)
database = client.wealth_db  # Matches the database name in the connection string usually, or default

async def get_database():
    return database
