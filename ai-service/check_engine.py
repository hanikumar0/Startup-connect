from engine import MatchingEngine
import os
from dotenv import load_dotenv

load_dotenv()
# Also check root
load_dotenv('../.env')

engine = MatchingEngine()
print(f"Gemini available: {engine.gemini_available}")
if hasattr(engine, 'gemini_model'):
    print("Gemini model initialized.")
    try:
        resp = engine.gemini_model.generate_content("ping")
        print("Gemini test success:", resp.text)
    except Exception as e:
        print("Gemini test fail:", e)
else:
    print("Gemini model NOT initialized.")

print(f"OpenAI client: {engine.openai_client is not None}")
