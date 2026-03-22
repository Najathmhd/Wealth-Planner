import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime

# Robust path handling
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

def log_to_file(msg):
    with open("test_results.txt", "a") as f:
        f.write(str(msg) + "\n")

# Clear previous results
if os.path.exists("test_results.txt"):
    os.remove("test_results.txt")

log_to_file("--- STARTING TEST ---")

try:
    from ml.model import train_and_predict
    log_to_file("SUCCESS: Imported ml.model")
except Exception as e:
    log_to_file(f"FAILED: Import ml.model error: {e}")

def test_stock_prediction():
    log_to_file("\n--- Testing Stock Prediction Logic ---")
    dates = pd.date_range(end=datetime.now(), periods=100)
    prices = np.random.uniform(100, 200, 100)
    hist_data = pd.DataFrame({"Close": prices}, index=dates)
    
    try:
        from ml.model import train_and_predict
        results = train_and_predict(hist_data, days=5)
        log_to_file(f"SUCCESS: Generated {len(results)} predictions.")
    except Exception as e:
        log_to_file(f"FAILED: Stock prediction error: {e}")

def test_gemini_init():
    log_to_file("\n--- Testing Gemini Initialization ---")
    try:
        from google import genai
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            log_to_file("FAILED: GEMINI_API_KEY not found in .env")
            return
        
        client = genai.Client(api_key=api_key)
        log_to_file(f"SUCCESS: Gemini client initialized with model='gemini-2.0-flash'.")
    except Exception as e:
        log_to_file(f"FAILED: Gemini init error: {e}")

if __name__ == "__main__":
    test_stock_prediction()
    test_gemini_init()
    log_to_file("\n--- TESTS COMPLETED ---")
