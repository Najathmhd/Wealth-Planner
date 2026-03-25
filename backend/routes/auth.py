from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from jose import jwt, JOSEError
from core import security
from core.config import settings
from models.user import UserCreate, User, Token, UserInDB
from db.mongodb import get_database
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    db = await get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Hash password and store
    hashed_password = security.get_password_hash(user.password)
    user_in_db = user.model_dump()
    user_in_db["hashed_password"] = hashed_password
    del user_in_db["password"]
    
    new_user = await db.users.insert_one(user_in_db)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    return created_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = await get_database()
    
    # Find user by email
    user_dict = await db.users.find_one({"email": form_data.username})
    
    if not user_dict or not security.verify_password(form_data.password, user_dict["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user_dict["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
async def google_login(token_data: dict = Body(...)):
    """
    Handle Google Login by verifying the id_token sent from the frontend.
    """
    id_token_str = token_data.get("id_token")
    if not id_token_str:
        raise HTTPException(status_code=400, detail="Missing id_token")
    
    try:
        # Verify the token
        id_info = id_token.verify_oauth2_token(
            id_token_str, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        
        email = id_info.get("email")
        full_name = id_info.get("name", "")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google token missing email")
            
        db = await get_database()
        user_dict = await db.users.find_one({"email": email})
        
        if not user_dict:
            # Create new user for Google login
            new_user_data = {
                "email": email,
                "full_name": full_name,
                "hashed_password": "", # No password for Google users
                "auth_provider": "google"
            }
            await db.users.insert_one(new_user_data)
            user_dict = new_user_data
            
        # Generate our own internal access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            data={"sub": user_dict["email"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JOSEError: # Use the general error or just catch Exception if unknown
        raise credentials_exception
        
    db = await get_database()
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
        
    # Convert _id to string or map to User model logic as needed. 
    # For now, we return Pydantic model User
    return User(**user)
@router.get("/me", response_model=User)
async def get_current_user_details(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=User)
async def update_user_details(
    updates: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    db = await get_database()
    
    # Filter allowed updates (e.g., name, etc. NOT email or password directly here)
    allowed_fields = ["full_name"]
    safe_updates = {k: v for k, v in updates.items() if k in allowed_fields}

    
    if not safe_updates:
        return current_user

    await db.users.update_one(
        {"email": current_user.email},
        {"$set": safe_updates}
    )
    
    updated_user = await db.users.find_one({"email": current_user.email})
    return User(**updated_user)
