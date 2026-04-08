from fastapi import APIRouter, Depends, HTTPException, Body
from app.db.mongodb import get_database
from app.models.finance import UserFinance, IncomeSource, ExpenseItem, SavingsGoal
from app.api.auth import get_current_user
from app.models.user import User
from app.utils.config import COUNTRY_CONFIG

router = APIRouter()

@router.post("/save")
async def save_finance_data(
    incomes: list[IncomeSource] = Body(...),
    expenses: list[ExpenseItem] = Body(...),
    savings_goals: list[SavingsGoal] = Body(...),
    current_user: User = Depends(get_current_user)
):
    db = await get_database()
    user_id = str(current_user.id) if current_user.id else current_user.email
    finance_collection = db.get_collection("finance")
    
    print(f"Saving finance data for user: {user_id}")
    
    # Calculate totals
    total_income = sum(item.amount for item in incomes)
    total_expenses = sum(item.amount for item in expenses)
    
    from datetime import datetime
    current_date = datetime.now().strftime("%Y-%m-%d")

    finance_doc = {
        "user_id": user_id,
        "date": current_date,
        "incomes": [i.model_dump() for i in incomes],
        "expenses": [e.model_dump() for e in expenses],
        "savings_goals": [s.model_dump() for s in savings_goals],
        "monthly_income": total_income,
        "monthly_expenses": total_expenses,
        "total_savings": total_income - total_expenses
    }

    existing_today = await finance_collection.find_one({
        "user_id": user_id,
        "date": current_date
    })

    if existing_today:
        await finance_collection.update_one(
            {"_id": existing_today["_id"]},
            {"$set": finance_doc}
        )
        print(f"Updated existing record for {current_date}")
    else:
        await finance_collection.insert_one(finance_doc)
        print(f"Inserted new record for {current_date}")
    
    return {"status": "Finance data saved successfully", "date": current_date}

@router.get("/summary")
async def get_finance_summary(currency: str = "USD", current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_id = str(current_user.id) if current_user.id else current_user.email
    finance_collection = db.get_collection("finance")
    
    finance_data = await finance_collection.find_one(
        {"user_id": user_id},
        sort=[("date", -1)]
    )

    # Conversion Rates (Mock API for demo, can be expanded to real FX API)
    rates = {"USD": 1.0, "LKR": 300.0, "EUR": 0.92}
    rate = rates.get(currency.upper(), 1.0)

    if not finance_data:
        return {
            "total_savings": 0.0,
            "monthly_income": 0.0,
            "monthly_expenses": 0.0,
            "investment_roi": 0.0,
            "currency": currency
        }

    # Calculate Universal Localized Hidden Wealth
    country = getattr(current_user, "country", "United States")
    employment_type = getattr(current_user, "employment_type", "Private Sector")
    
    hidden_wealth = 0
    primary_salary = sum(item.get("amount", 0) for item in finance_data.get("incomes", []) 
                       if "salary" in item.get("name", "").lower() or "primary" in item.get("name", "").lower())
    
    config = COUNTRY_CONFIG.get(country, COUNTRY_CONFIG["United States"])
    multiplier = config.get(employment_type, config.get("default", 0))
    
    if primary_salary > 0:
        hidden_wealth = primary_salary * multiplier

    # High-level Health Score for Dashboard (Simplified from Recommendations)
    monthly_income = float(finance_data.get("monthly_income", 0.0))
    monthly_expenses = float(finance_data.get("monthly_expenses", 0.0))
    monthly_savings = monthly_income - monthly_expenses + hidden_wealth
    
    savings_rate = (monthly_savings / monthly_income) if monthly_income > 0 else 0
    health_score = min(100, max(10, int(savings_rate * 250)))
    if monthly_expenses > (monthly_income * 0.7): health_score -= 15
    health_score = min(100, max(0, health_score))

    return {
        "total_savings": float(finance_data.get("total_savings", 0.0)) * rate,
        "monthly_income": monthly_income * rate,
        "monthly_expenses": monthly_expenses * rate,
        "investment_roi": 12.5,
        "hidden_wealth": round(hidden_wealth * rate, 2),
        "health_score": health_score,
        "currency": currency
    }

@router.get("/convert")
async def convert_currency(amount: float, from_curr: str = "USD", to_curr: str = "LKR"):
    # Simple conversion logic (Advanced Feature 5)
    rates = {"USD": 1.0, "LKR": 300.0, "EUR": 0.92}
    try:
        usd_amount = amount / rates[from_curr.upper()]
        converted = usd_amount * rates[to_curr.upper()]
        return {"converted_amount": round(converted, 2), "currency": to_curr.upper()}
    except KeyError:
        raise HTTPException(status_code=400, detail="Unsupported currency")

@router.get("/history")
async def get_finance_history(currency: str = "USD", current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_id = str(current_user.id) if current_user.id else current_user.email
    finance_collection = db.get_collection("finance")
    
    rates = {"USD": 1.0, "LKR": 300.0, "EUR": 0.92}
    rate = rates.get(currency.upper(), 1.0)

    cursor = finance_collection.find({"user_id": user_id}).sort("date", 1).limit(12)
    history = await cursor.to_list(length=12)
    
    country = getattr(current_user, "country", "United States")
    employment_type = getattr(current_user, "employment_type", "Private Sector")

    return [
        {
            "date": record.get("date"),
            "total_savings": float(record.get("total_savings", 0)) * rate,
            "income": float(record.get("monthly_income", 0)) * rate,
            "expenses": float(record.get("monthly_expenses", 0)) * rate,
            "hidden_wealth": round((sum(item.get("amount", 0) for item in record.get("incomes", []) 
                                     if "salary" in item.get("name", "").lower() or "primary" in item.get("name", "").lower()) * 
                                     COUNTRY_CONFIG.get(country, COUNTRY_CONFIG["United States"]).get(employment_type, COUNTRY_CONFIG.get(country, COUNTRY_CONFIG["United States"]).get("default", 0)) * rate), 2),
            "currency": currency
        } for record in history
    ]

@router.get("/latest")
async def get_latest_finance(current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_id = str(current_user.id) if current_user.id else current_user.email
    finance_collection = db.get_collection("finance")
    
    print(f"Fetching latest data for user: {user_id}")
    finance_data = await finance_collection.find_one(
        {"user_id": user_id},
        sort=[("date", -1)]
    )

    if not finance_data:
        return {
            "incomes": [],
            "expenses": [],
            "savings_goals": [],
            "date": None
        }

    finance_data["id"] = str(finance_data["_id"])
    del finance_data["_id"]
    return finance_data
