from pymongo import MongoClient
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def reset_pwd():
    load_dotenv()
    url = os.getenv("MONGODB_URL")
    client = MongoClient(url)
    db = client.wealth_db
    
    email = "najamhd037@gmail.com"
    new_pwd = "Password@123"
    hashed = get_password_hash(new_pwd)
    
    result = db.users.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed}}
    )
    
    print(f"Update result: {result.modified_count}")
    
    with open("reset_status.txt", "w") as f:
        f.write(f"Updated {email}: {result.modified_count}")
    
    client.close()

if __name__ == "__main__":
    reset_pwd()
