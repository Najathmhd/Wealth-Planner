from fastapi import APIRouter, Depends, HTTPException, Body
from app.api.auth import get_current_user
from app.models.user import User
from app.db.mongodb import get_database
from app.utils.config import COUNTRY_CONFIG
import google.generativeai as genai
import os
from dotenv import load_dotenv
from pathlib import Path

# Ensure the .env file in the backend folder is loaded correctly
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

router = APIRouter()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-flash-latest')

@router.post("/ask")
async def ask_advisor(
    message: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    try:
        db = await get_database()
        user_id = str(current_user.id) if current_user.id else current_user.email
        
        # 1. Fetch User Context
        finance_collection = db.get_collection("finance")
        latest_finance = await finance_collection.find_one(
            {"user_id": user_id},
            sort=[("date", -1)]
        )
        
        risk_collection = db.get_collection("risk_profiles")
        risk_profile = await risk_collection.find_one({"user_id": user_id})
        
        # 2. Build Context Prompt
        country = getattr(current_user, "country", "United States")
        employment_type = getattr(current_user, "employment_type", "Private Sector")
        
        currencySymbol = "රු"
        if country == "United States": currencySymbol = "$"
        elif country == "United Kingdom": currencySymbol = "£"
        elif country == "Australia": currencySymbol = "A$"
        elif country == "India": currencySymbol = "₹"
        elif country == "Canada": currencySymbol = "C$"
        
        hidden_wealth = 0
        if latest_finance:
            primary_salary = sum(item.get("amount", 0) for item in latest_finance.get("incomes", []) 
                               if "salary" in item.get("name", "").lower() or "primary" in item.get("name", "").lower())
            
            config = COUNTRY_CONFIG.get(country, COUNTRY_CONFIG["United States"])
            multiplier = config.get(employment_type, config.get("default", 0))
            if primary_salary > 0:
                hidden_wealth = primary_salary * multiplier

        context = f"User Name: {current_user.full_name}\n"
        context += f"Country: {country}\n"
        context += f"Employment Type: {employment_type}\n"
        
        if latest_finance:
            context += f"Monthly Income: {latest_finance.get('monthly_income')}\n"
            context += f"Monthly Expenses: {latest_finance.get('monthly_expenses')}\n"
            context += f"Total Savings: {latest_finance.get('total_savings')}\n"
            context += f"Hidden Social Security/Pension Wealth: {hidden_wealth}\n"
            if "savings_goals" in latest_finance and latest_finance["savings_goals"]:
                goals_text = ", ".join([f"{g.get('name')}: {g.get('target_amount')}" for g in latest_finance["savings_goals"]])
                context += f"Savings Goals: {goals_text}\n"
        if risk_profile:
            context = f"Risk Appetite: {risk_profile.get('risk_appetite')}/10\n"
            context += f"Investment Goal: {risk_profile.get('investment_goal')}\n"

        prompt = f"""
You are "LankaWealth AI", a professional Sri Lankan Financial Expert and Wealth Advisor.
Your goal is to provide clear, simple, and practical financial advice tailored exclusively to the Sri Lankan economy.

------------------------
USER PROFILE (SRI LANKA):
- Employment: {employment_type}
- Monthly Income: {currencySymbol}{latest_finance.get('monthly_income') if latest_finance else '0'}
- Monthly Expenses: {currencySymbol}{latest_finance.get('monthly_expenses') if latest_finance else '0'}
- Total Savings: {currencySymbol}{latest_finance.get('total_savings') if latest_finance else '0'}
- EPF/ETF Hidden Wealth: {currencySymbol}{hidden_wealth}
- Risk Appetite: {risk_profile.get('risk_appetite') if risk_profile else '5'}/10
- Financial Goals: {", ".join([f"{g.get('name')} (Target: {currencySymbol}{g.get('target_amount')})" for g in latest_finance.get('savings_goals', [])]) if latest_finance else 'General Wealth Growth'}
------------------------

STRICT ADVISORY RULES:
1. CURRENCY: Always use LKR (රු) for all financial values.
2. ECONOMY: Speak specifically about the Sri Lankan market (Colombo Stock Exchange, Central Bank rates).
3. INSTRUMENTS: Regularly mention:
   - EPF/ETF contributions (Crucial for retirement).
   - National Savings Bank (NSB) and Government Bonds.
   - Unit Trusts (e.g., CAL, First Capital).
   - Blue-chip CSE stocks (JKH, SAMP, LOLC).
4. STYLE: Use bullet points, keep answers SHORT (under 200 words), and avoid jargon.

OUTPUT FORMAT:
1. Financial Summary (LKR)
2. Sri Lankan Wealth Advice (3-5 points)
3. Local Investment Options (Banks/CSE/Unit Trusts)
4. Actionable Steps for {current_user.full_name}

{message}
"""

        # 3. Call Gemini
        response = model.generate_content(prompt)
        
        return {"response": response.text}

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Advisor Connection Error: {str(e)}")
