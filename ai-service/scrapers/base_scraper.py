import requests
import time

class BaseScraper:
    def __init__(self, source_name):
        self.source_name = source_name
        self.results = []

    def normalize_data(self, raw_data):
        """Uniform format for all scrapers"""
        return {
            "name": raw_data.get("name"),
            "logo": raw_data.get("logo"),
            "description": raw_data.get("description"),
            "industry": raw_data.get("industry", "Other"),
            "stage": raw_data.get("stage", "Idea"),
            "location": raw_data.get("location"),
            "website": raw_data.get("website"),
            "source": self.source_name,
            "sourceUrl": raw_data.get("url"),
            "isClaimed": False
        }

    def detect_category(self, text):
        keywords = {
            "AI": ["artificial intelligence", "ml", "machine learning", "neural"],
            "Fintech": ["banking", "payment", "crypto", "finance"],
            "HealthTech": ["medical", "health", "doctor", "biotech"],
            "SaaS": ["software", "cloud", "platform", "enterprise"]
        }
        for cat, kw_list in keywords.items():
            if any(kw in text.lower() for kw in kw_list):
                return cat
        return "SaaS" # Default
