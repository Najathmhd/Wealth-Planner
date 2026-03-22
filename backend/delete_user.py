from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("MONGODB_URL")
client = MongoClient(url, serverSelectionTimeoutMS=5000)
db = client.wealth_db

email = "najamhd037@gmail.com"
result = db.users.delete_one({"email": email})
print(f"Deleted {result.deleted_count} user(s) with email: {email}")
client.close()
