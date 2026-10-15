from google import genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json


# -----------------------------
# APP SETUP
# -----------------------------

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

load_dotenv(os.path.join(BASE_DIR, "config", ".env"))

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# -----------------------------
# LOAD DATABASE FILES
# -----------------------------

def load_taxonomy():
    with open(
        os.path.join(DATA_DIR, "taxonomy.json"), "r"
    ) as file:
        return json.load(file)


def load_rights_database():
    with open(
        os.path.join(DATA_DIR, "rights_database.json"), "r"
    ) as file:
        return json.load(file)


taxonomy = load_taxonomy()
rights_database = load_rights_database()


# -----------------------------
# HELPER FUNCTIONS
# -----------------------------

def route_department(category):

    for item in taxonomy:
        if item["category"] == category:
            return item["department"]

    return "Municipality"


def get_rights(category):
    category = category.strip().lower()

    for item in rights_database:
        database_category = item["category"].strip().lower()

        if database_category == category:
            return item

    return {
        "right": "Information unavailable",
        "law": "Not available",
        "department": "Municipality"
    }

def generate_assessment(severity):

    if severity == "Critical":
        return {
            "response_time": "Immediate (0–2 hours)"
        }

    elif severity == "High":
        return {
            "response_time": "Within 24 hours"
        }

    elif severity == "Medium":
        return {
            "response_time": "Within 2–3 days"
        }

    else:
        return {
            "response_time": "Within 7 days"
        }


def calculate_confidence(data):

    score = 50

    if data.get("category"):
        score += 15

    if data.get("subcategory"):
        score += 5

    if len(data.get("summary", "")) > 30:
        score += 10

    if data.get("severity") == "Critical":
        score += 10

    elif data.get("severity") == "High":
        score += 8

    elif data.get("severity") == "Medium":
        score += 5

    score = min(score, 100)

    return {
        "score": score
    }


# -----------------------------
# AI PROCESSING
# -----------------------------

def generate_ai_result(user_complaint):

    prompt = f"""
You are NagrikAI, an AI Civic Complaint Analyst.

Analyze the citizen complaint professionally.

TASKS:

1. Identify the civic issue.
2. Classify the complaint into EXACTLY ONE
   of the three categories listed below.
3. Generate a specific subcategory.
4. Decide the severity.
5. Identify the responsible government department.
6. Write a short professional summary.

MAIN CATEGORIES:

1. Road Infrastructure
2. Water and Drainage
3. Sanitation and Garbage

IMPORTANT CATEGORY RULES:

- Select EXACTLY ONE main category.
- Use ONLY the three main categories provided.
- Do not create new main categories.
- The main category must contain the exact
  wording of one of the three options.
- Generate the subcategory based on the complaint.
- The subcategory should be specific and relevant.

EXAMPLES OF SUBCATEGORIES:

Road Infrastructure:
- Pothole
- Road Cracks
- Broken Footpath
- Damaged Road

Water and Drainage:
- Water Leakage
- Drain Blockage
- Water Contamination
- Flooding

Sanitation and Garbage:
- Garbage Accumulation
- Illegal Dumping
- Waste Collection
- Public Hygiene

These are examples, not a fixed subcategory list.
Generate an appropriate subcategory based on
the actual complaint.

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

Road Infrastructure → Public Works Department
Water and Drainage → Water Department
Sanitation and Garbage → Sanitation Department

Return ONLY valid JSON.

{{
"issue": "",
"category": "",
"subcategory": "",
"summary": "",
"severity": "",
"department": ""
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

    # Validate main category
    valid_categories = [
        "Road Infrastructure",
        "Water and Drainage",
        "Sanitation and Garbage"
    ]

    if data.get("category") not in valid_categories:
        raise ValueError("Invalid category returned by Gemini")

    # Department from backend taxonomy
    data["department"] = route_department(
        data["category"]
    )

    # Rights and laws
    rights = get_rights(data["category"])

    data["department"] = rights["department"]
    data["citizen_right"] = rights["right"]
    data["law"] = rights["law"]

    # Assessment
    assessment = generate_assessment(
        data["severity"]
    )

    data["response_time"] = assessment["response_time"]

    # Confidence score
    confidence = calculate_confidence(data)

    data["confidence_score"] = confidence["score"]

    return data


# -----------------------------
# API REQUEST MODEL
# -----------------------------

class ComplaintRequest(BaseModel):

    complaint: str


# -----------------------------
# API ENDPOINT
# -----------------------------

@app.post("/analyze")
def analyze_complaint(request: ComplaintRequest):

    if not request.complaint.strip():
        raise HTTPException(
            status_code=400,
            detail="Complaint cannot be empty"
        )

    try:

        result = generate_ai_result(
            request.complaint
        )

        return result

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )