from google import genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
import re
import threading

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

load_dotenv(os.path.join(BASE_DIR, "config", ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# --------------------------------------------------
# LOAD TAXONOMY AND RIGHTS DATABASE
# --------------------------------------------------

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


taxonomy = load_json("taxonomy.json")
rights_database = load_json("rights_database.json")

VALID_CATEGORIES = [
    "Road Infrastructure",
    "Water and Drainage",
    "Sanitation and Garbage",
]

VALID_SEVERITIES = ["Low", "Medium", "High", "Critical"]

CATEGORY_ALIASES = {
    "road infrastructure": "Road Infrastructure",
    "road": "Road Infrastructure",
    "roads": "Road Infrastructure",
    "road damage": "Road Infrastructure",
    "pothole": "Road Infrastructure",
    "potholes": "Road Infrastructure",

    "water and drainage": "Water and Drainage",
    "water & drainage": "Water and Drainage",
    "water": "Water and Drainage",
    "drainage": "Water and Drainage",
    "water drainage": "Water and Drainage",

    "sanitation and garbage": "Sanitation and Garbage",
    "garbage and waste": "Sanitation and Garbage",
    "garbage": "Sanitation and Garbage",
    "waste": "Sanitation and Garbage",
    "sanitation": "Sanitation and Garbage",
}


def normalize_category(category):
    if not isinstance(category, str):
        raise ValueError("AI did not return a valid category")

    normalized = CATEGORY_ALIASES.get(category.strip().lower())

    if normalized not in VALID_CATEGORIES:
        raise ValueError(f"Invalid AI category: {category}")

    return normalized


def route_department(category):
    for item in taxonomy:
        if item["category"] == category:
            return item["department"]

    return "Municipality"


def get_rights(category):
    for item in rights_database:
        if item["category"].strip().lower() == category.lower():
            return item

    return {
        "right": "Information unavailable",
        "law": "Not available",
        "department": route_department(category),
    }


def generate_assessment(severity):
    response_times = {
        "Critical": "Immediate (0-2 hours)",
        "High": "Within 24 hours",
        "Medium": "Within 2-3 days",
        "Low": "Within 7 days",
    }
    return {"response_time": response_times[severity]}


def calculate_confidence(data):
    # This is a heuristic score, not a calibrated probability.
    score = 50

    if data.get("category"):
        score += 15
    if data.get("subcategory"):
        score += 5
    if len(data.get("summary", "")) > 30:
        score += 10

    severity_points = {
        "Critical": 10,
        "High": 8,
        "Medium": 5,
        "Low": 0,
    }
    score += severity_points.get(data.get("severity"), 0)

    return {"score": min(score, 100)}


def finalize_result(data):
    """Validate and normalize output from either AI model."""

    data["category"] = normalize_category(data.get("category"))

    severity = data.get("severity")
    if not isinstance(severity, str):
        raise ValueError("AI did not return a valid severity")

    severity_aliases = {
        "low": "Low",
        "medium": "Medium",
        "high": "High",
        "critical": "Critical",
    }
    severity = severity_aliases.get(severity.strip().lower())

    if severity not in VALID_SEVERITIES:
        raise ValueError("Invalid AI severity")

    data["severity"] = severity

    for field in ("issue", "summary"):
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"AI did not return a valid {field}")

    rights = get_rights(data["category"])
    subcategory = data.get("subcategory")
    if not isinstance(subcategory, str) or not subcategory.strip():
      data["subcategory"] = "Unspecified"

    # Use trusted local mappings, not model-generated department/law data.
    data["department"] = rights["department"]
    data["citizen_right"] = rights["right"]
    data["law"] = rights["law"]
    data["response_time"] = generate_assessment(
        data["severity"]
    )["response_time"]
    data["confidence_score"] = calculate_confidence(data)["score"]

    # Keep the response fields expected by the existing backend.
    return {
        "issue": data["issue"],
        "category": data["category"],
        "subcategory": data["subcategory"],
        "summary": data["summary"],
        "severity": data["severity"],
        "department": data["department"],
        "citizen_right": data["citizen_right"],
        "law": data["law"],
        "response_time": data["response_time"],
        "confidence_score": data["confidence_score"],
    }


# --------------------------------------------------
# GEMINI: PRIMARY MODEL
# --------------------------------------------------

def generate_ai_result(user_complaint):
    prompt = f"""
You are NagrikAI, an AI civic complaint analyst.

Analyze the citizen's complaint. Return ONLY valid JSON with:
issue, category, subcategory, summary, severity, department.

Choose exactly one category:
1. Road Infrastructure
2. Water and Drainage
3. Sanitation and Garbage

Choose exactly one severity:
Low, Medium, High, Critical.

Low: Minor inconvenience without safety risk.
Medium: Public service issue affecting daily life.
High: Safety hazard or accident risk.
Critical: Immediate danger to human life.

Generate a specific and relevant subcategory.

Department mapping:
Road Infrastructure: Public Works Department
Water and Drainage: Water Department
Sanitation and Garbage: Sanitation Department

Do not invent facts. Base the assessment on the complaint.
Do not decide whether a complaint should be rejected.
Write the summary in third person, 
referring to the complainant as "the user" instead of addressing them directly as "you" or "your". 
For example, write "Garbage is accumulating in front of the user's house" instead of "Garbage is accumulating in front of your house".
Required JSON structure:
{{
  "issue": "",
  "category": "",
  "subcategory": "",
  "summary": "",
  "severity": "",
}}

Citizen complaint:
{user_complaint}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={"response_mime_type": "application/json"},
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response")

    data = json.loads(response.text)
    return finalize_result(data)


# --------------------------------------------------
# QWEN: LOCAL FALLBACK
# --------------------------------------------------

LOCAL_MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

local_tokenizer = None
local_model = None
model_lock = threading.Lock()


def load_local_model():
    """Load Qwen on first fallback, not at API startup."""
    global local_tokenizer, local_model

    if local_model is not None and local_tokenizer is not None:
        return

    with model_lock:
        if local_model is not None and local_tokenizer is not None:
            return

        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM

        local_tokenizer = AutoTokenizer.from_pretrained(
            LOCAL_MODEL_NAME,
            local_files_only=True,
        )

        local_model = AutoModelForCausalLM.from_pretrained(
            LOCAL_MODEL_NAME,
            local_files_only=True,
        )

        local_model.eval()


def extract_json(text):
    """Parse JSON even if the model surrounds it with code fences."""
    text = text.strip()

    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)

        if not match:
            raise ValueError("Qwen did not return valid JSON")

        return json.loads(match.group(0))


def generate_offline_result(user_complaint):
    load_local_model()

    import torch

    messages = [
        {
            "role": "system",
            "content": (
                "You are NagrikAI, a civic complaint analyst. "
                "Return only a valid JSON object with these fields: "
                "issue, category, subcategory, summary, severity, "
                "Choose exactly one category: Road Infrastructure, "
                "Water and Drainage, Sanitation and Garbage. "
                "Severity must be Low, Medium, High, or Critical. "
                "Use the complaint only. Do not invent details. "
                "Do not reject complaints. "
            ),
        },
        {
            "role": "user",
            "content": user_complaint,
        },
    ]

    prompt = local_tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = local_tokenizer(
        prompt,
        return_tensors="pt",
    )

    with torch.no_grad():
        output = local_model.generate(
            **inputs,
            max_new_tokens=180,
            do_sample=False,
            pad_token_id=local_tokenizer.eos_token_id,
        )

    generated_tokens = output[0][inputs["input_ids"].shape[1]:]

    response_text = local_tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True,
    )

    data = extract_json(response_text)
    return finalize_result(data)


# --------------------------------------------------
# API ENDPOINT
# --------------------------------------------------

class ComplaintRequest(BaseModel):
    complaint: str


@app.post("/analyze")
def analyze_complaint(request: ComplaintRequest):
    complaint = request.complaint.strip()

    if not complaint:
        raise HTTPException(
            status_code=400,
            detail="Complaint cannot be empty",
        )

    gemini_error = None

    if client is not None:
        try:
            result = generate_ai_result(complaint)
            result["mode"] = "online"
            return result

        except Exception as error:
            gemini_error = error
            print(f"Gemini failed; trying local Qwen: {error}")

    else:
        gemini_error = "GEMINI_API_KEY is not configured"

    try:
        result = generate_offline_result(complaint)
        result["mode"] = "offline"
        return result

    except Exception as offline_error:
        print(f"Local Qwen fallback failed: {offline_error}")

        raise HTTPException(
            status_code=503,
            detail={
                "message": "Both AI processing paths failed",
                "gemini_error": str(gemini_error),
                "offline_error": str(offline_error),
            },
        )
