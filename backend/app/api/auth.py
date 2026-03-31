from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from jose import jwt, JOSEError
from app.core import security
from app.core.config import settings
from app.models.user import UserCreate, User, Token, UserInDB
from app.db.mongodb import get_database

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
    
    # Filter allowed updates
    allowed_fields = ["full_name", "country", "employment_type"]
    safe_updates = {k: v for k, v in updates.items() if k in allowed_fields}

    
    if not safe_updates:
        return current_user

    await db.users.update_one(
        {"email": current_user.email},
        {"$set": safe_updates}
    )
    
    updated_user = await db.users.find_one({"email": current_user.email})
    return User(**updated_user)
