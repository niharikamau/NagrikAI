from google import genai
from dotenv import load_dotenv
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

print(os.path.exists(os.path.join(DATA_DIR, "taxonomy.json")))

def load_taxonomy():
    with open(os.path.join(DATA_DIR, "taxonomy.json"), "r") as file:
        return json.load(file)

def load_severity_rules():
    with open(os.path.join(DATA_DIR, "severity_rules.json"), "r") as file:
        return json.load(file)

def load_rights_database():
    with open(os.path.join(DATA_DIR,"rights_database.json"),"r") as file:
        return json.load(file)    


taxonomy = load_taxonomy()    
severity_rules = load_severity_rules()
rights_database = load_rights_database()

def route_department(category):
    for item in taxonomy:
        if item["category"] == category:
            return item["department"]
    return "Municipality"

def get_rights(category):
    for item in rights_database:
        if item["category"] == category:
            return item

    return {
        "right":"Information unavailable",
        "law":"Not available",
        "department":"Municipality"
    }

def generate_assessment(severity, category):
    if severity == "Critical":
        return {
            "risk_level": "Extreme",
            "response_time": "Immediate (0–2 hours)",
            "recommended_action": "Dispatch emergency field team immediately.",
            "reason": "The complaint indicates an immediate threat to public safety."
        }

    elif severity == "High":
        return {
            "risk_level": "High",
            "response_time": "Within 24 hours",
            "recommended_action": "Assign the complaint to the responsible department urgently.",
            "reason": "The issue presents a significant safety or public health risk."
        }

    elif severity == "Medium":
        return {
            "risk_level": "Moderate",
            "response_time": "Within 2–3 days",
            "recommended_action": "Schedule inspection and routine maintenance.",
            "reason": "The complaint affects daily public services but is not immediately dangerous."
        }

    else:
        return {
            "risk_level": "Low",
            "response_time": "Within 7 days",
            "recommended_action": "Include the issue in the regular maintenance schedule.",
            "reason": "The issue is a minor civic inconvenience."
        }



BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, "config", ".env"))


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

user_complaint = input("Enter your complaint: ")

prompt = f"""
You are NagrikAI, an AI Civic Complaint Analyst.

Your job is to analyze citizen complaints professionally.

TASKS:

1. Identify the civic issue.
2. Classify it into ONE category only.
3. Decide the severity.
4. Identify the responsible government department.
5. Write a short professional summary.

VALID CATEGORIES:

- Road Damage
- Garbage & Waste
- Water & Drainage
- Street Lighting
- Air Pollution
- Public Hygiene
- Illegal Dumping
- Electrical Hazard

SEVERITY RULES:

Low:
Minor inconvenience without safety risk.

Medium:
Public service issue affecting daily life.

High:
Safety hazard or accident risk.

Critical:
Immediate danger to human life.

DEPARTMENT MAPPING:

Road Damage → Public Works Department
Garbage & Waste → Sanitation Department
Water & Drainage → Water Department
Street Lighting → Electrical Department
Air Pollution → Pollution Control Board
Public Hygiene → Municipality
Illegal Dumping → Sanitation Department
Electrical Hazard → Electricity Board

Return ONLY valid JSON.

{{
"issue":"",
"category":"",
"location":"",
"summary":"",
"severity":"",
"department":""
}}

Citizen Complaint:
{user_complaint}
"""

response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=prompt,
     config={
        "response_mime_type": "application/json"
     }
)

data = json.loads(response.text)

rights = get_rights(data["category"])

data["department"] = rights["department"]
data["citizen_right"] = rights["right"]
data["law"] = rights["law"]

assessment = generate_assessment(
    data["severity"],
    data["category"]
)

def calculate_confidence(data):
    score = 50

    if data["category"]:
        score += 15

    if data["location"]:
        score += 10

    if len(data["summary"]) > 30:
        score += 10

    if data["severity"] == "Critical":
        score += 10
    elif data["severity"] == "High":
        score += 8
    elif data["severity"] == "Medium":
        score += 5

    score = min(score, 100)

    if score >= 90:
        level = "Very High"
    elif score >= 75:
        level = "High"
    elif score >= 60:
        level = "Medium"
    else:
        level = "Low"

    return {
        "score": score,
        "level": level
    }

data["risk_level"] = assessment["risk_level"]
data["response_time"] = assessment["response_time"]
data["recommended_action"] = assessment["recommended_action"]
data["reason"] = assessment["reason"]

confidence = calculate_confidence(data)

data["confidence_score"] = confidence["score"]
data["confidence_level"] = confidence["level"]


print("\n========== NAGRIK AI REPORT ==========")

print("Issue:", data["issue"])
print("Category:", data["category"])
print("Location:", data["location"])
print("Summary:", data["summary"])

print("\n--- Assessment ---")
print("Severity:", data["severity"])
print("Risk Level:", data["risk_level"])
print("Reason:", data["reason"])
print("Response Time:", data["response_time"])
print("Recommended Action:", data["recommended_action"])

print("\n--- Authority ---")
print("Department:", data["department"])
print("Citizen Right:", data["citizen_right"])
print("Relevant Law:", data["law"])

print("\n--- AI Confidence ---")
print("Confidence Score:", str(data["confidence_score"]) + "%")
print("Confidence Level:", data["confidence_level"])

print("\nComplaint analyzed successfully!")