from app.utils.config import COUNTRY_CONFIG

def calculate_money_metrics(user_doc: dict, finance_doc: dict = None):
    """
    Centralized logic to calculate Hidden Wealth, Health Score, and Labels.
    Ensures consistency between User and Admin dashboards.
    """
    country = user_doc.get("country", "Sri Lanka")
    employment_type = user_doc.get("employment_type", "Private Sector")
    
    # 1. Hidden Wealth Calculation
    country_cfg = COUNTRY_CONFIG.get(country, COUNTRY_CONFIG.get("Sri Lanka", {}))
    multiplier = country_cfg.get(employment_type, country_cfg.get("default", 0))
    
    hidden_wealth = 0
    monthly_income = 0
    monthly_expenses = 0
    total_savings = 0
    
    if finance_doc:
        incomes = finance_doc.get("incomes", [])
        primary_salary = sum(item.get("amount", 0) for item in incomes 
                           if "salary" in item.get("name", "").lower() or "primary" in item.get("name", "").lower())
        hidden_wealth = primary_salary * multiplier
        
        monthly_income = float(finance_doc.get("monthly_income", 0))
        monthly_expenses = float(finance_doc.get("monthly_expenses", 0))
        total_savings = float(finance_doc.get("total_savings", 0))

    # 2. Health Score Calculation
    monthly_savings = monthly_income - monthly_expenses + hidden_wealth
    savings_rate = (monthly_savings / monthly_income) if monthly_income > 0 else 0
    
    # Base score from savings rate
    health_score = min(100, max(10, int(savings_rate * 250)))
    
    # Penalty for high expense ratio
    if monthly_expenses > (monthly_income * 0.7) and monthly_income > 0:
        health_score -= 15
        
    health_score = min(100, max(0, health_score))

    # 3. Sector-Specific Labels
    label = "Automated Savings"
    if "government" in employment_type.lower():
        label = "Pension Savings"
    elif "private" in employment_type.lower():
        label = "EPF/ETF Savings"
    elif "business" in employment_type.lower() or "freelancer" in employment_type.lower():
        label = "Self-Managed Savings"
    elif multiplier == 0:
        label = "No Automated Savings"

    return {
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "total_savings": total_savings,
        "hidden_wealth": round(hidden_wealth, 2),
        "hidden_wealth_label": label,
        "health_score": health_score,
        "monthly_savings": monthly_savings
    }
