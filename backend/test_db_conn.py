import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def test_conn():
    load_dotenv()
    url = os.getenv("MONGODB_URL")
    print(f"Testing connection to: {url[:20]}...")
    try:
        client = AsyncIOMotorClient(url)
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("MongoDB connection SUCCESSFUL!")
    except Exception as e:
        print(f"MongoDB connection FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
