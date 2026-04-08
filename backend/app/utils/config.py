# Global Financial Configuration by Country
COUNTRY_CONFIG = {
    "Sri Lanka": {
        "Private Sector": 0.163, # 12% EPF + 3% ETF indexed to Net
        "Government Sector": 0.075, # WNOP Security Factor
        "currency": "LKR",
        "symbol": "රු"
    },
    "United States": {
        "default": 0.10, # SS (6.2%) + Estimated 401k match avg
        "currency": "USD",
        "symbol": "$"
    },
    "India": {
        "default": 0.12, # EPF Employer Share
        "currency": "INR",
        "symbol": "₹"
    },
    "Australia": {
        "default": 0.11, # Superannuation Guarantee
        "currency": "AUD",
        "symbol": "A$"
    },
    "United Kingdom": {
        "default": 0.03, # Workplace Pension Employer Min
        "currency": "GBP",
        "symbol": "£"
    },
    "Canada": {
        "default": 0.0595, # CPP Employer Share
        "currency": "CAD",
        "symbol": "C$"
    }
}
