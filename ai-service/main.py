from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
from engine import MatchingEngine

app = FastAPI(title="Startup Connect AI Service")
engine = MatchingEngine()

class Profile(BaseModel):
    id: str
    text_content: str  # Combined bio, industry, tags, etc.
    metadata: Dict[str, Any]

class MatchRequest(BaseModel):
    source_profile: Profile
    candidate_profiles: List[Profile]
    top_n: int = 10

class PitchAnalysisRequest(BaseModel):
    pitch_text: str

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/match")
async def get_matches(request: MatchRequest):
    try:
        results = engine.calculate_matches(
            request.source_profile, 
            request.candidate_profiles, 
            request.top_n
        )
        return {"success": True, "matches": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DocumentAnalysisRequest(BaseModel):
    doc_name: str
    doc_content: str  # Simulated content for MVP

@app.post("/analyze-document")
async def analyze_document(request: DocumentAnalysisRequest):
    try:
        results = engine.analyze_document(request.doc_name, request.doc_content)
        return {"success": True, "analysis": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
