import os
import logging
import joblib
from pathlib import Path

logger = logging.getLogger("NLP-Service")

# Construct path to the trained joblib model
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODELS_DIR / "nlp_model.pkl"

pipeline = None
departments = []

def load_model():
    global pipeline, departments
    if not MODEL_PATH.exists():
        logger.warning(f"NLP model not found at {MODEL_PATH}. Run training script first.")
        return False
        
    try:
        bundle = joblib.load(MODEL_PATH)
        pipeline = bundle["pipeline"]
        departments = bundle.get("departments", [])
        logger.info(f"Successfully loaded NLP model from {MODEL_PATH}")
        return True
    except Exception as e:
        logger.error(f"Failed to load NLP model: {e}")
        return False

# Attempt initial load
NLP_AVAILABLE = load_model()

def predict_department(text: str) -> dict:
    """
    Predicts the department for a given complaint text.
    Returns { 'department': str, 'confidence': float, 'source': str }
    """
    if not text or not text.strip():
        return {
            "department": "General Administration",
            "confidence": 1.0,
            "source": "fallback_empty_text"
        }

    text = text.strip()

    if NLP_AVAILABLE and pipeline is not None:
        try:
            pred = pipeline.predict([text])[0]
            probs = pipeline.predict_proba([text])[0]
            conf = float(max(probs))
            
            return {
                "department": pred,
                "confidence": conf,
                "source": "nlp_model"
            }
        except Exception as e:
            logger.error(f"NLP Prediction error: {e}")
            # Fallback will trigger below
    
    # Rule-based Fallback if model fails or isn't available
    cat = text.lower()
    target_dept = "Roads Department" # default
    conf = 0.5

    if "pothole" in cat or "road" in cat:
        target_dept = "Roads Department"
    elif "garbage" in cat or "sanit" in cat or "waste" in cat:
        target_dept = "Sanitation Department"
    elif "water" in cat or "leak" in cat:
        target_dept = "Water Supply Department"
    elif "drain" in cat or "sewage" in cat or "flood" in cat:
        target_dept = "Drainage & Sewage Department"
    elif "light" in cat or "electric" in cat or "power" in cat:
        target_dept = "Electricity Department"
    elif "park" in cat or "tree" in cat or "environment" in cat:
        target_dept = "Parks & Environment Department"
    elif "health" in cat or "mosquito" in cat or "disease" in cat:
        target_dept = "Public Health Department"

    return {
        "department": target_dept,
        "confidence": conf,
        "source": "rule_based_fallback"
    }
