"""
CivicAI – NLP Department Classifier
=====================================
Model:  TF-IDF (char + word n-grams)  →  Logistic Regression
Labels: 7 government departments

Usage:
  cd ai-service
  python training/train_nlp.py

Output:
  ai-service/models/nlp_model.pkl   ← joblib bundle: {vectorizer, model, label_encoder}
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)
MODEL_OUT = MODELS_DIR / "nlp_model.pkl"

# ── Department labels ─────────────────────────────────────────────────────────
DEPARTMENTS = [
    "Roads Department",
    "Sanitation Department",
    "Water Supply Department",
    "Drainage & Sewage Department",
    "Electricity Department",
    "Parks & Environment Department",
    "Public Health Department",
]

# ── Training corpus – 35+ examples per department ────────────────────────────
TRAINING_DATA = [
    # ── Roads Department ──────────────────────────────────────────────────────
    ("large pothole on main road causing accidents", "Roads Department"),
    ("road has severe cracks and broken asphalt near school", "Roads Department"),
    ("highway divider is damaged and broken", "Roads Department"),
    ("road surface erosion after heavy rain", "Roads Department"),
    ("footpath tiles are broken near bus stand", "Roads Department"),
    ("potholes on service road outside market", "Roads Department"),
    ("road cave-in near junction creating traffic hazard", "Roads Department"),
    ("speed breaker broken and dangerous for vehicles", "Roads Department"),
    ("road repair work left incomplete for two months", "Roads Department"),
    ("gravel and debris on road after construction", "Roads Department"),
    ("road marking faded completely on highway", "Roads Department"),
    ("broken road divider causing accidents at night", "Roads Department"),
    ("pothole filled with water blocking vehicle movement", "Roads Department"),
    ("flyover surface cracked and dangerous for bikes", "Roads Department"),
    ("bridge road needs urgent repair work", "Roads Department"),
    ("road near colony entrance full of potholes", "Roads Department"),
    ("asphalt road damaged by heavy trucks", "Roads Department"),
    ("road near temple broken for six months", "Roads Department"),
    ("street road uneven causing vehicles to topple", "Roads Department"),
    ("road collapse near drainage pipe laying work", "Roads Department"),

    # ── Sanitation Department ──────────────────────────────────────────────────
    ("garbage not collected for three days in area", "Sanitation Department"),
    ("overflowing dustbin attracting stray animals", "Sanitation Department"),
    ("open waste dumping near residential society", "Sanitation Department"),
    ("garbage heap near school entrance creating health hazard", "Sanitation Department"),
    ("waste collection vehicle not coming to colony", "Sanitation Department"),
    ("illegal dumping of construction waste on street", "Sanitation Department"),
    ("plastic waste burning causing air pollution", "Sanitation Department"),
    ("garbage bin broken and waste scattered everywhere", "Sanitation Department"),
    ("no street sweeping done for two weeks", "Sanitation Department"),
    ("sanitation worker not collecting waste properly", "Sanitation Department"),
    ("garbage piling near apartment complex gate", "Sanitation Department"),
    ("bio-medical waste found dumped near park", "Sanitation Department"),
    ("trash dump near children's playground is unsafe", "Sanitation Department"),
    ("restaurant throwing food waste on public road", "Sanitation Department"),
    ("bulk waste lying uncleared near market for days", "Sanitation Department"),
    ("animal carcass lying on street not removed", "Sanitation Department"),
    ("rubbish dump outside school not cleared", "Sanitation Department"),
    ("debris from demolished building blocking footpath", "Sanitation Department"),
    ("dustbin overflow at bus stop stinking badly", "Sanitation Department"),
    ("open burning of garbage near housing area", "Sanitation Department"),

    # ── Water Supply Department ───────────────────────────────────────────────
    ("water pipe burst flooding entire street", "Water Supply Department"),
    ("no water supply for three consecutive days", "Water Supply Department"),
    ("low water pressure in taps since last week", "Water Supply Department"),
    ("dirty brown water coming from municipal taps", "Water Supply Department"),
    ("water leakage from underground pipe wasting water", "Water Supply Department"),
    ("overhead water tank leaking causing seepage", "Water Supply Department"),
    ("water meter damaged and showing wrong reading", "Water Supply Department"),
    ("contaminated water supply causing illness in colony", "Water Supply Department"),
    ("water pipe leakage near bus stand for weeks", "Water Supply Department"),
    ("drinking water not supplied to area for two days", "Water Supply Department"),
    ("main water line broken near school junction", "Water Supply Department"),
    ("water supply cut without prior notice in area", "Water Supply Department"),
    ("municipality water tanker not reaching slum area", "Water Supply Department"),
    ("water connection pipe damaged by road digging", "Water Supply Department"),
    ("stagnant municipal water standing in street", "Water Supply Department"),
    ("borewell motor stolen and water supply stopped", "Water Supply Department"),
    ("leaking water pipeline below road surface", "Water Supply Department"),
    ("water pipe joints loosened and spraying on road", "Water Supply Department"),
    ("sewage mixing with drinking water in pipes", "Water Supply Department"),
    ("irregular water supply timings causing inconvenience", "Water Supply Department"),

    # ── Drainage & Sewage Department ──────────────────────────────────────────
    ("drain blocked causing sewage overflow on street", "Drainage & Sewage Department"),
    ("sewage water flowing into homes after rain", "Drainage & Sewage Department"),
    ("manhole cover missing posing danger to pedestrians", "Drainage & Sewage Department"),
    ("stormwater drain choked with plastic waste", "Drainage & Sewage Department"),
    ("open drain near colony emitting foul smell", "Drainage & Sewage Department"),
    ("sewage overflow flooding basement of building", "Drainage & Sewage Department"),
    ("roadside drain not cleaned for months", "Drainage & Sewage Department"),
    ("sewer pipe burst near school causing flooding", "Drainage & Sewage Department"),
    ("drainage canal blocked causing waterlogging", "Drainage & Sewage Department"),
    ("open manhole without cover dangerous at night", "Drainage & Sewage Department"),
    ("septic tank overflow in residential area", "Drainage & Sewage Department"),
    ("drainage system collapsed causing road to sink", "Drainage & Sewage Department"),
    ("underground sewer line broken and leaking", "Drainage & Sewage Department"),
    ("waterlogging due to clogged stormwater drain", "Drainage & Sewage Department"),
    ("gutter overflow during light rain event", "Drainage & Sewage Department"),
    ("sewage smell from broken pipeline near market", "Drainage & Sewage Department"),
    ("residential drain connected to storm drain causing overflow", "Drainage & Sewage Department"),
    ("drainage water entering road during rain", "Drainage & Sewage Department"),
    ("catch basin full of debris and not draining", "Drainage & Sewage Department"),
    ("sewage canal open near children's school", "Drainage & Sewage Department"),

    # ── Electricity Department ────────────────────────────────────────────────
    ("street light not working on main road for weeks", "Electricity Department"),
    ("electricity pole fallen on road after storm", "Electricity Department"),
    ("low voltage issue causing appliance damage in colony", "Electricity Department"),
    ("electric wire hanging loose and touching road", "Electricity Department"),
    ("transformer sparking near residential area", "Electricity Department"),
    ("frequent power cuts causing problems for businesses", "Electricity Department"),
    ("street light flickering continuously at night", "Electricity Department"),
    ("broken electricity meter reading inflated bills", "Electricity Department"),
    ("overhead electric cable snapped in heavy rain", "Electricity Department"),
    ("power outage for more than 12 hours without reason", "Electricity Department"),
    ("live electric wire lying in puddle of water", "Electricity Department"),
    ("underground cable damage near road digging work", "Electricity Department"),
    ("illegal electricity connection from street pole", "Electricity Department"),
    ("electric junction box open and exposed near park", "Electricity Department"),
    ("high voltage shock risk from damaged switchboard", "Electricity Department"),
    ("CCTV camera electricity connection cut", "Electricity Department"),
    ("electric pole close to falling due to corrosion", "Electricity Department"),
    ("generator failure causing hospital power cut", "Electricity Department"),
    ("streetlight column damaged by vehicle accident", "Electricity Department"),
    ("wiring in community hall melted due to overload", "Electricity Department"),

    # ── Parks & Environment Department ───────────────────────────────────────
    ("overgrown tree branch falling on road risk", "Parks & Environment Department"),
    ("public park benches broken and unusable", "Parks & Environment Department"),
    ("dead tree needs urgent cutting on footpath", "Parks & Environment Department"),
    ("park pathway lights not working at night", "Parks & Environment Department"),
    ("tree roots lifting footpath slabs dangerously", "Parks & Environment Department"),
    ("park garden not maintained weeds everywhere", "Parks & Environment Department"),
    ("playground swings broken and rusty in community park", "Parks & Environment Department"),
    ("noise pollution from construction near residential area", "Parks & Environment Department"),
    ("illegal tree cutting by builder near park", "Parks & Environment Department"),
    ("flood pond in park overflowing near road", "Parks & Environment Department"),
    ("park fence broken allowing stray animals inside", "Parks & Environment Department"),
    ("open burning of leaves causing air pollution", "Parks & Environment Department"),
    ("tree uprooted blocking road after cyclone", "Parks & Environment Department"),
    ("no greenery maintained along divider road", "Parks & Environment Department"),
    ("public garden locked and inaccessible to citizens", "Parks & Environment Department"),
    ("park water fountain not working for months", "Parks & Environment Department"),
    ("bird feeder installation requested in public garden", "Parks & Environment Department"),
    ("chemical smell from nearby factory affecting park", "Parks & Environment Department"),
    ("lake near park polluted by industrial discharge", "Parks & Environment Department"),
    ("park toilet facility broken and unusable", "Parks & Environment Department"),

    # ── Public Health Department ──────────────────────────────────────────────
    ("mosquito breeding in stagnant water near colony", "Public Health Department"),
    ("dengue cases increasing due to waterlogging near area", "Public Health Department"),
    ("illegal food stall selling contaminated food", "Public Health Department"),
    ("rats infestation in residential building", "Public Health Department"),
    ("hospital waste found dumped in open public space", "Public Health Department"),
    ("dead animals not removed causing disease risk", "Public Health Department"),
    ("malaria mosquito fogging not done in weeks", "Public Health Department"),
    ("food poisoning from restaurant unhygienic conditions", "Public Health Department"),
    ("unhygienic meat shop operating without license", "Public Health Department"),
    ("overcrowded hospital ward needs inspection", "Public Health Department"),
    ("fly infestation near fish market causing health risk", "Public Health Department"),
    ("stray dog bites reported in colony need action", "Public Health Department"),
    ("snake found in residential area needs removal", "Public Health Department"),
    ("air quality very poor due to factory pollution", "Public Health Department"),
    ("water sample tested positive for bacteria contamination", "Public Health Department"),
    ("rabies vaccine not available at government hospital", "Public Health Department"),
    ("open defecation happening near water body", "Public Health Department"),
    ("vermin pest control not done in public area", "Public Health Department"),
    ("toxic chemical smell from nearby industry", "Public Health Department"),
    ("vector control program needed urgently in area", "Public Health Department"),
]


def build_training_df():
    df = pd.DataFrame(TRAINING_DATA, columns=["text", "department"])
    print(f"[*] Training samples: {len(df)}")
    print(df["department"].value_counts())
    return df


def train_classifier(df):
    X = df["text"].values
    y = df["department"].values

    # Pipeline: TF-IDF (word + char n-grams) → Logistic Regression
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 3),
            analyzer="word",
            max_features=8000,
            sublinear_tf=True,
            min_df=1,
        )),
        ("clf", LogisticRegression(
            C=5.0,
            max_iter=1000,
            solver="lbfgs",
            random_state=42,
        )),
    ])

    # Cross-validation
    cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring="accuracy")
    print(f"\n[+] Cross-Validation Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Final fit on full data
    pipeline.fit(X, y)

    # Hold-out test (20%)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    pipeline_test = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 3),
            analyzer="word",
            max_features=8000,
            sublinear_tf=True,
            min_df=1,
        )),
        ("clf", LogisticRegression(
            C=5.0,
            max_iter=1000,
            solver="lbfgs",
            random_state=42,
        )),
    ])
    pipeline_test.fit(X_train, y_train)
    y_pred = pipeline_test.predict(X_test)
    print(f"\n[+] Hold-out Test Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\n[+] Classification Report:\n")
    print(classification_report(y_test, y_pred, zero_division=0))

    return pipeline


def save_model(pipeline):
    bundle = {
        "pipeline": pipeline,         # contains both vectorizer and classifier
        "departments": DEPARTMENTS,
        "version": "1.0.0",
    }
    joblib.dump(bundle, MODEL_OUT)
    print(f"\n[+] Model saved to {MODEL_OUT}")


def quick_demo(pipeline):
    test_cases = [
        "huge pothole on highway near flyover",
        "garbage not collected for a week",
        "water pipe burst near market street",
        "drain overflowing after rain blocked by waste",
        "street light pole broken at junction",
        "dead tree branch falling on path",
        "mosquito breeding in waterlogged area",
    ]
    print("\n[*] Quick Demo Predictions:")
    print("-" * 55)
    for text in test_cases:
        pred = pipeline.predict([text])[0]
        probs = pipeline.predict_proba([text])[0]
        conf = max(probs)
        print(f"  '{text[:40]:<40}' -> {pred} ({conf:.2f})")


if __name__ == "__main__":
    print("=" * 60)
    print("   CivicAI NLP Department Classifier – Training")
    print("=" * 60)
    df = build_training_df()
    pipeline = train_classifier(df)
    save_model(pipeline)
    quick_demo(pipeline)
    print("\n[OK] Training complete. Restart FastAPI to load the new model.")
