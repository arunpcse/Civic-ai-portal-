"""
CivicAI – YOLOv8 Custom Dataset Training Script
=================================================

DATASET STRUCTURE
─────────────────
ai-service/
└── datasets/
    └── civic_images/
        ├── images/
        │   ├── train/   ← Place training JPGs here
        │   └── val/     ← Place validation JPGs here
        └── labels/
            ├── train/   ← YOLO .txt annotations for train images
            └── val/     ← YOLO .txt annotations for val images

YOLO ANNOTATION FORMAT  (one line per detected object)
───────────────────────
<class_id> <x_center> <y_center> <width> <height>

All coordinates are NORMALISED (0.0 → 1.0) relative to image width/height.

Example label file  (pothole_001.txt):
  0 0.45 0.60 0.30 0.20   ← class 0 (pothole), bounding box

CLASS INDEX MAP
───────────────
0 → pothole
1 → garbage
2 → water_leakage
3 → drainage
4 → road_damage

RECOMMENDED DATASET SOURCES
────────────────────────────
• Roboflow Universe  – search "pothole detection", "garbage detection"
• Kaggle             – search "pothole dataset yolo"
• OIDv6 / OpenImages – filter labels: road, waste, drain

Minimum recommended: ≥ 200 images per class (1 000 total)

─────────────────────────────────────────────────────────────────────────
RUN TRAINING
─────────────────────────────────────────────────────────────────────────
  cd ai-service
  python training/train_yolo.py

Output weights → ai-service/runs/detect/civic_model/weights/best.pt
Copy best.pt   → ai-service/models/best.pt
─────────────────────────────────────────────────────────────────────────
"""

import os
import sys
from pathlib import Path

# ─── Paths ───────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent          # ai-service/
DATASET_DIR = ROOT / "datasets" / "civic_images"
MODELS_DIR  = ROOT / "models"
MODELS_DIR.mkdir(exist_ok=True)

DATA_YAML = ROOT / "datasets" / "data.yaml"


# ─── Step 1 – Generate data.yaml ─────────────────────────────────────────────
def write_data_yaml():
    content = f"""# CivicAI YOLO Dataset Configuration
path: {DATASET_DIR.as_posix()}
train: images/train
val:   images/val

nc: 5   # number of classes

names:
  0: pothole
  1: garbage
  2: water_leakage
  3: drainage
  4: road_damage
"""
    DATA_YAML.write_text(content)
    print(f"[+] data.yaml written → {DATA_YAML}")


# ─── Step 2 – Train ──────────────────────────────────────────────────────────
def train():
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[!] ultralytics not installed. Run:  pip install ultralytics")
        sys.exit(1)

    # Check that at least some training images exist
    train_images = list((DATASET_DIR / "images" / "train").glob("*.*"))
    if not train_images:
        print(
            "\n[!] No training images found in datasets/civic_images/images/train/\n"
            "    Add labelled images and corresponding .txt annotation files\n"
            "    before running training.\n"
        )
        # ── Demo mode: show what the training call looks like ──────────────
        print("=" * 60)
        print("  DEMO – Training command (run after adding your dataset):")
        print("=" * 60)
        demo_code = """
  from ultralytics import YOLO

  model = YOLO("yolov8n.pt")          # transfer-learn from nano pretrained

  model.train(
      data="datasets/data.yaml",
      epochs=50,
      imgsz=640,
      batch=16,
      name="civic_model",
      project="runs/detect",
      patience=10,                     # early-stopping patience
      save=True,
      device=0 if torch.cuda.is_available() else "cpu",
  )
  # Trained weights saved → runs/detect/civic_model/weights/best.pt
  # Copy best.pt → ai-service/models/best.pt  for FastAPI to load.
"""
        print(demo_code)
        return

    # ── Real training path ────────────────────────────────────────────────
    print(f"[*] Found {len(train_images)} training images. Starting training …")

    import torch
    model = YOLO("yolov8n.pt")

    results = model.train(
        data=str(DATA_YAML),
        epochs=50,
        imgsz=640,
        batch=16,
        name="civic_model",
        project=str(ROOT / "runs" / "detect"),
        patience=10,
        save=True,
        device=0 if torch.cuda.is_available() else "cpu",
    )

    # Validation metrics
    metrics = model.val()
    print(f"\n[+] mAP@50   : {metrics.box.map50:.4f}")
    print(f"[+] mAP@50-95: {metrics.box.map:.4f}")

    # Copy best.pt → models/
    best_pt = ROOT / "runs" / "detect" / "civic_model" / "weights" / "best.pt"
    if best_pt.exists():
        import shutil
        dest = MODELS_DIR / "best.pt"
        shutil.copy(best_pt, dest)
        print(f"[+] best.pt copied → {dest}")
        print("[OK] Training complete. Restart FastAPI to load the new model.")
    else:
        print("[!] best.pt not found after training. Check for errors above.")


# ─── Entry point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    write_data_yaml()
    train()
