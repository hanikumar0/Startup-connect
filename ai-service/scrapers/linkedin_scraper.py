from base_scraper import BaseScraper
import random

class LinkedInScraper(BaseScraper):
    def __init__(self):
        super().__init__("LinkedIn")

    def scrape_startups(self, query="SaaS"):
        """Mocked LinkedIn scraping - real would use Selenium/Playwright"""
        mock_data = [
            {
                "name": f"Nexus AI {random.randint(10, 99)}",
                "description": "Next generation AI for enterprise workflows and data management.",
                "url": "https://linkedin.com/company/nexus-ai",
                "website": "https://nexus-ai.io",
                "location": "San Francisco, CA",
                "industry": "AI",
                "stage": "Seed",
                "logo": "https://logo.clearbit.com/nexus-ai.io"
            },
            {
                "name": "FlowPay",
                "description": "Seamless crypto-to-fiat payment gateway for global merchants.",
                "url": "https://linkedin.com/company/flowpay",
                "website": "https://flowpay.com",
                "location": "London, UK",
                "industry": "Fintech",
                "stage": "Growth",
                "logo": "https://logo.clearbit.com/flowpay.com"
            }
        ]
        
        for raw in mock_data:
            normalized = self.normalize_data(raw)
            # Automatic enrichment:
            normalized["industry"] = self.detect_category(normalized["description"])
            self.results.append(normalized)
            
        return self.results

if __name__ == "__main__":
    scraper = LinkedInScraper()
    print(scraper.scrape_startups())
