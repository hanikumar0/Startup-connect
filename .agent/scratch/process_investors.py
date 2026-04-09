import csv
import json
import os

input_file = r'c:\startup connect\.agent\scratch\investors_raw.csv'
output_file = r'c:\startup connect\.agent\scratch\investors_extracted.json'

investors = []

with open(input_file, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # map fields
        name = row.get('Investor name', '')
        website = row.get('Website', '')
        location = row.get('Global HQ', '')
        countries = row.get('Countries of investment', '')
        stages = row.get('Stage of investment', '')
        thesis = row.get('Investment thesis', '')
        inv_type = row.get('Investor type', '')
        min_cheque = row.get('First cheque minimum', '')
        max_cheque = row.get('First cheque maximum', '')

        # Basic cleanup
        ticket_size = f"{min_cheque} - {max_cheque}" if min_cheque and max_cheque else (min_cheque or max_cheque)
        
        investor_data = {
            "basic_info": {
                "name": name,
                "type": "Investor",
                "industry_sector": "Various / Generalist",  # Defaulting, ideally extracted via NLP
                "location": location,
                "website": website,
                "linkedin_profile": None
            },
            "investor_details": {
                "firm_name": name,
                "investor_type": inv_type,
                "investment_focus": {
                    "industries": thesis,
                    "stages": stages,
                    "countries": countries
                },
                "portfolio_companies": [],
                "notable_investments": [],
                "ticket_size": ticket_size,
                "contact_info": None,
                "social_links": None
            },
            "extra_enrichment": {
                "recent_activity": None,
                "news_or_funding_updates": None,
                "tags": []
            }
        }
        investors.append(investor_data)

with open(output_file, mode='w', encoding='utf-8') as f:
    json.dump({"startups_and_investors": investors}, f, indent=2)

print(f"Extraction complete. {len(investors)} records processed and saved to {output_file}.")
