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
            context += f"Risk Appetite: {risk_profile.get('risk_appetite')}/10\n"
            context += f"Investment Goal: {risk_profile.get('investment_goal')}\n"

        prompt = f"""
You are a professional AI Financial Advisor for a Wealth Planning System.
Your goal is to give clear, simple, and practical financial advice based on the user's data.

------------------------
USER PROFILE:
- Country: {country}
- Employment Type: {employment_type}
- Monthly Income: {latest_finance.get('monthly_income') if latest_finance else '0'}
- Monthly Expenses: {latest_finance.get('monthly_expenses') if latest_finance else '0'}
- Total Savings: {latest_finance.get('total_savings') if latest_finance else '0'}
- Hidden Social Security Wealth: {hidden_wealth}
- Risk Appetite: {risk_profile.get('risk_appetite') if risk_profile else '5'}/10
- Financial Goals: {", ".join([f"{g.get('name')} (Target: {g.get('target_amount')})" for g in latest_finance.get('savings_goals', [])]) if latest_finance else 'General Wealth Growth'}
------------------------

IMPORTANT RULES:
1. Use VERY SIMPLE English (easy to understand).
2. Keep answers SHORT and WELL STRUCTURED.
3. Use bullet points (no long paragraphs).
4. Avoid complex financial jargon.
5. Align content properly (no messy formatting).
6. Do NOT give overly long explanations.

------------------------
LOCALIZATION RULES:
Explain values based on the User's Country:
- Sri Lanka: Mention WNOP Pension (Gov) or EPF/ETF (Private).
- India: Mention EPF/PF (Provident Fund) employer contributions. (Multiplier: 0.12)
- USA: Mention Social Security and 401(k). (Multiplier: 0.10)
- Australia: Mention Superannuation Guarantee. (Multiplier: 0.11)
- UK: Mention Workplace Pension. (Multiplier: 0.03)
- Canada: Mention CPP. (Multiplier: 0.0595)

Always explain that 'Hidden Wealth' represents estimated employer contributions that significantly accelerate their FIRE timeline.
- Self-Employed / Freelance: Focus on emergency fund and private pension schemes.

------------------------
INVESTMENT RULES:
- Suggest platforms based on user's country (NOT only USA).
- Examples:
  - Sri Lanka: CSE (Colombo Stock Exchange), Unit Trusts, Bank FDs
  - India: Zerodha, Groww
  - USA: Vanguard, Fidelity
- Always match suggestions with user's risk level:
  - Low Risk (1-3) → Savings, Fixed Deposits
  - Medium Risk (4-7) → Mutual Funds, ETFs
  - High Risk (8-10) → Stocks

------------------------
OUTPUT FORMAT (STRICT):
Use this exact format:

1. Financial Summary
- Income:
- Expenses:
- Savings:

2. Key Advice
- (3 to 5 short bullet points)

3. Investment Suggestions
- (Country-based options)

4. Improvement Tips
- (Simple actionable steps)

------------------------
IMPORTANT:
- Keep response under 150–200 words.
- No long paragraphs.
- Use clean spacing and bullet points.
- Make it look neat and professional.
- Use the currency appropriate for {country}.
- Answer the user's specific query: "{message}"
"""

        # 3. Call Gemini
        response = model.generate_content(prompt)
        
        return {"response": response.text}

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Advisor Connection Error: {str(e)}")
