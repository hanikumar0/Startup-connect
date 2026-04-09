import google.generativeai as genai
import os

key = 'AIzaSyBl3PxilbW-ejDLBG6Eo-9WMtmQNh6jpWk'
genai.configure(api_key=key)

try:
    print("Listing models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Supported model: {m.name}")
            
    print("\nAttempting generation with gemini-1.5-flash...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("hi")
    print(f"Success: {response.text}")
except Exception as e:
    print(f"Failed: {e}")
