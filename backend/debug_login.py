from pymongo import MongoClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
url = os.getenv("MONGODB_URL")
print("URL found:", bool(url))

try:
    client = MongoClient(url, serverSelectionTimeoutMS=5000)
    db = client.wealth_db
    client.server_info()
    print("DB connected OK")

    user = db.users.find_one({"email": "najamhd037@gmail.com"})
    if not user:
        print("NO USER FOUND with that email")
        all_emails = [u.get("email") for u in db.users.find({}, {"email": 1})]
        print("All user emails in DB:", all_emails)
    else:
        print("User found:", user.get("email"))
        h = user.get("hashed_password", "")
        print("Hash prefix:", h[:30])
        ok = pwd_context.verify("Password@123", h)
        print("Password 'Password@123' matches:", ok)

    client.close()
except Exception as e:
    print("ERROR:", type(e).__name__, e)
