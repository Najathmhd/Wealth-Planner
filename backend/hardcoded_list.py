import google.generativeai as genai
import sys

# Hardcoded key for debugging (temporary)
# Use your new AIza key here for this test script ONLY
api_key = "AIzaSyBUfhJIE4eEwBGcrhpwjfsLPoZsr6g_nO0" # The one from .env

print(f"Testing Gemini with key: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    print("Trying list_models()...")
    models = genai.list_models()
    print("Enumerating models:")
    for m in models:
        print(f" - {m.name}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {str(e)}")
    sys.exit(1)
