# Specialized Sri Lankan Financial Configuration
# Focused strictly on LKR, EPF, ETF and national interest rates

COUNTRY_CONFIG = {
    "Sri Lanka": {
        "Private Sector": 0.163, # 12% EPF + 3% ETF indexed + nominal social security
        "Government": 0.08, # Pension contribution / W&OP factors
        "Business Owner": 0.00,
        "Freelancer/Daily Wage": 0.00,
        "Student": 0.00,
        "currency": "LKR",
        "symbol": "රු",
        "default": 0.00
    },
    "United States": {
        "default": 0.0765, # Standard FICA
        "currency": "USD",
        "symbol": "$"
    }
}

# Regional Interest Rates for CSE and Banking
LKR_INTEREST_RATES = {
    "Fixed Deposit": 11.5,
    "Treasury Bill": 10.2,
    "Savings Account": 4.5,
    "Unit Trust (Projected)": 14.5
}
