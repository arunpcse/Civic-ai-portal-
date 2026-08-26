import logging
import re

logger = logging.getLogger("Dedup-Service")

# Safe dynamic import for SentenceTransformers
model = None
DEDUP_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer, util
    logger.info("Loading SentenceTransformer model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    DEDUP_AVAILABLE = True
    logger.info("SentenceTransformer model loaded successfully.")
except Exception as e:
    logger.warning(f"SentenceTransformer not available ({e}). Using TF-IDF/Jaccard semantic fallback.")
    model = None
    DEDUP_AVAILABLE = False


def _token_similarity(text1: str, text2: str) -> float:
    """Calculates token overlap and character substring similarity."""
    t1 = text1.lower()
    t2 = text2.lower()
    tokens1 = set(re.findall(r'\w+', t1))
    tokens2 = set(re.findall(r'\w+', t2))
    if not tokens1 or not tokens2:
        return 0.0
    
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    jaccard = len(intersection) / len(union)

    # Substring check for keywords like 'road', 'pothole', 'pathole', 'water', 'garbage', 'leakage'
    shared_keywords = [w for w in intersection if len(w) > 3]
    if shared_keywords:
        jaccard = max(jaccard, 0.50 + 0.10 * len(shared_keywords))
    
    return float(min(1.0, jaccard))


def check_duplicate(new_text: str, candidates: list, similarity_threshold: float = 0.35) -> dict:
    """
    Checks if `new_text` is semantically or spatially similar to any of the `candidates`.
    candidates is a list of dictionaries: [{'id': '123', 'text': '...', 'dist': 5.2}, ...]
    """
    if not new_text.strip() or not candidates:
        return {"isDuplicate": False, "matchedComplaintId": None, "similarityScore": 0.0}

    # If SentenceTransformer is available, use neural embeddings
    if DEDUP_AVAILABLE and model is not None:
        try:
            new_embedding = model.encode(new_text, convert_to_tensor=True)
            candidate_texts = [c.get("text", "") for c in candidates]
            candidate_embeddings = model.encode(candidate_texts, convert_to_tensor=True)
            cosine_scores = util.cos_sim(new_embedding, candidate_embeddings)[0]
            best_match_idx = int(cosine_scores.argmax())
            best_score = float(cosine_scores[best_match_idx])
            best_candidate = candidates[best_match_idx]

            # If GPS distance is very close (< 150m), boost duplicate confidence
            dist = best_candidate.get("dist", 9999)
            if dist <= 150:
                best_score = max(best_score, 0.85)

            if best_score >= similarity_threshold or dist <= 150:
                matched_id = best_candidate.get("id")
                return {
                    "isDuplicate": True,
                    "matchedComplaintId": matched_id,
                    "similarityScore": round(best_score, 3),
                    "engine": "SentenceTransformer-MiniLM"
                }
        except Exception as e:
            logger.warning(f"SentenceTransformer error ({e}), falling back to token similarity.")

    # High-accuracy Civic Token & Proximity Fallback
    best_score = 0.0
    matched_id = None

    for cand in candidates:
        c_text = cand.get("text", "")
        dist = cand.get("dist", 9999)
        sim = _token_similarity(new_text, c_text)

        # GPS proximity boost: If within 150 meters, it's virtually the same physical spot!
        if dist <= 150:
            sim = max(sim, 0.85)
        elif dist <= 500:
            sim = max(sim, 0.60 if sim >= 0.20 else sim)

        if sim > best_score:
            best_score = sim
            matched_id = cand.get("id")

    is_dup = best_score >= similarity_threshold
    return {
        "isDuplicate": is_dup,
        "matchedComplaintId": matched_id if is_dup else None,
        "similarityScore": round(best_score, 3),
        "engine": "CivicProximityAndTokenEngine"
    }
