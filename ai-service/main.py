from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import fitz  # PyMuPDF
import re
from engine import MatchingEngine
from dotenv import load_dotenv

import os

# Try to load from current dir, then from root
load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(title="Startup Connect AI Engine")

# Load engine which handles model and LLM
matching_engine = MatchingEngine()

@app.get("/")
async def root():
    return {"status": "online", "service": "Startup Connect AI Engine"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

class StartupData(BaseModel):
    id: str
    name: str
    description: str
    industry: str
    stage: str
    tags: List[str]

class InvestorData(BaseModel):
    id: str
    name: str
    thesis: str
    preferred_industries: List[str]
    preferred_stages: List[str]

# --- Feature 1 & 2: Matching & Recommendations ---

@app.post("/ai/match")
async def calculate_match(startup: StartupData, investor: InvestorData):
    # Prepare data for engine
    class Entity:
        def __init__(self, text, metadata=None):
            self.text_content = text
            self.metadata = metadata or {}
            self.id = "temp"

    source = Entity(f"{startup.industry} {startup.stage} {startup.description} {' '.join(startup.tags)}", {
        "industry": startup.industry,
        "stage": startup.stage
    })
    candidate = Entity(f"{' '.join(investor.preferred_industries)} {' '.join(investor.preferred_stages)} {investor.thesis}", {
        "industry": investor.preferred_industries[0] if investor.preferred_industries else ""
    })

    # Use engine for core logic
    results = matching_engine.calculate_matches(source, [candidate], 1)
    
    if not results:
        return {"score": 0, "reasons": ["No data provided"]}

    match = results[0]
    
    # Extract reasons (re-using old logic for specific tags + adding AI reasoning)
    reasons = [match["reasoning"]]
    if startup.industry in investor.preferred_industries:
        reasons.append(f"Matching Sector: {startup.industry}")
    
    return {
        "score": int(match["score"]),
        "reasons": reasons
    }

# --- Feature 3: Pitch Deck Analysis ---

@app.post("/ai/analyze-pitch")
async def analyze_pitch(file: UploadFile = File(...)):
    content = await file.read()
    doc = fitz.open(stream=content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    
    # Basic Extraction Logic using regex
    funding = re.search(r'\$(\d+[\.,]?\d*[mkM]?)', text)
    market = re.search(r'market size[:\s]+(\d+[\.,]?\d*[mkM]?)', text, re.I)
    
    analysis = {
        "funding_detected": funding.group(1) if funding else "Undisclosed",
        "market_size_detected": market.group(1) if market else "Not specified",
        "market_confidence": 0.85 if market else 0.4,
        "summary": text[:500] + "..." if len(text) > 500 else text,
        "entities": ["AI", "SaaS"] if "AI" in text.upper() else []
    }
    
    return analysis

# --- Feature 4: Quality & Activity Scores ---

@app.post("/ai/scores")
async def calculate_scores(data: dict):
    # Comprehensive scoring logic
    quality = 0
    if data.get("team_size", 0) > 2: quality += 20
    if data.get("revenue", 0) > 10000: quality += 30
    if data.get("onboarding_completed"): quality += 20
    if data.get("pitch_deck"): quality += 30
    
    return {
        "quality_score": min(quality, 100),
        "activity_score": data.get("interactions", 0) * 10
    }

# --- Feature 5: Semantic Search ---

@app.post("/ai/search")
async def semantic_search(query: str, items: List[dict]):
    query_embedding = matching_engine.model.encode([query])
    item_texts = [f"{i.get('name')} {i.get('description')} {' '.join(i.get('tags', []))}" for i in items]
    item_embeddings = matching_engine.model.encode(item_texts)
    
    similarities = cosine_similarity(query_embedding, item_embeddings)[0]
    
    # Sort and return
    results = sorted(zip(items, similarities), key=lambda x: x[1], reverse=True)
    return [r[0] for r in results if r[1] > 0.3]

# --- Feature 6: Text Improvement (Gemini) ---

class ImproveTextRequest(BaseModel):
    text: str
    type: str # startup_vision or investor_thesis

@app.post("/ai/improve-text")
async def improve_text(request: ImproveTextRequest):
    improved = matching_engine.improve_text(request.text, request.type)
    return {"improved_text": improved}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
