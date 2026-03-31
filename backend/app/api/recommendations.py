from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.auth import get_current_user
from app.models.user import User
from app.db.mongodb import get_database

router = APIRouter()

class RiskAssessment(BaseModel):
    age: int
    investment_goal: str # retirement, wealth_growth, safety
    risk_appetite: int # 1 to 10
    time_horizon: int # years

async def perform_analysis(assessment: RiskAssessment, current_user: User, db):
    # Ensure we have a valid user ID (Consistency with finance.py)
    user_id_str = str(current_user.id) if current_user.id else current_user.email
    
    # 1. Determine Risk Category
    risk_score = assessment.risk_appetite
    if assessment.time_horizon < 3:
        risk_score -= 2 # Lower risk for short term
    
    category = "Conservative"
    allocation = {"Bonds": 70, "Cash": 20, "Stocks": 10}
    returns = "3.2% - 4.8%"
    
    if risk_score > 7:
        category = "Aggressive"
        allocation = {"Stocks": 80, "Crypto": 10, "Bonds": 10}
        returns = "11.5% - 18.2%"
    elif risk_score >= 4:
        category = "Moderate"
        allocation = {"Stocks": 50, "Bonds": 40, "Real Estate": 10}
        returns = "7.4% - 10.1%"

    # 2. FIRE & Wealth Roadmap Integration
    finance_collection = db.get_collection("finance")
    latest_finance = await finance_collection.find_one(
        {"user_id": user_id_str},
        sort=[("date", -1)]
    )

    fire_projection = {}
    expense_tips = []
    roadmap = []

    if latest_finance:
        monthly_income = latest_finance.get("monthly_income", 0)
        monthly_expenses = latest_finance.get("monthly_expenses", 0)
        monthly_savings = monthly_income - monthly_expenses
        current_savings = latest_finance.get("total_savings", 0)
        
        # --- 2.1 Expense Audit ---
        expense_list = latest_finance.get("expenses", [])
        for exp in expense_list:
            amt = exp.get("amount", 0)
            cat = exp.get("category", "Other").lower()
            if amt > (monthly_income * 0.2) and monthly_income > 0:
                expense_tips.append({
                    "category": cat,
                    "tip": f"Your {cat} spending is high (>20% of income). Consider switching to a budget plan or finding cheaper alternatives."
                })
        
        if not expense_tips and monthly_expenses > 0:
            expense_tips.append({"category": "General", "tip": "Your spending is balanced. Consider automating a 'pay yourself first' transfer to savings."})

        # --- 2.2 Growth Roadmap (1, 5, 10 Years) ---
        annual_rates = {"Conservative": 0.03, "Moderate": 0.06, "Aggressive": 0.10}
        r = annual_rates.get(category, 0.05) / 12
        
        for years in [1, 5, 10]:
            n = years * 12
            projected = current_savings * (1 + r)**n + monthly_savings * (((1 + r)**n - 1) / r) if r > 0 else (current_savings + monthly_savings * n)
            roadmap.append({
                "period": f"{years} Year{'s' if years > 1 else ''}",
                "projected_wealth": round(max(0, projected), 2),
                "suggestion": "Buy Index Funds" if years >= 5 else "High Yield Savings"
            })

        # --- 2.3 FIRE Calculation ---
        net_return = 0.04 / 12
        annual_expenses = monthly_expenses * 12
        fire_number = annual_expenses * 25
        
        years_to_fire = "30+"
        if fire_number > 0 and current_savings >= fire_number:
            years_to_fire = 0
        elif monthly_savings > 0 and fire_number > 0:
            for n in range(1, 481): 
                projected = current_savings * (1 + net_return)**n + monthly_savings * (((1 + net_return)**n - 1) / net_return)
                if projected >= fire_number:
                    years_to_fire = round(n / 12, 1)
                    break
        
        fire_projection = {
            "fire_number": fire_number,
            "current_progress": round((current_savings / fire_number) * 100, 1) if fire_number > 0 else 0,
            "years_to_freedom": years_to_fire,
            "monthly_contribution": monthly_savings
        }

    # 3. Dynamic Suggestions
    alternative_assets = []
    
    country = getattr(current_user, "country", "United States")
    employment_type = getattr(current_user, "employment_type", "Private Sector")
    
    local_pension = "401(k) / IRA"
    
    # 1. Define localized pensions
    if employment_type == "Government":
        local_pension = "Government Pension Scheme"
    elif employment_type == "Business Owner":
        local_pension = "Reinvesting in Business Growth"
    elif employment_type == "Freelancer/Daily Wage":
        local_pension = "High-Yield Fixed Deposits / Liquid Funds"
    else:
        # Private Sector / Default
        if country == "Sri Lanka":
            local_pension = "EPF / ETF (Provident Funds)"
        elif country == "United Kingdom":
            local_pension = "Workplace Pension / SIPP"
        elif country == "Australia":
            local_pension = "Superannuation Guarantee"
        elif country == "India":
            local_pension = "EPFO / PPF"
        elif country == "Canada":
            local_pension = "RRSP / TFSA"
        else:
            local_pension = "401(k) / IRA"
            
    # 2. Define platforms
    if country == "Sri Lanka":
        cons_plats = ["Local Top-Tier Banks", "Gov Securities"]
        mod_plats = ["Local Stock Exchange (CSE)", "Unit Trusts"]
        agg_plats = ["International Brokers", "Crypto Exchanges"]
    elif country == "United Kingdom":
        cons_plats = ["Premium Bonds", "High Street Banks"]
        mod_plats = ["Hargreaves Lansdown", "Vanguard UK"]
        agg_plats = ["Trading 212", "Coinbase UK"]
    elif country == "Australia":
        cons_plats = ["Term Deposits", "Government Bonds"]
        mod_plats = ["CommSec", "Vanguard Australia"]
        agg_plats = ["Interactive Brokers", "CoinSpot"]
    elif country == "India":
        cons_plats = ["Fixed Deposits (FD)", "Post Office Schemes"]
        mod_plats = ["Zerodha", "Groww"]
        agg_plats = ["WazirX", "Interactive Brokers India"]
    elif country == "Canada":
        cons_plats = ["GICs", "Big Five Banks"]
        mod_plats = ["Wealthsimple", "Questrade"]
        agg_plats = ["Interactive Brokers Canada", "Newton Crypto"]
    else: # US DEFAULT
        cons_plats = ["Vanguard", "Local Bank CD"]
        mod_plats = ["Fidelity", "Robinhood"]
        agg_plats = ["Coinbase (Crypto)", "Interactive Brokers"]

    if category == "Conservative":
        alternative_assets = ["Physical Gold (Safety)", "Government Bonds", local_pension]
        platforms = cons_plats
        sectors = ["Utilities", "Consumer Staples"]
    elif category == "Moderate":
        alternative_assets = ["Gold ETFs", "Real Estate (REITs)", local_pension]
        platforms = mod_plats
        sectors = ["Technology", "Healthcare"]
    else: # Aggressive
        alternative_assets = ["Digital Gold/Bitcoin", "Venture Capital Funds", local_pension]
        platforms = agg_plats
        sectors = ["AI & Robotics", "Green Energy"]

    return {
        "category": category,
        "allocation": allocation,
        "projected_returns": returns,
        "fire_projection": fire_projection,
        "expense_tips": expense_tips,
        "roadmap": roadmap,
        "alternatives": alternative_assets,
        "platforms": platforms,
        "sectors": sectors,
        "advice": f"As a {category.lower()} investor, your roadmap prioritizes {sectors[0]} and {alternative_assets[0]} for optimal growth."
    }

@router.post("/analyze")
async def analyze_profile(assessment: RiskAssessment, current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_id_str = str(current_user.id) if current_user.id else current_user.email

    # 0. Save Profile Persistence
    risk_collection = db.get_collection("risk_profiles")
    await risk_collection.update_one(
        {"user_id": user_id_str},
        {"$set": {
            "user_id": user_id_str,
            "age": assessment.age,
            "investment_goal": assessment.investment_goal,
            "risk_appetite": assessment.risk_appetite,
            "time_horizon": assessment.time_horizon
        }},
        upsert=True
    )

    return await perform_analysis(assessment, current_user, db)


@router.get("/profile")
async def get_latest_profile(current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_id_str = str(current_user.id) if current_user.id else current_user.email
    
    risk_collection = db.get_collection("risk_profiles")
    profile = await risk_collection.find_one({"user_id": user_id_str})
    if not profile:
        return None
    
    # Convert ObjectId
    profile["id"] = str(profile["_id"])
    del profile["_id"]
    return profile

@router.get("/analyze")
async def get_analysis(current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_id_str = str(current_user.id) if current_user.id else current_user.email
    
    risk_collection = db.get_collection("risk_profiles")
    profile = await risk_collection.find_one({"user_id": user_id_str})
    
    if not profile:
        # Default assessment if none exists
        assessment = RiskAssessment(age=30, investment_goal="wealth_growth", risk_appetite=5, time_horizon=10)
    else:
        # Pydantic v2 compatible dict to model
        assessment = RiskAssessment(
            age=profile.get("age", 30),
            investment_goal=profile.get("investment_goal", "wealth_growth"),
            risk_appetite=profile.get("risk_appetite", 5),
            time_horizon=profile.get("time_horizon", 10)
        )
    
    # Run the same analysis logic
    return await perform_analysis(assessment, current_user, db)




