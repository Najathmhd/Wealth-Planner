from fastapi import APIRouter, Depends, HTTPException, Body
from routes.auth import get_current_user
from models.user import User
from db.mongodb import get_database
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
GEMINI_MODEL = "gemini-1.5-flash"
model = genai.GenerativeModel(GEMINI_MODEL)
print(f"DEBUG: chat.py loaded with model='{GEMINI_MODEL}'")

@router.post("/ask")
async def ask_advisor(
    message: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    try:
        db = await get_database()
        user_id = str(current_user.id) if current_user.id else current_user.email
        
        # DEBUG LOGGING
        print(f"DEBUG: Current User ID: {user_id}")
        print(f"DEBUG: Current User Object: {current_user}")
        if hasattr(current_user, '__dict__'):
            print(f"DEBUG: User Dict: {current_user.__dict__}")
        
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
        
        if latest_finance:
            income = latest_finance.get('monthly_income', 0)
            expenses = latest_finance.get('monthly_expenses', 0)
            savings = latest_finance.get('total_savings', 0)
            
            savings_rate = round((income - expenses) / income * 100, 1) if income > 0 else 0
            fire_number = expenses * 12 * 25
            
            context += f"Monthly Income: ${income}\n"
            context += f"Monthly Expenses: ${expenses}\n"
            context += f"Total Savings: ${savings}\n"
            context += f"Savings Rate: {savings_rate}% (Target: >20%)\n"
            context += f"Estimated FIRE Number: ${fire_number}\n"
        
        if risk_profile:
            context += f"Risk Appetite: {risk_profile.get('risk_appetite')}/10\n"
            context += f"Investment Goal: {risk_profile.get('investment_goal')}\n"

        prompt = f"""
        You are an expert AI Financial Advisor for the 'Wealth Planning System'. 
        Below is the user's financial profile:
        {context}
        
        User Question: "{message}"
        
        Guidelines:
        - Analyze their 'Savings Rate' and 'FIRE Number' to give personalized advice.
        - If savings rate is < 20%, suggest aggressive budgeting.
        - Be encouraging but realistic about their Investment Goals.
        - Keep responses concise (under 3 paragraphs) and use bullet points if needed.
        """

        # 3. Call Gemini
        response = model.generate_content(prompt)
        
        return {"response": response.text}

    except Exception as e:
        print(f"Chat Error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"AI Advisor error: {str(e)}")
