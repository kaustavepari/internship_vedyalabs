from google import genai
from dotenv import load_dotenv
from pathlib import Path
import os
import json
from pydantic import BaseModel, ValidationError, field_validator
from typing import List, Optional, Literal
from google.genai import types
import re

# Load .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Chart & filter constants
PIE_CHARTS = ["pie", "donut", "gauge"]
BAR_CHARTS = ["bar-simple", "bar-horizontal", "bar-stacked"]
LINE_CHARTS = ["line-monotone", "line-linear"]

CATEGORIES = ["pedestrians",
    "twoWheelers",
    "fourWheelers",
    "trucks",]

DATE_RANGES = [
    "LAST_2_DAYS",
    "LAST_7_DAYS",
    "LAST_15_DAYS",
    "LAST_30_DAYS",
    "CUSTOM",
]

# ----------------------------------------------------------
# 🔹 Utility: Strip Markdown fences
# ----------------------------------------------------------
def strip_fences(text: str):
    return re.sub(r"```(?:json)?|```", "", text).strip()


# ----------------------------------------------------------
# 🔹 Utility: Extract <response> and <state> blocks
# ----------------------------------------------------------
def extract_response_components(text: str) -> tuple[str, Optional[dict]]:
    text = strip_fences(text)

    response_match = re.search(r"<response>(.*?)</response>", text, re.DOTALL)
    state_match = re.search(r"<state>(.*?)</state>", text, re.DOTALL)

    # ----- Extract response -----
    if response_match:
        response_text = response_match.group(1).strip()
    else:
        response_text = "I'm here to help! What would you like to do?"

    # ----- Extract state -----
    state_data = None
    if state_match:
        raw_state = state_match.group(1).strip()
        if raw_state.lower() != "null":
            try:
                state_data = json.loads(raw_state)
            except json.JSONDecodeError:
                response_text += "\n\n⚠️ (Note: I could not parse the dashboard update.)"
                state_data = None

    return response_text, state_data


# ----------------------------------------------------------
# 🔹 Pydantic Schema
# ----------------------------------------------------------

class ChartOptions(BaseModel):
    smooth_lines: bool = False
    stacked: bool = False
    color_scheme: Literal["auto"] = "auto"


class ChartConfig(BaseModel):
    type: str
    category: Optional[List[str]]
    title: str
    options: ChartOptions

    @field_validator("type")
    def validate_chart_type(cls, v):
        allowed = PIE_CHARTS + BAR_CHARTS + LINE_CHARTS
        if v not in allowed:
            raise ValueError(f"Invalid chart type: {v}")
        return v

    @field_validator("category")
    def validate_category(cls, category, info):
        chart_type = info.data.get("type")
        
        # Handle pie/donut/gauge charts
        if chart_type in PIE_CHARTS:
            if category is not None:
                raise ValueError("Pie charts must have category = null")
            return category
            
        # Handle bar/line charts
        if chart_type in BAR_CHARTS + LINE_CHARTS:
            if not isinstance(category, list) or not category:
                raise ValueError(f"{chart_type} charts must have a non-empty array of categories")
                
            # Check each category in the array
            invalid_categories = [c for c in category if c not in CATEGORIES]
            if invalid_categories:
                raise ValueError(
                    f"Invalid categories for {chart_type} charts: {invalid_categories}. "
                    f"Valid categories are: {CATEGORIES}"
                )
            return category
            
        return category


class DashboardState(BaseModel):
    date_range: Literal[
        "LAST_2_DAYS",
        "LAST_7_DAYS",
        "LAST_15_DAYS",
        "LAST_30_DAYS",
        "CUSTOM",
    ]
    charts: List[ChartConfig]


# ----------------------------------------------------------
# 🔹 Main LLM Gateway Function
# ----------------------------------------------------------
def process_user_prompt(user_prompt: str):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file.")

    client = genai.Client(api_key=api_key)

    # ------------------------------------------------------
    # 🔹 CORRECT & IMPROVED SYSTEM PROMPT
    # ------------------------------------------------------
    system_instruction = f"""
You are an MCP (Model Control Protocol) system for a traffic dashboard.

Your output must ALWAYS contain two sections:

1️⃣ <response>  
→ Natural, conversational answer to the user  
→ Can explain insights, ask clarifying questions, summarize data, etc.

2️⃣ <state>  
→ Updated dashboard state as VALID JSON  
→ Or the word "null" if no change is needed  

=== SYSTEM CONSTRAINTS ===

VALID CHART TYPES:
- Line Charts: {', '.join(LINE_CHARTS)}
- Bar Charts: {', '.join(BAR_CHARTS)}
- Pie Charts: {', '.join(PIE_CHARTS)}

VALID CATEGORIES: {', '.join(CATEGORIES)}

VALID DATE RANGES: {', '.join(DATE_RANGES)}

CHART OPTIONS:
- smooth_lines: boolean (for line charts only)
- stacked: boolean
- color_scheme: must be "auto"

RULES:
1. For pie/donut/gauge charts, category must be null
2. For bar/line charts, category must be a non zero array of categories from : {', '.join(CATEGORIES)}
3. Title should be descriptive and include the time period when relevant
4. Always use the exact values as shown above (case-sensitive)
5. Never make up your own chart types or categories
6. Always include all required fields in the JSON response
7. If the user has not explicity specified the categories or date range , assume a valid default value. 

Format example:

<response>
Sure! Here's what I found.
</response>

<state>
{{
  "date_range": "LAST_7_DAYS",
  "charts": [
    {{
      "type": "line-monotone",
      "category": ["pedestrians", "trucks"],
      "title": "Pedestrian Volume (7 days)",
      "options": {{
        "smooth_lines": true,
        "stacked": false,
        "color_scheme": "auto"
      }}
    }}
  ]
}}
</state>

❗ RULES ❗
- ONLY write content inside <response> and <state>
- NEVER put explanations outside these tags
- <state> MUST ALWAYS contain either:
    • a valid JSON object (dashboard state), OR  
    • the word "null"
- Pie charts MUST have category = null
- Line/bar charts MUST have category from: {CATEGORIES}
- date_range MUST be from , figure it out based on what the user asks or select a default one and mention so: {DATE_RANGES}
- JSON inside <state> must be strictly valid

User request:
"""

    # ------------------------------------------------------
    # 🔹 Call Gemini API
    # ------------------------------------------------------
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
            ),
        )
    except Exception as e:
        raise Exception(f"Gemini API call failed: {e}") from e

    raw_output = (response.text or "").strip()

    # ------------------------------------------------------
    # 🔹 Extract <response> & <state>
    # ------------------------------------------------------
    response_text, state_data = extract_response_components(raw_output)

    # ------------------------------------------------------
    # 🔹 Validate <state> JSON if present
    # ------------------------------------------------------
    if state_data is not None:
        try:
            validated = DashboardState(**state_data)
            state_output = validated.model_dump()
        except ValidationError as ve:
            return {
                "response": response_text
                + "\n\n⚠️ (The dashboard update was invalid and was ignored.)",
                "error": "Invalid dashboard update",
                "details": ve.errors(),
                "state": None,
                "raw_response": raw_output,
            }
    else:
        state_output = None

    # ------------------------------------------------------
    # 🔹 Final Output
    # ------------------------------------------------------
    return {
        "response": response_text,
        "state": state_output,
    }
