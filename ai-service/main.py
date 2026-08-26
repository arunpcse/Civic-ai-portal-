"""
CivicAI – FastAPI AI Microservice
===================================
Endpoints:
  GET  /              – Health check
  POST /predict-image – YOLO civic image detection
  POST /predict-department – NLP department classifier (Phase 4)
  POST /check-duplicate    – Duplicate detection (Phase 5)
"""

import io
import logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logger = logging.getLogger("CivicAI-Main")

app = FastAPI(
    title="CivicAI AI Microservice",
    description="YOLO Image Detection | NLP Department Classifier | Duplicate Detection",
    version="2.0.0",
)

# Allow requests from Node.js Express backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Import service modules ───────────────────────────────────────────────────
from services.vision_service import (
    YOLO_AVAILABLE,
    yolo_model,
    predict_with_yolo,
    predict_rule_based,
)
from services.nlp_service import predict_department as predict_nlp
from services.dedup_service import check_duplicate as check_dup


# ─── Health Check ────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "CivicAI FastAPI AI Microservice",
        "version": "2.0.0",
        "status": "healthy",
        "yoloAvailable": YOLO_AVAILABLE,
        "endpoints": {
            "predict_image":     "POST /predict-image",
            "predict_department":"POST /predict-department  (Phase 4)",
            "check_duplicate":   "POST /check-duplicate     (Phase 5)",
        },
    }


# ─── POST /predict-image ─────────────────────────────────────────────────────
@app.post("/predict-image", tags=["Vision"])
async def predict_image(
    image: UploadFile = File(...),
    text: str = Form(""),
    category_hint: str = Form(""),
):
    """
    Accept an image file and return:
    {
        "category":        "water_leakage",
        "citizenCategory": "Water Leakage",
        "confidence":      0.94,
        "model":           "YOLOv8-CivicAI",
        "boundingBox":     { "x1":..., "y1":..., "x2":..., "y2":... },
        "source":          "yolo" | "vision_context_fusion"
    }
    """
    # Validate content type
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{image.content_type}'. Only image files are accepted.",
        )

    image_bytes = await image.read()

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image file must be smaller than 10MB.")

    if YOLO_AVAILABLE and yolo_model is not None:
        try:
            result = predict_with_yolo(image_bytes)
        except Exception as e:
            logger.warning(f"YOLO inference error ({e}), using rule-based fallback.")
            result = predict_rule_based(
                filename=image.filename,
                file_size=len(image_bytes),
                image_bytes=image_bytes,
                hint_text=text,
                category_hint=category_hint,
            )
    else:
        result = predict_rule_based(
            filename=image.filename,
            file_size=len(image_bytes),
            image_bytes=image_bytes,
            hint_text=text,
            category_hint=category_hint,
        )

    return JSONResponse(content={
        "success": True,
        **result,
    })


# ─── POST /predict-department (Stub – implemented fully in Phase 4) ───────────
@app.post("/predict-department", tags=["NLP"])
async def predict_department(body: dict):
    """
    Accepts JSON body: { "description": "text..." }
    Returns: { "department": "...", "confidence": 0.94 }
    """
    text = body.get("description") or body.get("text") or ""
    
    result = predict_nlp(text)
    
    return JSONResponse(content={
        "success": True,
        **result
    })


# ─── POST /check-duplicate ──────────────────────────────────────────────
@app.post("/check-duplicate", tags=["Deduplication"])
async def check_duplicate_endpoint(body: dict):
    """
    Accepts JSON body: 
    { 
      "text": "new complaint description", 
      "candidates": [{"id": "xyz", "text": "candidate description"}, ...] 
    }
    """
    new_text = body.get("text", "")
    candidates = body.get("candidates", [])
    
    result = check_dup(new_text, candidates)
    
    return JSONResponse(content={
        "success": True,
        **result
    })


# ─── Run ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
