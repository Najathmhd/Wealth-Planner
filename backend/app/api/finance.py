from fastapi import APIRouter, Depends, HTTPException, Body
from app.db.mongodb import get_database
from app.models.finance import UserFinance, IncomeSource, ExpenseItem, SavingsGoal, FinanceSaveRequest
from app.api.auth import get_current_user
from app.models.user import User
from app.utils.config import COUNTRY_CONFIG
from app.utils.finance_utils import calculate_money_metrics
from datetime import datetime

router = APIRouter()

@router.post("/save")
async def save_finance_data(
    data: FinanceSaveRequest,
    current_user: User = Depends(get_current_user)
):
    db = await get_database()
    user_id = current_user.email
    finance_collection = db.get_collection("finance")
    
    # Use provided date or fallback to current local date
    current_date = data.date or datetime.now().strftime("%Y-%m-%d")
    
    print(f"Saving finance data for user: {user_id} on {current_date}")
    
    # Calculate totals
    total_income = sum(item.amount for item in data.incomes)
    total_expenses = sum(item.amount for item in data.expenses)
    
    finance_doc = {
        "user_id": user_id,
        "date": current_date,
        "incomes": [i.model_dump() for i in data.incomes],
        "expenses": [e.model_dump() for e in data.expenses],
        "savings_goals": [s.model_dump() for s in data.savings_goals],
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
    user_id = current_user.email
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

    metrics = calculate_money_metrics(current_user.model_dump(), finance_data)
    
    return {
        "total_savings": metrics["total_savings"] * rate,
        "monthly_income": metrics["monthly_income"] * rate,
        "monthly_expenses": metrics["monthly_expenses"] * rate,
        "investment_roi": 12.5,
        "hidden_wealth": round(metrics["hidden_wealth"] * rate, 2),
        "hidden_wealth_label": metrics["hidden_wealth_label"],
        "health_score": metrics["health_score"],
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
    user_id = current_user.email
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
            "total_savings": float(record.get("total_savings") or (float(record.get("monthly_income", 0)) - float(record.get("monthly_expenses", 0)))) * rate,
            "income": float(record.get("monthly_income", 0)) * rate,
            "expenses": float(record.get("monthly_expenses", 0)) * rate,
            "hidden_wealth": round(
                sum(i.get("amount", 0) for i in record.get("incomes", []) if "salary" in i.get("name", "").lower() or "primary" in i.get("name", "").lower()) * 
                COUNTRY_CONFIG.get(country, COUNTRY_CONFIG.get("United States", {})).get(employment_type, COUNTRY_CONFIG.get(country, COUNTRY_CONFIG.get("United States", {})).get("default", 0)) * rate, 
                2
            ),
            "currency": currency
        } for record in history
    ]

@router.get("/latest")
async def get_latest_finance(current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_id = current_user.email
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
