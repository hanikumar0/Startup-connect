from sentence_transformers import SentenceTransformer, util
import numpy as np
import os
from dotenv import load_dotenv

# Try to load from current dir, then from root
load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


class MatchingEngine:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        # This model is small, fast, and great for semantic similarity
        print(f"Loading AI model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        print("SentenceTransformer loaded.")
        
        # Initialize Gemini client
        self.gemini_available = False
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')
                # Test the model immediately (deferred)
                # test_resp = self.gemini_model.generate_content("Ping")
                self.gemini_available = True
                print(f"Gemini AI structure initialized.")
            except Exception as e:
                import traceback
                print(f"CRITICAL: Gemini initialization failed: {e}")
                traceback.print_exc()
                self.gemini_available = False
        
        # Fallback to OpenAI if Gemini isn't available and OpenAI key exists
        self.openai_client = None
        api_key = os.getenv("OPENAI_API_KEY")
        if not self.gemini_available and api_key and api_key != "your_openai_api_key":
            from openai import OpenAI
            self.openai_client = OpenAI(api_key=api_key)
            print("OpenAI client initialized as fallback.")
        
        print("Model loaded successfully.")

    def _check_openai_status(self):
        import time
        if not self.openai_client:
            return False
        if time.time() < self.openai_circuit_broken_until:
            return False
        return True

    def _handle_openai_error(self, e):
        import time
        error_msg = str(e).lower()
        if "insufficient_quota" in error_msg or "rate_limit" in error_msg or "429" in error_msg:
            print("🛑 OpenAI Quota exceeded or Rate Limited. Breaking circuit for 1 hour.")
            self.openai_circuit_broken_until = time.time() + 3600 # 1 hour
        else:
            print(f"⚠️ OpenAI Error: {e}")

    def calculate_matches(self, source, candidates, top_n):
        if not candidates:
            return []

        # 1. Encode the source text
        source_embedding = self.model.encode(source.text_content, convert_to_tensor=True)

        # 2. Encode all candidate texts
        candidate_texts = [c.text_content for c in candidates]
        candidate_embeddings = self.model.encode(candidate_texts, convert_to_tensor=True)

        # 3. Compute cosine similarity
        cosine_scores = util.cos_sim(source_embedding, candidate_embeddings)[0]

        # 4. Process results
        results = []
        for i in range(len(candidates)):
            score = float(cosine_scores[i])
            results.append({
                "id": candidates[i].id,
                "score": round(score * 100, 2), # Convert to 0-100 scale
                "reasoning": self._generate_reasoning(source, candidates[i], score)
            })

        # 5. Sort by score
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_n]

    def _generate_reasoning(self, source, candidate, score):
        # Use Gemini for high-quality reasoning if available and score is high
        if self.gemini_available and score > 0.4:
            try:
                prompt = f"As a professional venture capital analyst, briefly explain in one sentence why this startup and investor are a good match based on their profiles.\n\nStartup: {source.text_content}\nInvestor: {candidate.text_content}"
                response = self.gemini_model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"Gemini reasoning error: {e}")
        
        # Fallback to OpenAI
        if self.openai_client and score > 0.4:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a professional venture capital analyst. Briefly explain in one sentence why this startup and investor are a good match based on their profiles."},
                        {"role": "user", "content": f"Startup: {source.text_content}\nInvestor: {candidate.text_content}"}
                    ],
                    max_tokens=60
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"OpenAI reasoning error: {e}")
        
        # Fallback to heuristic
        source_ind = source.metadata.get('industry', '')
        cand_ind = candidate.metadata.get('industry', '')
        
        if source_ind.lower() == cand_ind.lower():
            return f"Strong alignment in the {source_ind} sector."
        
        return "High semantic similarity in business models and goals."

    def analyze_pitch(self, pitch_text: str):
        # 1. Analyze sentiment/confidence vs standard descriptors
        baseline = "A revolutionary scalable platform with high growth potential, solving a massive problem in a global market."
        
        embeddings = self.model.encode([pitch_text, baseline], convert_to_tensor=True)
        readiness_score = float(util.cos_sim(embeddings[0], embeddings[1])[0][0])
        
        # 2. Heuristic checks
        feedback = []
        strengths = []
        word_count = len(pitch_text.split())
        
        if word_count < 20:
            feedback.append("Pitch is too short. Try explaining your revenue model.")
        elif word_count > 150:
            feedback.append("A bit wordy. Try to get to the point within 100 words.")

        keywords = ["ai", "market", "problem", "solution", "scale", "revenue", "growth"]
        missing = [k for k in keywords if k not in pitch_text.lower()]
        if missing:
            feedback.append(f"Consider including keywords like: {', '.join(missing[:3])}")

        # 3. Specialized Checks
        competitor_keywords = ["moat", "advantage", "competitor", "unique", "differentiated", "edge", "barrier"]
        has_edge = any(w in pitch_text.lower() for w in competitor_keywords)
        if not has_edge:
            feedback.append("Missing Competitive Edge: Mention how you are DIFFERENT from existing players.")
        else:
            strengths.append("Clear competitive differentiation.")

        revenue_keywords = ["saas", "subscription", "business model", "monetize", "revenue", "pricing", "fees", "commission"]
        has_revenue = any(w in pitch_text.lower() for w in revenue_keywords)
        if not has_revenue:
            feedback.append("Business Model Uncertainty: Clearly state how you plan to make money.")
        else:
            strengths.append("Defined revenue model.")

        return {
            "score": round(readiness_score * 100, 2),
            "feedback": feedback if feedback else ["Great start! Your pitch is clear and concise."],
            "strengths": strengths if strengths else ["Good professional tone."],
            "word_count": word_count,
            "has_edge": has_edge,
            "has_revenue": has_revenue
        }

    def analyze_document(self, doc_name: str, doc_content: str):
        if self.gemini_available:
            try:
                prompt = f"""
                Analyze this startup document: {doc_name}
                Content Summary: {doc_content[:3000]}
                
                Provide:
                1. A one-sentence professional summary.
                2. A risk score from 0-100 (0 being low risk).
                3. Top 3 key clauses or highlights extracted from the text.
                
                Format as valid JSON:
                {{
                    "summary": "...",
                    "risk_score": 25,
                    "clauses": ["clause 1", "clause 2", "clause 3"]
                }}
                """
                response = self.gemini_model.generate_content(prompt)
                import json
                # Clean potential markdown from response
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:-3].strip()
                return json.loads(text)
            except Exception as e:
                print(f"Gemini document analysis error: {e}")

        if self.openai_client:
            try:
                prompt = f"""
                Analyze this startup document: {doc_name}
                Content Summary: {doc_content[:1000]}
                
                Provide:
                1. A one-sentence professional summary.
                2. A risk score from 0-100 (0 being low risk).
                3. Top 3 key clauses or highlights extracted from the text.
                
                Format as JSON:
                {{
                    "summary": "...",
                    "risk_score": 25,
                    "clauses": ["clause 1", "clause 2", "clause 3"]
                }}
                """
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a professional due diligence AI. Analyze the document and return JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={ "type": "json_object" }
                )
                import json
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                print(f"OpenAI document analysis error: {e}")
        
        return {
            "summary": f"Professional review of {doc_name} for investment readiness.",
            "risk_score": 15,
            "clauses": ["Standard investment terms", "Confidentiality agreement", "Market alignment"]
        }

    def improve_text(self, text, context_type):
        context = "a startup founder's vision" if context_type == "startup_vision" else "an investor's investment thesis"
        prompt = f"""
        You are a professional copywriter for the venture capital industry.
        Improve the following text for {context}. 
        Make it professional, compelling, and concise (max 2-3 sentences).
        
        Original text: {text}
        
        Improved text:
        """
        
        # 1. Try Gemini
        if self.gemini_available:
            try:
                response = self.gemini_model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"Gemini improvement error: {e}")
        
        # 2. Try OpenAI Fallback
        if self.openai_client:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a professional venture capital industry copywriter."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=150
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"OpenAI improvement error: {e}")
        
        # 3. Last resort: Return original
        return text
