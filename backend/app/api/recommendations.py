from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.auth import get_current_user
from app.models.user import User
from app.db.mongodb import get_database
from app.utils.config import COUNTRY_CONFIG

router = APIRouter()

class RiskAssessment(BaseModel):
    age: int
    investment_goal: str # retirement, wealth_growth, safety
    risk_appetite: int # 1 to 10
    time_horizon: int # years

async def perform_analysis(assessment: RiskAssessment, current_user: User, db):
    # Ensure we have a valid user ID (Consistency with finance.py)
    user_id_str = str(current_user.id) if current_user.id else current_user.email
    
    # 1. Determine local pension name first
    employment_type = getattr(current_user, "employment_type", "Private Sector")
    if employment_type == "Government":
        local_pension = "Pensions Dept (W&OP)"
    elif employment_type == "Business Owner":
        local_pension = "EPF Voluntary"
    elif employment_type == "Freelancer/Daily Wage":
        local_pension = "High-Yield Savings"
    else:
        local_pension = "EPF / ETF (Statutory)"

    # 2. Determine Risk Category
    risk_score = assessment.risk_appetite
    if assessment.time_horizon < 3:
        risk_score -= 2 # Lower risk for short term
    
    category = "Conservative"
    allocation = {local_pension: 50, "LKR Treasury Bills": 30, "High-Yield FDs": 20}
    returns = "8.2% - 10.8%"
    
    if risk_score > 7:
        category = "Aggressive"
        allocation = {"Equities (CSE/Global)": 60, "Digital Assets": 20, local_pension: 20}
        returns = "18.5% - 24.2%"
    elif risk_score >= 4:
        category = "Moderate"
        allocation = {"Unit Trusts": 50, local_pension: 30, "Blue Chip Stocks": 20}
        returns = "12.4% - 15.1%"

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
        
        # --- 2.1 Universal Localized Savings Factor ---
        country = getattr(current_user, "country", "United States")
        employment_type = getattr(current_user, "employment_type", "Private Sector")
        
        hidden_savings = 0
        primary_salary = sum(item.get("amount", 0) for item in latest_finance.get("incomes", []) 
                           if "salary" in item.get("name", "").lower() or "primary" in item.get("name", "").lower())
        
        config = COUNTRY_CONFIG.get(country, COUNTRY_CONFIG["United States"])
        multiplier = config.get(employment_type, config.get("default", 0))
        
        if primary_salary > 0:
            hidden_savings = primary_salary * multiplier
            
        total_monthly_savings = monthly_savings + hidden_savings
        savings_rate = (total_monthly_savings / monthly_income) if monthly_income > 0 else 0
        
        # --- 2.2 Intelligent Scoring & Classification ---
        # Health Score Logic (0-100)
        health_score = min(100, max(10, int(savings_rate * 250))) # 40% savings rate = 100 points
        if monthly_expenses > (monthly_income * 0.7): health_score -= 15
        if current_savings > (monthly_expenses * 6): health_score += 15 # Emergency Fund Bonus
        health_score = min(100, max(0, health_score))
        
        saver_category = "Conservative Saver"
        if savings_rate > 0.30: saver_category = "Hyper-Aggressive Saver"
        elif savings_rate > 0.15: saver_category = "Strategic Saver"
        
        # --- 2.3 Optimization Wisdom ---
        opt_savings_rate = savings_rate + 0.05
        opt_monthly_savings = monthly_income * opt_savings_rate
        
        expense_tips.append({
            "category": "Optimization",
            "tip": f"By increasing your savings by just 5% ({int(monthly_income * 0.05)} {config.get('symbol', '$')}), you accelerate your freedom by approx. {round(12 / (savings_rate + 0.01), 1)} months."
        })

        # --- 2.4 Expense Audit ---
        expense_list = latest_finance.get("expenses", [])
        for exp in expense_list:
            amt = exp.get("amount", 0)
            cat = exp.get("category", "Other").lower()
            if amt > (monthly_income * 0.2) and monthly_income > 0:
                expense_tips.append({
                    "category": cat,
                    "tip": f"Your {cat} spending is high (>20% of income). Saving even 10% here improves your health score by +5."
                })

        # --- 2.5 Growth Roadmap (Comparative Analysis) ---
        annual_rates = {"Conservative": 0.03, "Moderate": 0.06, "Aggressive": 0.10}
        r = annual_rates.get(category, 0.05) / 12
        
        for years in [1, 5, 10]:
            n = years * 12
            # Projection WITH Investment
            projected_inv = current_savings * (1 + r)**n + total_monthly_savings * (((1 + r)**n - 1) / r) if r > 0 else (current_savings + total_monthly_savings * n)
            
            # Projection WITHOUT Investment (Savings Only - Benchmark)
            projected_savings = current_savings + (total_monthly_savings * n)
            
            roadmap.append({
                "period": f"{years} Year{'s' if years > 1 else ''}",
                "projected_wealth": round(max(0, projected_inv), 2),
                "savings_only": round(max(0, projected_savings), 2),
                "opportunity_cost": round(max(0, projected_inv - projected_savings), 2),
                "suggestion": "Buy Index Funds" if years >= 5 else "High Yield Savings"
            })

        # --- 2.6 FIRE Calculation ---
        net_return = 0.04 / 12
        annual_expenses = monthly_expenses * 12
        fire_number = annual_expenses * 25
        
        years_to_fire = "30+"
        if fire_number > 0 and current_savings >= fire_number:
            years_to_fire = 0
        elif total_monthly_savings > 0 and fire_number > 0:
            for n in range(1, 481): 
                projected = current_savings * (1 + net_return)**n + total_monthly_savings * (((1 + net_return)**n - 1) / net_return)
                if projected >= fire_number:
                    years_to_fire = round(n / 12, 1)
                    break
        
        fire_projection = {
            "fire_number": fire_number,
            "current_progress": round((current_savings / fire_number) * 100, 1) if fire_number > 0 else 0,
            "years_to_freedom": years_to_fire,
            "monthly_contribution": total_monthly_savings,
            "savings_rate": round(savings_rate * 100, 1),
            "health_score": health_score,
            "saver_category": saver_category,
            "epf_etf_bonus": round(hidden_savings, 2) if hidden_savings > 0 else 0
        }

    # 3. Dynamic Suggestions (PIVOT: Sri Lanka Only)
    alternative_assets = []
    
    # Define platforms (Sri Lanka Focused)
    cons_plats = ["National Savings Bank (NSB)", "BOC/Sampath Fixed Deposits"]
    mod_plats = ["CAL Unit Trusts", "First Capital", "Colombo Stock Exchange (CSE)"]
    agg_plats = ["International Brokerage (via CAL)", "Softlogic Stockbrokers"]

    if category == "Conservative":
        alternative_assets = ["Physical Gold (Safety)", "LKR Treasury Bills", local_pension]
        platforms = cons_plats
        sectors = ["Utilities", "Consumer Staples"]
        examples = ["Bank Fixed Deposits (FD)", "NSB Savings", "Dividend Stocks (e.g., JKH, DIAL)"]
    elif category == "Moderate":
        alternative_assets = ["Gold Coins", "Sri Lankan Unit Trusts", local_pension]
        platforms = mod_plats
        sectors = ["Banking", "Diversified Holdings"]
        examples = ["Blue Chip Stocks (e.g., JKH, SAMP)", "Income Unit Trusts", "Treasury Bonds"]
    else: # Aggressive
        alternative_assets = ["Digital Assets", "Equity Portfolios", local_pension]
        platforms = agg_plats
        sectors = ["Tech Innovation", "Manufacturing"]
        examples = ["High-Growth Stocks (e.g., LOLC, HAYL)", "CSE Alpha Portfolios", "International ETFs"]

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
        "examples": examples,
        "advice": f"Following Sri Lankan market trends, as a {category.lower()} investor, your roadmap prioritizes {sectors[0]} and {alternative_assets[0]} for optimal local growth."
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

    # Add categorical label for visual synchronization
    raw_score = profile.get("risk_appetite", 5)
    horizon = profile.get("time_horizon", 5)
    calc_score = raw_score
    if horizon < 3: calc_score -= 2
    
    if calc_score > 7: profile["risk_category"] = "Aggressive"
    elif calc_score >= 4: profile["risk_category"] = "Moderate"
    else: profile["risk_category"] = "Conservative"

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




