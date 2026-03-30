import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key[:10]}...") # Masked for safety

genai.configure(api_key=api_key)

try:
    print("Testing gemini-1.5-flash connection...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hi")
    print("Success with gemini-1.5-flash!")
    print(response.text)
except Exception as e:
    print(f"Failed with gemini-1.5-flash: {e}")

try:
    print("Testing gemini-1.5-flash-latest connection...")
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    response = model.generate_content("Hi")
    print("Success with gemini-1.5-flash-latest!")
    print(response.text)
except Exception as e:
    print(f"Failed with gemini-1.5-flash-latest: {e}")

try:
    print("Listing all reachable models...")
    models = list(genai.list_models())
    print(f"Found {len(models)} models.")
    for m in models:
        print(f"- {m.name} supported methods: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")
