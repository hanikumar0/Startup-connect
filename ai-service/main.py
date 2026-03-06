from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
import uvicorn
import time
import logging
import os
import subprocess
from engine import MatchingEngine
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("ai-service")

# Load environment variables from the root project directory (1 level up)
ROOT_ENV = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(ROOT_ENV, override=True)

# ─── Port Cleanup ───
def cleanup_port(port: int):
    try:
        if os.name == 'nt':
            # Use netstat to find PID on port
            cmd = f'netstat -ano | findstr :{port}'
            output = subprocess.check_output(cmd, shell=True).decode()
            for line in output.strip().split('\n'):
                parts = line.strip().split()
                if len(parts) > 4 and parts[1].endswith(f':{port}'):
                    pid = parts[-1]
                    if pid != '0' and pid != str(os.getpid()):
                        log.info(f"🧹 Clearing zombie process {pid} on port {port}...")
                        subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
    except Exception:
        pass # Port is likely free or taskkill failed silently

# ─── Lifespan ───
engine: Optional[MatchingEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    log.info("🚀 Loading AI matching engine...")
    try:
        engine = MatchingEngine()
        log.info("✅ AI engine loaded successfully.")
    except Exception as e:
        log.error(f"❌ Failed to load AI engine: {e}")
        engine = None
    yield
    # Clean up (if needed)

app = FastAPI(
    title="Startup Connect AI Service",
    version="1.0.0",
    docs_url="/docs" if __name__ == "__main__" else None,
    lifespan=lifespan
)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Timeout Middleware ───
@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    response.headers["X-Response-Time"] = f"{duration:.3f}s"
    if duration > 10:
        log.warning(f"Slow request: {request.method} {request.url.path} took {duration:.1f}s")
    return response

# ─── Global Exception Handler ───
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error(f"Unhandled error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "detail": "Internal server error. The AI service encountered an unexpected issue."}
    )

def get_engine() -> MatchingEngine:
    if engine is None:
        raise HTTPException(status_code=503, detail="AI engine is not available. Please try again later.")
    return engine

# ─── Models ───
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

class DocumentAnalysisRequest(BaseModel):
    doc_name: str
    doc_content: str  # Simulated content for MVP

# ─── Routes ───

@app.get("/health")
async def health():
    return {
        "status": "healthy" if engine is not None else "degraded",
        "engine_loaded": engine is not None,
        "timestamp": time.time(),
    }

@app.post("/match")
async def get_matches(request: MatchRequest):
    eng = get_engine()
    try:
        results = eng.calculate_matches(
            request.source_profile, 
            request.candidate_profiles, 
            request.top_n
        )
        return {"success": True, "matches": results}
    except Exception as e:
        log.error(f"Match error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-document")
async def analyze_document(request: DocumentAnalysisRequest):
    eng = get_engine()
    try:
        results = eng.analyze_document(request.doc_name, request.doc_content)
        return {"success": True, "analysis": results}
    except Exception as e:
        log.error(f"Document analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-pitch")
async def analyze_pitch(request: PitchAnalysisRequest):
    eng = get_engine()
    try:
        results = eng.analyze_pitch(request.pitch_text)
        return {"success": True, "analysis": results}
    except Exception as e:
        log.error(f"Pitch analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    cleanup_port(8000)
    uvicorn.run(app, host="0.0.0.0", port=8000)
