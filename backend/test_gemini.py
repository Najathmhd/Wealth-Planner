import google.generativeai as genai
import os
import sys
from dotenv import load_dotenv

# Redirect all print to a log file
log_file = open("gemini_test.log", "w")
sys.stdout = log_file
sys.stderr = log_file

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("CRITICAL: GEMINI_API_KEY not found in .env")
    sys.exit(1)

genai.configure(api_key=api_key)
print(f"API Key: {api_key[:10]}...")

try:
    print("Listing models...")
    for m in genai.list_models():
        print(f"- {m.name} : {m.supported_generation_methods}")
    print("Done listing.")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")

log_file.close()
