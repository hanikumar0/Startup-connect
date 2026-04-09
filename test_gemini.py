import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
print(f"Key found: {key[:5]}...{key[-5:]}" if key else "Key not found")

try:
    genai.configure(api_key=key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello")
    print("Response success:", response.text.strip())
except Exception as e:
    print("Error:", e)
