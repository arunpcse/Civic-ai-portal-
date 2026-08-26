import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_a3_workflow_poster():
    # A3 Landscape at ~200-300 DPI: 3508 x 2480 pixels
    W, H = 3508, 2480
    img = Image.new("RGB", (W, H), "#0b1120")
    draw = ImageDraw.Draw(img)

    # Try to load Windows system fonts, fallback to default if not found
    def get_font(size, bold=False):
        font_names = ["segoeuib.ttf" if bold else "segoeui.ttf", "arialbd.ttf" if bold else "arial.ttf", "calibrib.ttf" if bold else "calibri.ttf"]
        for fn in font_names:
            try:
                path = os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts", fn)
                if os.path.exists(path):
                    return ImageFont.truetype(path, size)
            except Exception:
                pass
        try:
            return ImageFont.load_default()
        except:
            return None

    f_title = get_font(52, bold=True)
    f_sub = get_font(26, bold=False)
    f_badge = get_font(22, bold=True)
    f_stat_lbl = get_font(18, bold=False)
    f_stat_val = get_font(24, bold=True)
    
    f_col_title = get_font(28, bold=True)
    f_col_badge = get_font(18, bold=True)
    
    f_step_num = get_font(22, bold=True)
    f_step_name = get_font(23, bold=True)
    f_step_tag = get_font(17, bold=True)
    f_body = get_font(19, bold=False)
    f_bullet = get_font(18, bold=False)
    f_conn = get_font(17, bold=True)
    
    f_arch_title = get_font(24, bold=True)
    f_arch_body = get_font(18, bold=False)
    f_chip = get_font(18, bold=True)

    # ─────────────────────────────────────────────────────────────
    # 1. HEADER BANNER
    # ─────────────────────────────────────────────────────────────
    pad = 40
    head_h = 160
    # Header card background
    draw.rounded_rectangle([pad, pad, W - pad, pad + head_h], radius=16, fill="#131d33", outline="#0284c7", width=3)
    
    # Gov Pill
    draw.rounded_rectangle([pad + 30, pad + 32, pad + 200, pad + 82], radius=10, fill="#0284c7")
    draw.text((pad + 48, pad + 44), "CIVICAI PORTAL", fill="#ffffff", font=f_badge)
    
    # Title & Subtitle
    draw.text((pad + 225, pad + 28), "CIVIC GRIEVANCE AI REDRESSAL SYSTEM — COMPLETE SYSTEM WORKFLOW", fill="#38bdf8", font=f_title)
    draw.text((pad + 225, pad + 95), "Automated YOLOv8 Vision Defect Inspection • NLP Routing • Spatio-Temporal Deduplication • 6-Tier Location Hierarchy • SLA Governance", fill="#94a3b8", font=f_sub)

    # Header Stats on right
    stat_x = W - pad - 680
    draw.rounded_rectangle([stat_x, pad + 25, W - pad - 30, pad + 135], radius=12, fill="#0f172a", outline="#334155", width=2)
    
    draw.text((stat_x + 25, pad + 40), "AI INFERENCE", fill="#64748b", font=f_stat_lbl)
    draw.text((stat_x + 25, pad + 70), "< 350 ms", fill="#38bdf8", font=f_stat_val)

    draw.text((stat_x + 190, pad + 40), "DEDUPLICATION", fill="#64748b", font=f_stat_lbl)
    draw.text((stat_x + 190, pad + 70), "Haversine <= 50m", fill="#818cf8", font=f_stat_val)

    draw.text((stat_x + 430, pad + 40), "LOCATION PRECISION", fill="#64748b", font=f_stat_lbl)
    draw.text((stat_x + 430, pad + 70), "6-Tier Hierarchy", fill="#34d399", font=f_stat_val)

    # ─────────────────────────────────────────────────────────────
    # 2. 5 SWIMLANES GRID
    # ─────────────────────────────────────────────────────────────
    grid_y = pad + head_h + 25
    grid_h = 1680
    num_cols = 5
    col_w = (W - 2 * pad - (num_cols - 1) * 20) // num_cols

    columns = [
        {
            "num": "1",
            "title": "Citizen Intake",
            "sub": "PORTAL / PWA",
            "header_bg": "#0369a1",
            "border": "#0284c7",
            "steps": [
                {
                    "n": "1", "name": "Grievance Submission", "tag": "React + Leaflet", "tag_bg": "#0284c7",
                    "desc": "Citizen captures defect photo & details through bilingual UI (English / தமிழ்):",
                    "bullets": ["Geotagged image upload via camera/file", "Category (Road, Water, Light, Garbage)", "Voice / Tamil text description input"]
                },
                {
                    "n": "2", "name": "6-Tier Hierarchy Pin", "tag": "Spatial DB", "tag_bg": "#0369a1",
                    "desc": "Cascading geocoding eliminates jurisdiction ambiguity:",
                    "bullets": ["Corp -> Zone 05 -> Ward 45", "Locality (George Town) -> Street", "Leaflet Map Interceptor sets GPS Lat/Long"]
                },
                {
                    "n": "3", "name": "Tracking Token Issue", "tag": "REST API", "tag_bg": "#334155",
                    "desc": "Generates unique citizen tracking token: GRV-2026-XXXXX with initial status: 'Submitted'.",
                    "bullets": ["Status: Submitted", "Stored in MongoDB Atlas", "Triggers AI Pipeline instantly"]
                }
            ]
        },
        {
            "num": "2",
            "title": "AI Intelligence Engine",
            "sub": "FASTAPI + PYTORCH",
            "header_bg": "#4338ca",
            "border": "#6366f1",
            "steps": [
                {
                    "n": "4", "name": "YOLOv8 Vision Model", "tag": "PyTorch YOLO", "tag_bg": "#4f46e5",
                    "desc": "POST /predict-image evaluates civic photo:",
                    "bullets": ["Detects potholes, trash dumps, pipe leaks", "Extracts Bounding Box coordinates", "Model confidence evaluation (> 90%)"]
                },
                {
                    "n": "5", "name": "NLP Dept Classifier", "tag": "TF-IDF Model", "tag_bg": "#4338ca",
                    "desc": "POST /predict-department maps text to department:",
                    "bullets": ["Roads & Infrastructure", "Water Supply & Sewerage (CMWSSB)", "Solid Waste & Electrical Services"]
                },
                {
                    "n": "6", "name": "Deduplication Engine", "tag": "Haversine + Cosine", "tag_bg": "#3730a3",
                    "desc": "Detects active issues within 50m radius:",
                    "bullets": ["Dist = 2R*asin(sqrt(hav(dLat)+cos*cos*hav(dLon)))", "Clusters duplicates to Parent Ticket", "duplicateCount++ prevents double crew dispatch"]
                }
            ]
        },
        {
            "num": "3",
            "title": "SLA & Dept Triage",
            "sub": "DEPT DASHBOARD",
            "header_bg": "#b45309",
            "border": "#f59e0b",
            "steps": [
                {
                    "n": "7", "name": "Dynamic Urgency Score", "tag": "Score: 0-100", "tag_bg": "#d97706",
                    "desc": "Evaluates safety hazards and impact:",
                    "bullets": ["Critical (85-95): Burst Pipe, Live Wire", "High (70-84): Deep Crater, Arterial Road", "Medium / Low: Standard Patch / Clean"]
                },
                {
                    "n": "8", "name": "Work Order Dispatch", "tag": "Assignment", "tag_bg": "#b45309",
                    "desc": "Department Admin routes work order:",
                    "bullets": ["Matches ticket to Ward Assistant Engineer", "Status transitions to 'Assigned'", "Push alert sent to field technician"]
                },
                {
                    "n": "9", "name": "SLA Clock & Escalation", "tag": "Timer Engine", "tag_bg": "#92400e",
                    "desc": "Strict resolution deadlines (24h / 48h / 72h):",
                    "bullets": ["Real-time countdown timer active", "Automated escalation to Zonal Commissioner", "Alerts triggered upon SLA breach risk"]
                }
            ]
        },
        {
            "num": "4",
            "title": "Field Action & Repair",
            "sub": "STAFF APP",
            "header_bg": "#047857",
            "border": "#10b981",
            "steps": [
                {
                    "n": "10", "name": "Ground Acceptance", "tag": "In Progress", "tag_bg": "#059669",
                    "desc": "Field engineer opens assigned work order:",
                    "bullets": ["Navigates to spot using embedded GPS pin", "Sets status to 'In Progress'", "Inspects AI bounding box & defect notes"]
                },
                {
                    "n": "11", "name": "After-Image Upload", "tag": "Resolution", "tag_bg": "#047857",
                    "desc": "Mandatory proof submission on site:",
                    "bullets": ["Uploads geotagged After-Repair photo", "Logs completion notes & materials used", "Status changes to 'Resolution Submitted'"]
                },
                {
                    "n": "12", "name": "Dual Proof Comparison", "tag": "Audit Proof", "tag_bg": "#065f46",
                    "desc": "Generates side-by-side Before/After visual comparison proof in the citizen's live tracking view.",
                    "bullets": ["Before: Unresolved defect image", "After: Ground verified repaired image"]
                }
            ]
        },
        {
            "num": "5",
            "title": "Citizen Audit & Closure",
            "sub": "FINAL AUDIT",
            "header_bg": "#be185d",
            "border": "#ec4899",
            "steps": [
                {
                    "n": "13", "name": "Citizen Resolution Alert", "tag": "Notification", "tag_bg": "#db2777",
                    "desc": "Citizen receives instant SMS/Portal notification with resolution photos for audit.",
                    "bullets": ["SMS & In-App Notification", "Presents Before & After comparison", "Unlocks confirmation modal"]
                },
                {
                    "n": "14", "name": "Feedback & Rating", "tag": "Citizen Confirmed", "tag_bg": "#be185d",
                    "desc": "Citizen validates repair quality:",
                    "bullets": ["Satisfied: 1-5 Stars -> Marked 'Closed'", "Unsatisfied: Reopens ticket with grievance", "Reopened tickets escalated to Zonal Head"]
                },
                {
                    "n": "15", "name": "Ward KPI & Analytics", "tag": "Executive KPI", "tag_bg": "#9d174d",
                    "desc": "Aggregates performance metrics:",
                    "bullets": ["Ward Resolution Rate Scorecards", "Geographic Defect Density Heatmaps", "Department SLA compliance index"]
                }
            ]
        }
    ]

    for i, col in enumerate(columns):
        cx = pad + i * (col_w + 20)
        cy = grid_y
        cw = col_w
        ch = grid_h

        # Column background container
        draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=14, fill="#0f172a", outline=col["border"], width=2)

        # Column Header
        draw.rounded_rectangle([cx, cy, cx + cw, cy + 85], radius=14, fill=col["header_bg"])
        draw.rectangle([cx, cy + 60, cx + cw, cy + 85], fill=col["header_bg"]) # square bottom corners of header
        
        draw.text((cx + 18, cy + 16), f"{col['num']}. {col['title']}", fill="#ffffff", font=f_col_title)
        
        # Sub badge in header
        badge_w = 170
        draw.rounded_rectangle([cx + cw - badge_w - 15, cy + 24, cx + cw - 15, cy + 60], radius=8, fill="#1e293b")
        draw.text((cx + cw - badge_w + 10, cy + 30), col["sub"], fill="#38bdf8", font=f_col_badge)

        # Draw 3 Steps inside this column
        step_y = cy + 105
        step_h = 420
        step_gap = 90

        for s_idx, step in enumerate(col["steps"]):
            # Step Card
            card_top = step_y + s_idx * (step_h + step_gap)
            card_bot = card_top + step_h
            
            draw.rounded_rectangle([cx + 15, card_top, cx + cw - 15, card_bot], radius=12, fill="#1e293b", outline="#334155", width=2)
            
            # Step Number Circle
            draw.ellipse([cx + 28, card_top + 20, cx + 68, card_top + 60], fill="#38bdf8")
            draw.text((cx + 39, card_top + 26), step["n"], fill="#0f172a", font=f_step_num)
            
            # Step Title
            draw.text((cx + 80, card_top + 25), step["name"], fill="#f8fafc", font=f_step_name)
            
            # Step Tag
            tag_w = len(step["tag"]) * 11 + 20
            draw.rounded_rectangle([cx + cw - tag_w - 28, card_top + 22, cx + cw - 28, card_top + 56], radius=6, fill=step["tag_bg"])
            draw.text((cx + cw - tag_w - 18, card_top + 28), step["tag"], fill="#ffffff", font=f_step_tag)

            # Step Description
            draw.text((cx + 30, card_top + 80), step["desc"], fill="#cbd5e1", font=f_body)

            # Bullet points
            by = card_top + 130
            for b in step["bullets"]:
                draw.ellipse([cx + 32, by + 6, cx + 42, by + 16], fill="#38bdf8")
                draw.text((cx + 52, by), b, fill="#94a3b8", font=f_bullet)
                by += 42

            # Flow Arrow Connector between steps
            if s_idx < 2:
                arrow_cy = card_bot + step_gap // 2
                draw.line([cx + cw // 2, card_bot + 10, cx + cw // 2, card_bot + step_gap - 10], fill="#38bdf8", width=4)
                # arrowhead
                draw.polygon([
                    (cx + cw // 2, card_bot + step_gap - 8),
                    (cx + cw // 2 - 10, card_bot + step_gap - 26),
                    (cx + cw // 2 + 10, card_bot + step_gap - 26)
                ], fill="#38bdf8")

    # ─────────────────────────────────────────────────────────────
    # 3. BOTTOM ARCHITECTURE & MATRIX SECTION
    # ─────────────────────────────────────────────────────────────
    bot_y = grid_y + grid_h + 25
    bot_h = H - pad - bot_y
    card_w = (W - 2 * pad - 40) // 3

    # Bottom Box 1: Tech Stack
    b1_x = pad
    draw.rounded_rectangle([b1_x, bot_y, b1_x + card_w, bot_y + bot_h], radius=14, fill="#131d33", outline="#0284c7", width=2)
    draw.text((b1_x + 25, bot_y + 20), "⚡ SYSTEM TECHNOLOGY STACK", fill="#38bdf8", font=f_arch_title)
    
    chips_1 = [
        "Frontend: React 18 + Vite + TailwindCSS",
        "Geospatial: React-Leaflet + OpenStreetMap",
        "Backend Core: Node.js + Express + JWT Auth",
        "Database: MongoDB Atlas + Mongoose ORM",
        "AI Microservice: Python 3.11 + FastAPI",
        "Computer Vision: Ultralytics YOLOv8",
        "NLP: Scikit-Learn TF-IDF + Cosine Matching"
    ]
    cy_text = bot_y + 65
    for c in chips_1:
        draw.text((b1_x + 25, cy_text), f"• {c}", fill="#cbd5e1", font=f_arch_body)
        cy_text += 32

    # Bottom Box 2: Lifecycle State Matrix
    b2_x = b1_x + card_w + 20
    draw.rounded_rectangle([b2_x, bot_y, b2_x + card_w, bot_y + bot_h], radius=14, fill="#131d33", outline="#818cf8", width=2)
    draw.text((b2_x + 25, bot_y + 20), "🔄 12-STATE COMPLAINT LIFECYCLE MATRIX", fill="#818cf8", font=f_arch_title)
    
    states = [
        ("Submitted", "#1e3a5f", "#93c5fd"), ("AI Processing", "#312e81", "#c7d2fe"),
        ("Verified", "#312e81", "#c7d2fe"), ("Assigned", "#78350f", "#fde68a"),
        ("In Progress", "#064e3b", "#a7f3d0"), ("Resolution Submitted", "#134e4a", "#99f6e4"),
        ("Verification", "#581c87", "#e9d5ff"), ("Citizen Confirmed", "#14532d", "#bbf7d0"),
        ("Closed", "#14532d", "#bbf7d0"), ("Duplicate", "#4c1d95", "#ddd6fe"),
        ("Escalated", "#78350f", "#fde68a"), ("Reopened", "#831843", "#fbcfe8")
    ]
    
    st_start_x = b2_x + 25
    st_start_y = bot_y + 65
    for idx, (st_name, bg_c, fg_c) in enumerate(states):
        row = idx // 4
        col_pos = idx % 4
        box_x = st_start_x + col_pos * 255
        box_y = st_start_y + row * 60
        draw.rounded_rectangle([box_x, box_y, box_x + 240, box_y + 48], radius=8, fill=bg_c, outline=fg_c, width=1)
        draw.text((box_x + 15, box_y + 12), st_name, fill=fg_c, font=f_chip)

    draw.text((b2_x + 25, bot_y + bot_h - 45), "Role Access Control: Citizen <-> Field Staff <-> Department Admin <-> Super Admin", fill="#94a3b8", font=f_arch_body)

    # Bottom Box 3: 6-Tier Geographic Resolution Model
    b3_x = b2_x + card_w + 20
    draw.rounded_rectangle([b3_x, bot_y, b3_x + card_w, bot_y + bot_h], radius=14, fill="#131d33", outline="#34d399", width=2)
    draw.text((b3_x + 25, bot_y + 20), "📍 6-TIER GEOGRAPHIC JURISDICTION MODEL", fill="#34d399", font=f_arch_title)

    tiers = [
        "1. Municipal Corporation: Greater Chennai / Coimbatore / Madurai",
        "2. Administrative Zone: Zone 01 to Zone 15 (e.g., Royapuram)",
        "3. Ward Division: Ward 01 to Ward 200 (e.g., Ward 045)",
        "4. Locality / Neighborhood: E.g., George Town / T. Nagar",
        "5. Street / Avenue: E.g., NSC Bose Road / 4th Main Road",
        "6. GPS Coordinates & Landmark: Exact Pin (13.0827° N, 80.2707° E)"
    ]
    cy_tier = bot_y + 65
    for t in tiers:
        draw.text((b3_x + 25, cy_tier), f"• {t}", fill="#cbd5e1", font=f_arch_body)
        cy_tier += 32

    # Save to high quality JPG
    out_path = r"e:\civic issue\civic-ai\CIVIC_AI_WORKFLOW_A3.jpg"
    img.save(out_path, "JPEG", quality=95, dpi=(300, 300))
    print(f"Poster successfully generated at: {out_path}")

if __name__ == "__main__":
    create_a3_workflow_poster()
