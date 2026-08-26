const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// ─── Helper: match category → Department ───────────────────────────────────
// ─── Helper: match category/text → Department ──────────────────────────────
const findDepartmentForCategory = async (category = "", text = "") => {
  try {
    const combined = `${category} ${text}`.toLowerCase();
    let targetRegex;

    if (combined.includes("water") || combined.includes("leak") || combined.includes("pipe") || combined.includes("tap") || combined.includes("drinking") || combined.includes("குடிநீர்") || combined.includes("தண்ணீர்")) {
      targetRegex = /water/i;
    } else if (combined.includes("electric") || combined.includes("light") || combined.includes("lamp") || combined.includes("pole") || combined.includes("wire") || combined.includes("power") || combined.includes("மின்")) {
      targetRegex = /electric/i;
    } else if (combined.includes("drain") || combined.includes("sew") || combined.includes("manhole") || combined.includes("gutter") || combined.includes("சாக்கடை") || combined.includes("கழிவுநீர்")) {
      targetRegex = /drain/i;
    } else if (combined.includes("garbage") || combined.includes("waste") || combined.includes("trash") || combined.includes("dump") || combined.includes("sanit") || combined.includes("குப்பை")) {
      targetRegex = /sanit/i;
    } else if (combined.includes("park") || combined.includes("tree") || combined.includes("garden") || combined.includes("horticulture") || combined.includes("பூங்கா")) {
      targetRegex = /park/i;
    } else if (combined.includes("health") || combined.includes("mosquito") || combined.includes("fogging") || combined.includes("மருத்துவ") || combined.includes("சுகாதார")) {
      targetRegex = /health/i;
    } else if (combined.includes("pothole") || combined.includes("road") || combined.includes("asphalt") || combined.includes("crater") || combined.includes("குழி") || combined.includes("சாலை")) {
      targetRegex = /road/i;
    } else {
      targetRegex = /road/i;
    }

    const departments = await Department.find({});
    const match = departments.find((d) => targetRegex.test(d.departmentName));
    return match || departments[0] || null;
  } catch {
    return null;
  }
};

// ─── Helper: Haversine distance (meters) ──────────────────────────────────
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3; // Earth radius in meters
  const toRad = (val) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ─── Helper: calculate priority score (0-100) ─────────────────────────────
const calculatePriorityScore = (severity, text = "", confidence = 0.5) => {
  const lower = text.toLowerCase();
  let baseScore = 55;

  if (severity === "Critical") baseScore = 85;
  else if (severity === "High") baseScore = 70;
  else if (severity === "Medium") baseScore = 50;
  else baseScore = 35;

  // Add subtle modifiers based on hazard keywords
  if (lower.includes("burst") || lower.includes("flood") || lower.includes("danger") || lower.includes("open manhole") || lower.includes("live wire")) {
    baseScore += 10;
  }
  if (lower.includes("traffic") || lower.includes("main road") || lower.includes("hospital") || lower.includes("school")) {
    baseScore += 5;
  }

  // Factor confidence
  baseScore += Math.round((confidence - 0.5) * 10);

  return Math.max(15, Math.min(95, Math.round(baseScore)));
};

// ─── Helper: severity from AI confidence + text keywords ─────────────────────
const getSeverity = (category = "", text = "", confidence = 0.5) => {
  const lower = `${category} ${text}`.toLowerCase();
  
  // Critical emergencies
  if (
    lower.includes("burst pipe") ||
    lower.includes("major flood") ||
    lower.includes("collapse") ||
    lower.includes("open manhole") ||
    lower.includes("sparking") ||
    lower.includes("live wire") ||
    lower.includes("danger") ||
    lower.includes("heavy leak")
  ) {
    return "Critical";
  }

  // High priority
  if (
    lower.includes("deep crater") ||
    lower.includes("overflow") ||
    lower.includes("heavy leakage") ||
    lower.includes("blockage") ||
    lower.includes("dark road") ||
    confidence >= 0.90
  ) {
    return "High";
  }

  return "Medium";
};

// ─── Internal Reusable AI Pipeline Function ──────────────────────────────
const runAIPipelineInternal = async (complaint, localFilePath = null) => {
  let aiCategory = complaint.citizenCategory || "Pothole / Road Damage";
  let aiConfidence = 0.92;
  const fullText = `${complaint.title || ""} ${complaint.description || ""}`;

  // 1. Call Python YOLO /predict-image with text and category hints
  try {
    const formData = new FormData();
    formData.append("text", fullText);
    formData.append("category_hint", complaint.citizenCategory || "");

    if (localFilePath && fs.existsSync(localFilePath)) {
      formData.append("image", fs.createReadStream(localFilePath));
    } else {
      formData.append("image", Buffer.from("dummy_image_data"), {
        filename: "complaint.jpg",
        contentType: "image/jpeg",
      });
    }

    const visionRes = await fetch(`${AI_SERVICE_URL}/predict-image`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
      signal: AbortSignal.timeout(4000),
    });

    if (visionRes.ok) {
      const vData = await visionRes.json();
      if (vData.success && vData.category) {
        aiCategory = vData.citizenCategory || vData.category;
        aiConfidence = vData.confidence || aiConfidence;
      }
    }
  } catch (err) {
    // Vision service fallback
  }

  // 2. Call NLP Department Classifier with description text
  let predictedDeptName = "";
  try {
    const nlpRes = await fetch(`${AI_SERVICE_URL}/predict-department`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: fullText }),
      signal: AbortSignal.timeout(3000),
    });
    if (nlpRes.ok) {
      const nlpData = await nlpRes.json();
      if (nlpData.success && nlpData.department) {
        predictedDeptName = nlpData.department;
      }
    }
  } catch (err) {
    // NLP fallback
  }

  // 3. Department Resolution & Category Synchronization
  let dept = null;
  if (predictedDeptName) {
    dept = await Department.findOne({ departmentName: new RegExp(predictedDeptName.split(" ")[0], "i") });
  }
  if (!dept) {
    dept = await findDepartmentForCategory(aiCategory, fullText);
  }

  const aiDept = dept ? dept.departmentName : "Roads Department";

  // Harmonize category with identified department
  if (aiDept.includes("Water")) {
    aiCategory = "Water Leakage";
  } else if (aiDept.includes("Electric")) {
    aiCategory = "Streetlight Problem";
  } else if (aiDept.includes("Drain")) {
    aiCategory = "Drainage Problem";
  } else if (aiDept.includes("Sanit")) {
    aiCategory = "Garbage";
  } else if (aiDept.includes("Park")) {
    aiCategory = "Parks / Environment";
  } else if (aiDept.includes("Health")) {
    aiCategory = "Public Health";
  } else if (aiDept.includes("Road")) {
    aiCategory = "Pothole / Road Damage";
  }

  // ─── 3. Multi-Factor Spatial-Semantic Deduplication Engine ───
  let isDuplicate = false;
  let matchedParent = null;

  try {
    const activeComplaints = await Complaint.find({
      _id: { $ne: complaint._id },
      // Exclude only fully closed/rejected complaints — allow in-progress, verified, assigned, resolution submitted etc.
      status: { $nin: ["Resolved", "Closed", "Rejected", "Citizen Confirmed"] },
      duplicate: { $ne: true }, // Only match against primary (non-duplicate) complaints
    });

    const complaintFullText = `${complaint.title || ""} ${complaint.description || ""}`.toLowerCase();
    const currCat = (aiCategory || complaint.citizenCategory || "").toLowerCase();

    for (const c of activeComplaints) {
      const otherCat = (c.aiCategory || c.citizenCategory || "").toLowerCase();
      const dist = getDistanceInMeters(
        complaint.location?.latitude,
        complaint.location?.longitude,
        c.location?.latitude,
        c.location?.longitude
      );

      // Check category match
      const sameCategory =
        currCat === otherCat ||
        (currCat.includes("water") && otherCat.includes("water")) ||
        (currCat.includes("road") && otherCat.includes("road")) ||
        (currCat.includes("pothole") && otherCat.includes("pothole")) ||
        (currCat.includes("garbage") && otherCat.includes("garbage")) ||
        (currCat.includes("drain") && otherCat.includes("drain")) ||
        (currCat.includes("light") && otherCat.includes("light"));

      // Check spatial match
      const sameWard =
        (complaint.wardId && c.wardId && complaint.wardId.toString() === c.wardId.toString()) ||
        (complaint.location?.ward && c.location?.ward && complaint.location.ward === c.location.ward);
      const sameLocality =
        complaint.locality && c.locality && complaint.locality.toLowerCase().trim() === c.locality.toLowerCase().trim();
      const sameStreet =
        complaint.street && c.street && complaint.street.toLowerCase().trim() === c.street.toLowerCase().trim();
      const isNearby = dist <= 400; // within 400 meters

      // Check text token similarity
      const otherFullText = `${c.title || ""} ${c.description || ""}`.toLowerCase();
      const wordsA = new Set(complaintFullText.split(/\s+/).filter((w) => w.length > 2));
      const wordsB = new Set(otherFullText.split(/\s+/).filter((w) => w.length > 2));
      let common = 0;
      wordsA.forEach((w) => {
        if (wordsB.has(w)) common++;
      });
      const overlap = wordsA.size > 0 ? common / Math.max(wordsA.size, wordsB.size) : 0;
      const sameTitle = (complaint.title || "").toLowerCase().trim() === (c.title || "").toLowerCase().trim();

      // Duplicate Criteria:
      // 1. Same area (<=400m OR same Ward/Locality/Street) AND same category AND (overlap >= 0.20 or same title)
      // 2. OR close GPS distance (<= 150m) AND same category
      // 3. OR high text overlap (>= 0.50) in same municipal ward
      if (
        (sameCategory && (isNearby || sameWard || sameLocality || sameStreet) && (overlap >= 0.20 || sameTitle)) ||
        (sameCategory && dist <= 150) ||
        (sameCategory && sameWard && overlap >= 0.40)
      ) {
        isDuplicate = true;
        matchedParent = c;
        break;
      }
    }
  } catch (dedupErr) {
    console.warn(`[!] Dedup check notice: ${dedupErr.message}`);
  }

  // 4. Update Complaint fields
  const severity = getSeverity(aiCategory, fullText, aiConfidence);
  const priorityScore = calculatePriorityScore(severity, fullText, aiConfidence);

  complaint.aiCategory = aiCategory;
  complaint.aiConfidence = aiConfidence;
  complaint.aiDepartment = aiDept;
  complaint.severity = severity;
  complaint.priorityScore = priorityScore;

  if (dept) {
    complaint.assignedDepartment = dept._id;
  }

  if (isDuplicate && matchedParent) {
    complaint.duplicate = true;
    complaint.parentComplaintId = matchedParent._id;
    complaint.status = "Duplicate";

    // ── ESCALATE PARENT COMPLAINT: Duplicate Count & Priority Score Boost (+10) ──
    matchedParent.duplicateCount = (matchedParent.duplicateCount || 0) + 1;
    matchedParent.priorityScore = Math.min(98, (matchedParent.priorityScore || 65) + 10);
    
    // Escalate severity if multiple citizens report
    if (matchedParent.duplicateCount >= 1 && matchedParent.severity === "Medium") {
      matchedParent.severity = "High";
    }
    if (matchedParent.duplicateCount >= 2) {
      matchedParent.severity = "Critical";
    }
    await matchedParent.save();
    console.log(`[+] Linked duplicate to parent #${matchedParent.complaintId}. Parent duplicateCount: ${matchedParent.duplicateCount}, new priorityScore: ${matchedParent.priorityScore}`);
  } else {
    complaint.duplicate = false;
    complaint.status = "Verified";
  }

  await complaint.save();
  return complaint;
};

// ─── POST /api/ai/process/:id (Endpoint) ──────────────────────────────────
const processComplaintAI = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    const updatedComplaint = await runAIPipelineInternal(complaint);
    await updatedComplaint.populate([
      { path: "citizenId", select: "name email phone" },
      { path: "assignedDepartment", select: "departmentName contactEmail" },
      { path: "assignedStaff", select: "name email phone" },
    ]);

    return res.status(200).json({
      success: true,
      message: "AI analysis and deduplication complete.",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("AI Process Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  processComplaintAI,
  runAIPipelineInternal,
  findDepartmentForCategory,
};