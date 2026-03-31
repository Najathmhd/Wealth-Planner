from fastapi import APIRouter, Depends, HTTPException, Body
from app.api.auth import get_current_user
from app.models.user import User
from app.db.mongodb import get_database
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
        context = f"User Name: {current_user.full_name}\n"
        country = getattr(current_user, "country", "United States")
        employment_type = getattr(current_user, "employment_type", "Private Sector")
        context += f"Country: {country}\n"
        context += f"Employment Type: {employment_type}\n"
        
        if latest_finance:
            context += f"Monthly Income: {latest_finance.get('monthly_income')}\n"
            context += f"Monthly Expenses: {latest_finance.get('monthly_expenses')}\n"
            context += f"Total Savings: {latest_finance.get('total_savings')}\n"
            if "savings_goals" in latest_finance and latest_finance["savings_goals"]:
                goals_text = ", ".join([f"{g.get('name')}: {g.get('target_amount')}" for g in latest_finance["savings_goals"]])
                context += f"Savings Goals: {goals_text}\n"
        
        if risk_profile:
            context += f"Risk Appetite: {risk_profile.get('risk_appetite')}/10\n"
            context += f"Investment Goal: {risk_profile.get('investment_goal')}\n"

        prompt = f"""
        You are an expert AI Financial Advisor for the 'Wealth Planning System'. 
        Below is the user's financial profile:
        {context}
        
        User Question: "{message}"
        
        Guidelines:
        - Be professional, encouraging, and data-driven.
        - CRITICAL: Provide highly localized advice specific to their Country ({country}) and Employment Type ({employment_type}). Ensure currency matches their country.
        - If Sri Lanka and Private Sector, mention EPF/ETF. If Government, mention Government Pension Scheme. If Freelance/Daily Wage, focus on emergency funds and liquid savings. Adapt appropriately for other countries' equivalents.
        - Analyze and reference their savings goals in detail if they ask about optimization or FIRE plans. Make sure to suggest a proper timeline to achieve these specific goal amounts.
        - If they ask about buying something, compare it to their savings or expenses.
        - Give specific advice based on their risk appetite.
        - Keep responses concise but highly structured (use lists and bullet points).
        """

        # 3. Call Gemini
        response = model.generate_content(prompt)
        
        return {"response": response.text}

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Advisor Connection Error: {str(e)}")
