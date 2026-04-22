from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.db.mongodb import get_database
from app.api.auth import get_current_user
from app.models.user import User
from app.utils.config import COUNTRY_CONFIG
from app.utils.finance_utils import calculate_money_metrics

router = APIRouter()

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this endpoint"
        )
    return current_user

@router.get("/users")
async def get_admin_users(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD or ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD or ISO format)"),
    employment_type: Optional[str] = Query(None, description="Type of employment"),
    admin_user: User = Depends(get_current_admin_user)
):
    db = await get_database()
    
    # Build filter query for users
    filter_query = {}
    if employment_type and employment_type != "All":
        filter_query["employment_type"] = employment_type

    # Fetch all matching users
    cursor = db.users.find(filter_query)
    users = await cursor.to_list(length=1000)
    
    results = []
    for u in users:
        # Determine created_at for filtering
        created_at_dt = None
        if "created_at" in u and u["created_at"]:
            try:
                created_at_dt = datetime.fromisoformat(u["created_at"].replace("Z", "+00:00"))
            except ValueError:
                pass
        
        if not created_at_dt and "_id" in u:
            created_at_dt = u["_id"].generation_time
            
        # Process Date Filtering
        if start_date and created_at_dt:
            try:
                sd = datetime.fromisoformat(start_date.replace("Z", "+00:00")).replace(tzinfo=created_at_dt.tzinfo)
                if created_at_dt < sd:
                    continue
            except ValueError:
                pass
                
        if end_date and created_at_dt:
            try:
                ed = datetime.fromisoformat(end_date.replace("Z", "+00:00")).replace(tzinfo=created_at_dt.tzinfo)
                if created_at_dt > ed:
                    continue
            except ValueError:
                pass
        
        user_id_str = str(u["_id"])
        user_email = u.get("email")
        
        # Fetch financial mapping - Try email then fallback to ID
        finance = await db.get_collection("finance").find_one({"user_id": user_email}, sort=[("date", -1)])
        if not finance:
            finance = await db.get_collection("finance").find_one({"user_id": user_id_str}, sort=[("date", -1)])
            
        # Fetch risk profile if any
        risk_profile = await db.risk_profiles.find_one({"user_id": user_email})
        if not risk_profile:
            risk_profile = await db.risk_profiles.find_one({"user_id": user_id_str})

        # Calculate Consistent Money Metrics
        metrics = calculate_money_metrics(u, finance)
        hidden_wealth = metrics["hidden_wealth"]
        health_score = metrics["health_score"]

        # Map Risk Category for visual consistency
        risk_category = "N/A"
        if risk_profile:
            raw_score = risk_profile.get("risk_appetite", 5)
            # Duplicate logic from recommendations.py for consistency
            calc_score = raw_score
            
            if calc_score > 7: risk_category = "Aggressive"
            elif calc_score >= 4: risk_category = "Moderate"
            else: risk_category = "Conservative"
        
        user_country = u.get("country", "United States")
        user_employment = u.get("employment_type", "Private Sector")

        results.append({
            "id": user_id_str,
            "email": u.get("email"),
            "full_name": u.get("full_name"),
            "role": u.get("role"),
            "last_login": u.get("last_login"),
            "country": user_country,
            "employment_type": user_employment,
            "created_at": created_at_dt.isoformat() if created_at_dt else None,
            "is_active": u.get("is_active", True),
            "savings_goals_count": len(finance.get("savings_goals", [])) if finance else 0,
            "financials": {
                "total_savings": metrics["total_savings"],
                "monthly_income": metrics["monthly_income"],
                "monthly_expenses": metrics["monthly_expenses"],
                "hidden_wealth": metrics["hidden_wealth"],
                "health_score": metrics["health_score"]
            },
            "risk_profile": {
                "age": risk_profile.get("age", "N/A"),
                "investment_goal": risk_profile.get("investment_goal", "N/A"),
                "risk_appetite": risk_profile.get("risk_appetite", "N/A"),
                "risk_category": risk_category
            } if risk_profile else None
        })
        
    total_portfolios = sum(1 for res in results if res["risk_profile"] is not None)
    total_savings_goals = sum(res["savings_goals_count"] for res in results)

    return {
        "users": results, 
        "metrics": {
            "total_portfolios": total_portfolios, 
            "total_savings_goals": total_savings_goals
        }
    }


@router.put("/users/{user_id}/status")
async def update_user_status(user_id: str, payload: dict = Body(...), admin_user: User = Depends(get_current_admin_user)):
    is_active = payload.get("is_active")
    if is_active is None:
        raise HTTPException(status_code=400, detail="is_active field required")
        
    db = await get_database()
    
    query = {"_id": user_id}
    try:
        if len(user_id) == 24:
            query = {"_id": ObjectId(user_id)}
    except:
        pass
        
    res = await db.users.update_one(query, {"$set": {"is_active": bool(is_active)}})
    if res.matched_count == 0:
        # Fallback to string match
        res = await db.users.update_one({"_id": user_id}, {"$set": {"is_active": bool(is_active)}})
        
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": f"User status updated to {'Active' if is_active else 'Suspended'}"}
    
@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, payload: dict = Body(...), admin_user: User = Depends(get_current_admin_user)):
    role = payload.get("role")
    if role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'user'")
        
    db = await get_database()
    
    query = {"_id": user_id}
    try:
        if len(user_id) == 24:
            query = {"_id": ObjectId(user_id)}
    except:
        pass
        
    res = await db.users.update_one(query, {"$set": {"role": role}})
    if res.matched_count == 0:
        res = await db.users.update_one({"_id": user_id}, {"$set": {"role": role}})
        
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": f"User role updated to {role}"}

from app.models.user import UserCreate
from app.core import security

@router.post("/users")
async def create_user_admin(user: UserCreate, admin_user: User = Depends(get_current_admin_user)):
    db = await get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already universally registered.")
        
    hashed_password = security.get_password_hash(user.password)
    user_in_db = user.model_dump()
    user_in_db["hashed_password"] = hashed_password
    user_in_db["created_at"] = datetime.utcnow().isoformat()
    del user_in_db["password"]
    
    # Enforce active
    user_in_db["is_active"] = True
    
    await db.users.insert_one(user_in_db)
    return {"message": "User provisioned successfully", "email": user.email}

@router.put("/users/{user_id}/details")
async def update_user_details_admin(user_id: str, payload: dict = Body(...), admin_user: User = Depends(get_current_admin_user)):
    db = await get_database()
    
    query = {"_id": user_id}
    try:
        if len(user_id) == 24:
            query = {"_id": ObjectId(user_id)}
    except:
        pass
        
    allowed_keys = ["full_name", "employment_type"]
    update_data = {k: v for k, v in payload.items() if k in allowed_keys}
    
    if update_data:
        res = await db.users.update_one(query, {"$set": update_data})
        if res.matched_count == 0:
            res = await db.users.update_one({"_id": user_id}, {"$set": update_data})
            if res.matched_count == 0:
                raise HTTPException(status_code=404, detail="User not found")
                
    return {"message": "User details synchronized successfully"}

@router.delete("/users/{user_id}")
async def delete_user_admin(user_id: str, admin_user: User = Depends(get_current_admin_user)):
    db = await get_database()
    # 1. Find user first to get email for cascade scrub
    query = {"_id": user_id}
    try:
        if len(user_id) == 24:
            query = {"_id": ObjectId(user_id)}
    except: pass
    
    target_user = await db.users.find_one(query)
    if not target_user:
        target_user = await db.users.find_one({"_id": user_id})
        
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_email = target_user.get("email")
    user_id_str = str(user_id)
        
    # 2. Delete the user document
    res = await db.users.delete_one({"_id": target_user["_id"]})
            
    # 3. CRITICAL: Cascade Delete "Hard Scrub" Implementation
    # Delete from finance and risk_profiles by BOTH ID and email
    if user_email:
        await db.get_collection("finance").delete_many({"user_id": user_email})
        await db.risk_profiles.delete_many({"user_id": user_email})
    
    await db.get_collection("finance").delete_many({"user_id": user_id_str})
    await db.risk_profiles.delete_many({"user_id": user_id_str})
    
    print(f"DEBUG: Delete SUCCESS for {user_email if user_email else user_id_str}")
    return {"message": "Execution successful. Data cascade initialized and scrubbed."}
