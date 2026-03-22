from fastapi import APIRouter, Depends, HTTPException, Body
from db.mongodb import get_database
from models.finance import UserFinance, IncomeSource, ExpenseItem, SavingsGoal
from routes.auth import get_current_user
from models.user import User

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

    return {
        "total_savings": float(finance_data.get("total_savings", 0.0)) * rate,
        "monthly_income": float(finance_data.get("monthly_income", 0.0)) * rate,
        "monthly_expenses": float(finance_data.get("monthly_expenses", 0.0)) * rate,
        "investment_roi": 12.5,
        "currency": currency
    }

@router.get("/convert")
async def convert_currency(amount: float, from_curr: str = "USD", to_curr: str = "LKR"):
    # Advanced Feature 5: Real-Time Currency Conversion
    import httpx
    
    url = f"https://api.exchangerate-api.com/v4/latest/{from_curr.upper()}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                rate = data['rates'].get(to_curr.upper())
                if rate:
                    converted = amount * rate
                    return {
                        "converted_amount": round(converted, 2), 
                        "rate": rate,
                        "currency": to_curr.upper(),
                        "source": "Real-Time API"
                    }
    except Exception as e:
        print(f"Currency API Error: {e}")
        # Fallback to mock if API fails
        pass

    # Fallback Logic
    rates = {"USD": 1.0, "LKR": 300.0, "EUR": 0.92, "GBP": 0.79}
    base_rate = rates.get(from_curr.upper(), 1.0)
    target_rate = rates.get(to_curr.upper(), 1.0)
    
    # Convert properly via USD base if needed, simplified mock assumption
    # Here assuming rates are relative to base 1.0 (USD)
    # If from=USD (1), to=LKR (300) -> 1 * 300 / 1 = 300
    # If from=LKR (300), to=USD (1) -> 1 * 1 / 300 = 0.0033
    
    conversion_rate = target_rate / base_rate
    converted = amount * conversion_rate
    
    return {
        "converted_amount": round(converted, 2), 
        "rate": round(conversion_rate, 4),
        "currency": to_curr.upper(),
        "source": "Mock (Fallback)"
    }

@router.get("/history")
async def get_finance_history(currency: str = "USD", current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_id = str(current_user.id) if current_user.id else current_user.email
    finance_collection = db.get_collection("finance")
    
    rates = {"USD": 1.0, "LKR": 300.0, "EUR": 0.92}
    rate = rates.get(currency.upper(), 1.0)

    cursor = finance_collection.find({"user_id": user_id}).sort("date", 1).limit(12)
    history = await cursor.to_list(length=12)
    
    return [
        {
            "date": record.get("date"),
            "total_savings": float(record.get("total_savings", 0)) * rate,
            "income": float(record.get("monthly_income", 0)) * rate,
            "expenses": float(record.get("monthly_expenses", 0)) * rate,
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
